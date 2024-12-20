class GameCompletionService
  def initialize(game)
    @game = game
  end

  def score_partial_hand(cards)
    return 0 if cards.empty?
    score_poker_hand(cards)
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
    
    # For 5-card hands
    if cards.length == 5
      return 1000 if royal_flush?(values, suits)    # Royal Flush
      return 800 if straight_flush?(values, suits)  # Straight Flush
      return 700 if four_of_a_kind?(values)        # Quads
      return 600 if full_house?(values)            # Full House
      return 500 if flush?(suits)                  # Flush
      return 400 if straight?(values)              # Straight
      return 300 if three_of_a_kind?(values)       # Trips
      return 200 if two_pair?(values)              # Two Pair
      return 100 if one_pair?(values)              # Pair
    end
    
    # For hands with fewer than 5 cards
    return 700 if four_of_a_kind?(values)          # Quads
    return 300 if three_of_a_kind?(values)         # Trips
    return 200 if two_pair?(values)                # Two Pair
    return 100 if one_pair?(values)                # Pair
    values.max # High Card
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
    three_count = tally.values.count(3)
    pair_count = tally.values.count(2)
    
    # Must have exactly one three of a kind and one pair
    three_count == 1 && pair_count == 1
  end

  def flush?(suits)
    suits.uniq.size == 1 && suits.size == 5  # Added check for exactly 5 cards
  end

  def straight?(values)
    sorted = values.sort
    return true if sorted == [2, 3, 4, 5, 14]  # Ace-low straight
    sorted.each_cons(2).all? { |a, b| b == a + 1 }
  end

  def three_of_a_kind?(values)
    tally = values.tally
    # Must have exactly one three of a kind and no pairs
    three_count = tally.values.count(3)
    pair_count = tally.values.count(2)
    
    three_count == 1 && pair_count == 0
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