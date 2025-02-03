class PokerHandScoringService
  def score_hand(cards)
    return 0 if cards.empty?
    
    # Generate all possible hands by replacing wild cards
    possible_hands = generate_possible_hands(cards)
    
    # Score each possible hand and return the highest score
    possible_hands.map { |hand| score_concrete_hand(hand) }.max
  end

  def score_concrete_hand(cards)
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
    
    score_partial_hand(cards)
  end

  def score_partial_hand(cards)
    return 0 if cards.empty?
    
    values = cards.map { |card| card_value_to_int(card[:value]) }
    
    return 700 if four_of_a_kind?(values)          # Quads
    return 300 if three_of_a_kind?(values)         # Trips
    return 200 if two_pair?(values)                # Two Pair
    return 100 if one_pair?(values)                # Pair
    values.max # High Card
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
    
    # Must have exactly one Trips and one pair
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
    # Must have exactly one Trips and no pairs
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

  def generate_possible_hands(cards)
    # Update wild card detection to check for 'W' prefix
    wild_indices = cards.each_with_index.select { |card, _| 
      card[:value].to_s.start_with?('W') && card[:suit] == '★'
    }.map(&:last)
    
    return [cards] if wild_indices.empty?

    # All possible regular card values
    possible_values = ('2'..'10').to_a + ['J', 'Q', 'K', 'A']
    suits = ['♠', '♣', '♥', '♦']

    # Generate all combinations
    combinations = possible_values.product(suits)
    generate_combinations(cards, wild_indices, combinations)
  end

  def generate_combinations(cards, wild_indices, combinations, current_index = 0)
    return [cards.dup] if current_index >= wild_indices.size

    result = []
    combinations.each do |value, suit|
      new_cards = cards.dup
      new_cards[wild_indices[current_index]] = { value: value, suit: suit }
      result.concat(generate_combinations(new_cards, wild_indices, combinations, current_index + 1))
    end
    result
  end
end 