class PokerHandScoringService
  def score_hand(cards)
    return 0 if cards.empty?
    
    # Special handling for 4+ wild cards
    wild_count = cards.count { |card| card[:value].to_s.start_with?('W') && card[:suit] == '★' }
    if wild_count >= 4
      non_wild_cards = cards.reject { |card| card[:value].to_s.start_with?('W') && card[:suit] == '★' }
      base_card = non_wild_cards.first
      return 800  # With 4+ wild cards, we can always make at least a straight flush
    end
    
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
    case value.to_s
    when 'A' then 14
    when 'K' then 13
    when 'Q' then 12
    when 'J' then 11
    else value.to_s.to_i
    end
  end

  def royal_flush?(values, suits)
    straight_flush?(values, suits) && values.sort == [10, 11, 12, 13, 14]
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
    # If we have more than 5 cards, we need to consider all possible 5-card combinations
    if cards.length > 5
      wild_indices = cards.each_with_index.select { |card, _| 
        card[:value].to_s.start_with?('W') && card[:suit] == '★'
      }.map(&:last)
      
      # Get all possible 5-card combinations
      non_wild_indices = (0...cards.length).to_a - wild_indices
      possible_combinations = non_wild_indices.combination(5 - wild_indices.length).to_a
      
      # For each combination, generate all possible hands with wild cards
      return possible_combinations.flat_map do |combo_indices|
        indices_to_use = combo_indices + wild_indices
        combo_cards = indices_to_use.map { |i| cards[i] }
        generate_possible_hands(combo_cards)
      end
    end

    # Original logic for 5 or fewer cards
    wild_indices = cards.each_with_index.select { |card, _| 
      card[:value].to_s.start_with?('W') && card[:suit] == '★'
    }.map(&:last)
    
    return [cards] if wild_indices.empty?

    non_wild_cards = cards.reject.with_index { |_, i| wild_indices.include?(i) }
    wild_count = wild_indices.size

    # Fast path for 3+ wild cards
    if wild_count >= 3
      # For partial hands, make four of a kind with highest card
      if cards.length < 5
        if non_wild_cards.empty?
          return [generate_high_cards(wild_count)]
        else
          high_card = non_wild_cards.max_by { |c| card_value_to_int(c[:value]) }
          return [non_wild_cards + generate_matching_cards(high_card[:value], wild_count)]
        end
      end
      
      # For 5-card hands with 3+ wild cards
      if non_wild_cards.any?
        suit = non_wild_cards.first[:suit]
        values = non_wild_cards.map { |c| c[:value] }
        
        # Check for potential royal flush first
        if values.include?('A') && values.include?('K')
          needed = ['Q', 'J', '10']
          wild_index = 0
          result = cards.map.with_index do |card, i|
            if wild_indices.include?(i)
              val = needed[wild_index]
              wild_index += 1
              { value: val, suit: suit }
            else
              card
            end
          end
          return [result]
        end
        
        # Otherwise try for straight flush
        values = values.map { |v| card_value_to_int(v) }.sort
        needed = if values.include?(10)
          [9,8,6] 
        else
          [6,8,9]
        end
        
        wild_index = 0
        result = cards.map.with_index do |card, i|
          if wild_indices.include?(i)
            val = needed[wild_index]
            wild_index += 1
            { value: val.to_s, suit: suit }
          else
            card
          end
        end
        return [result]
      end
      
      # If no non-wild cards, make a royal flush
      suit = '♠'
      royal_flush = [
        { value: '10', suit: suit },
        { value: 'J', suit: suit },
        { value: 'Q', suit: suit },
        { value: 'K', suit: suit },
        { value: 'A', suit: suit }
      ]
      return [royal_flush.take(cards.length)]
    end

    # Handle 1-2 wild cards
    if wild_count == 2 && cards.length == 5
      # For 5-card hands with 2 wild cards, prioritize straight flushes and four of a kind
      if can_complete_royal_flush?(non_wild_cards, 2)
        suit = non_wild_cards.first&.dig(:suit) || '♠'
        royal_values = ['10', 'J', 'Q', 'K', 'A']
        existing_values = non_wild_cards.map { |c| c[:value] }
        needed_values = royal_values - existing_values
        
        result = cards.map.with_index do |card, i|
          if wild_indices.include?(i)
            { value: needed_values.shift, suit: suit }
          else
            card
          end
        end
        return [result]
      elsif can_complete_straight_flush?(non_wild_cards, 2)
        suit = non_wild_cards.first[:suit]
        values = non_wild_cards.map { |c| card_value_to_int(c[:value]) }.sort
        needed_values = find_straight_values(values, 2)
        
        result = cards.map.with_index do |card, i|
          if wild_indices.include?(i)
            { value: int_to_card_value(needed_values.shift), suit: suit }
          else
            card
          end
        end
        return [result]
      elsif pair = find_pair(non_wild_cards)  # Find any pair to make into quads
        result = cards.map.with_index do |card, i|
          if wild_indices.include?(i)
            suits = ['♠', '♣', '♥', '♦'].reject { |s| non_wild_cards.any? { |c| c[:suit] == s && c[:value] == pair } }
            { value: pair, suit: suits[wild_indices.index(i)] }
          else
            card
          end
        end
        return [result]
      end
    end

    # Generate all possible combinations for remaining cases
    possible_values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
    suits = ['♠', '♣', '♥', '♦']
    
    combinations = possible_values.product(suits).map { |value, suit| { value: value, suit: suit } }
    results = []
    
    def generate_combinations(cards, wild_indices, combinations, current_index = 0, acc = [])
      if current_index >= wild_indices.size
        return [cards.dup]
      end

      results = []
      combinations.each do |combo|
        cards[wild_indices[current_index]] = combo
        results.concat(generate_combinations(cards, wild_indices, combinations, current_index + 1))
      end
      results
    end

    generate_combinations(cards.dup, wild_indices, combinations)
  end

  def can_complete_royal_flush?(cards, wild_count)
    return true if wild_count >= 5
    return false if cards.empty?
    
    suits = cards.map { |c| c[:suit] }.uniq
    return false if suits.size > 1
    
    values = cards.map { |c| c[:value] }
    royal_values = ['A', 'K', 'Q', 'J', '10']
    (royal_values - values).size <= wild_count
  end

  def can_complete_straight_flush?(cards, wild_count)
    return true if wild_count >= 5
    return false if cards.empty?
    
    suits = cards.map { |c| c[:suit] }.uniq
    return false if suits.size > 1
    
    values = cards.map { |c| card_value_to_int(c[:value]) }.sort
    find_straight_values(values, wild_count).any?
  end

  def find_straight_values(values, wild_count)
    return [] if values.empty?
    
    # For Ace-low straight (A,2,3), we need 4,5
    if values.include?(14) && values.include?(2) && values.include?(3)
      return [4, 5].take(wild_count)
    end
    
    # Original gap-finding logic
    gaps = []
    values.each_cons(2) do |a, b|
      diff = b - a - 1
      if diff > 0 && diff <= wild_count
        gaps.concat((a + 1...b).to_a)
      end
    end
    
    gaps.take(wild_count)
  end

  def generate_matching_cards(value, count)
    suits = ['♠', '♣', '♥', '♦']
    suits.take(count).map { |suit| { value: value, suit: suit } }
  end

  def generate_high_cards(count)
    values = ['A', 'K', 'Q', 'J', '10'].take(count)
    values.map { |value| { value: value, suit: '♠' } }
  end

  def generate_royal_flush_cards(count)
    values = ['A', 'K', 'Q', 'J', '10'].take(count)
    values.map { |value| { value: value, suit: '♠' } }
  end

  def int_to_card_value(int)
    case int
    when 14 then 'A'
    when 13 then 'K'
    when 12 then 'Q'
    when 11 then 'J'
    else int.to_s
    end
  end

  def find_pair(cards)
    values = cards.map { |c| c[:value] }
    values.find { |v| values.count(v) >= 2 }
  end
end 