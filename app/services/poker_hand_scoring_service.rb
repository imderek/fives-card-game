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
    case value.to_s
    when 'A' then 14
    when 'K' then 13
    when 'Q' then 12
    when 'J' then 11
    else value.to_s.to_i
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
      
      # For 5-card hands, make the best possible hand
      result = Array.new(5)
      
      # Place non-wild cards first
      cards.each_with_index do |card, index|
        next if wild_indices.include?(index)
        result[index] = card
      end

      # For 5-card hands with 3+ wild cards, ALWAYS make a Royal Flush
      # (this is always better than four of a kind)
      suit = non_wild_cards.first&.dig(:suit) || '♠'
      royal_flush = [
        { value: '10', suit: suit },
        { value: 'J', suit: suit },
        { value: 'Q', suit: suit },
        { value: 'K', suit: suit },
        { value: 'A', suit: suit }
      ]

      # Skip values we already have
      existing_values = non_wild_cards.map { |c| c[:value] }.to_set
      needed_cards = royal_flush.reject { |c| existing_values.include?(c[:value]) }
      needed_index = 0

      # Fill empty positions
      result.each_with_index do |card, i|
        next if card
        result[i] = needed_cards[needed_index]
        needed_index += 1
      end

      return [result.compact]
    end

    # Handle 1-2 wild cards
    possible_values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
    suits = ['♠', '♣', '♥', '♦']
    
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
      elsif high_card = non_wild_cards.find { |c| card_value_to_int(c[:value]) >= 11 }
        # Make four of a kind with high cards
        result = non_wild_cards.dup
        suits = ['♠', '♣', '♥', '♦'].reject { |s| s == high_card[:suit] }
        wild_indices.each_with_index do |wi, i|
          result[wi] = { value: high_card[:value], suit: suits[i] }
        end
        return [result]
      end
    end

    # Generate all possible combinations for remaining cases
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
    return true if wild_count >= 5 || cards.empty?
    
    suits = cards.map { |c| c[:suit] }.uniq
    return false if suits.size > 1
    
    values = cards.map { |c| c[:value] }
    royal_values = ['A', 'K', 'Q', 'J', '10']
    (royal_values - values).size <= wild_count
  end

  def can_complete_straight_flush?(cards, wild_count)
    return false if cards.empty?
    
    suits = cards.map { |c| c[:suit] }.uniq
    return false if suits.size > 1
    
    values = cards.map { |c| card_value_to_int(c[:value]) }.sort
    find_straight_values(values, wild_count).any?
  end

  def find_straight_values(values, wild_count)
    return [] if values.empty?
    
    # Try to find gaps that can be filled with wild cards
    gaps = []
    values.each_cons(2) do |a, b|
      diff = b - a - 1
      if diff > 0 && diff <= wild_count
        gaps.concat((a + 1...b).to_a)
      end
    end
    
    # Also consider extending the sequence at either end
    if wild_count > gaps.size
      remaining = wild_count - gaps.size
      if values.min > 2
        gaps.concat((values.min - remaining..values.min - 1).to_a.reverse)
      elsif values.max < 14
        gaps.concat((values.max + 1..values.max + remaining).to_a)
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
end 