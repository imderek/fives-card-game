class GameCompletionService
  def initialize(game)
    @game = game
  end

  def score_partial_hand(cards)
    return 0 if cards.empty?
    
    values = cards.map { |card| card_value_to_int(card[:value]) }
    suits = cards.map { |card| card[:suit] }
    value_counts = values.tally
    high_card = values.max
    
    case cards.length
    when 1
      high_card # Single card score
    when 2..4
      if value_counts.values.max == 4
        700 + high_card # Quads
      elsif value_counts.values.max == 3
        300 + high_card # Trips
      elsif value_counts.values.count { |v| v == 2 } == 2
        200 + high_card # Two Pair
      elsif value_counts.values.max == 2
        100 + high_card # Pair
      else
        high_card # High Card
      end
    else
      score_poker_hand(cards) # Use existing full hand scoring for 5 cards
    end
  end

  def check_for_winner
    return unless board_full?
    
    player1_score = calculate_player_score(@game.player1_id)
    player2_score = calculate_player_score(@game.player2_id)
    
    @game.update(
      status: :completed,
      winner_id: determine_winner(player1_score, player2_score)
    )
  end

  def board_full?
    # Check player 1's columns (0-3)
    player1_full = (0..3).all? do |column|
      @game.board_cards.count { |card| card[:player_id] == @game.player1_id && card[:column] == column } >= 5
    end

    # Check player 2's columns (4-7)
    player2_full = (4..7).all? do |column|
      @game.board_cards.count { |card| card[:player_id] == @game.player2_id && card[:column] == column } >= 5
    end

    player1_full && player2_full
  end

  def calculate_player_score(player_id)
    column_range = player_id == @game.player1_id ? (0..3) : (4..7)
    
    column_range.sum do |column|
      cards = @game.board_cards.select { |card| card[:player_id] == player_id && card[:column] == column }
      score_poker_hand(cards)
    end
  end

  private

  def card_value_to_int(value)
    case value
    when 'A' then 14
    when 'K' then 13
    when 'Q' then 12
    when 'J' then 11
    else value.to_i
    end
  end

  def score_poker_hand(cards)
    return 0 if cards.empty?
    
    values = cards.map { |card| card_value_to_int(card[:value]) }
    suits = cards.map { |card| card[:suit] }
    
    # Score different poker hands (from highest to lowest)
    if royal_flush?(values, suits)
      1000  # Royal Flush
    elsif straight_flush?(values, suits)
      800   # Straight Flush
    elsif four_of_a_kind?(values)
      700 + values.max  # Quads + high card value
    elsif full_house?(values)
      # Add the value of the Trips cards to the base score
      three_of_a_kind_value = values.tally.find { |_, count| count == 3 }&.first || 0
      600 + three_of_a_kind_value  # Full House + Trips value
    elsif flush?(suits)
      500 + values.max  # Flush + high card value
    elsif straight?(values)
      400   # Straight
    elsif three_of_a_kind?(values)
      # Add the value of the three matching cards
      three_of_a_kind_value = values.tally.find { |_, count| count == 3 }&.first || 0
      300 + three_of_a_kind_value  # Trips + card value
    elsif two_pair?(values)
      200   # Two Pair
    elsif one_pair?(values)
      100 + values.max  # Pair + high card value
    else
      values.max # High Card
    end
  end

  def royal_flush?(values, suits)
    straight_flush?(values, suits) && values.max == 14  # Ace high
  end

  def straight_flush?(values, suits)
    straight?(values) && flush?(suits)
  end

  def four_of_a_kind?(values)
    values.tally.any? { |_, count| count >= 4 }
  end

  def full_house?(values)
    tally = values.tally
    tally.any? { |_, count| count >= 3 } && tally.any? { |_, count| count >= 2 }
  end

  def flush?(suits)
    suits.uniq.size == 1
  end

  def straight?(values)
    sorted = values.sort
    return true if sorted == [2, 3, 4, 5, 14]  # Ace-low straight
    sorted.each_cons(2).all? { |a, b| b == a + 1 }
  end

  def three_of_a_kind?(values)
    values.tally.any? { |_, count| count >= 3 }
  end

  def two_pair?(values)
    values.tally.count { |_, count| count >= 2 } >= 2
  end

  def one_pair?(values)
    values.tally.any? { |_, count| count >= 2 }
  end

  def highest_card(values)
    values.max
  end

  def determine_winner(player1_score, player2_score)
    return nil if player1_score == player2_score
    player1_score > player2_score ? @game.player1_id : @game.player2_id
  end
end 