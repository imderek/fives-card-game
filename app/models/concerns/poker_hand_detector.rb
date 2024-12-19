module PokerHandDetector
  def detect_hand(cards)
    return nil if cards.length < 5
    return nil if cards.length > 5

    values = cards.map { |code| code[0..-2] }
    suits = cards.map { |code| code[-1] }
    
    # Convert face cards to numbers for easier sorting
    numeric_values = values.map do |val|
      case val
      when 'A' then 14
      when 'K' then 13
      when 'Q' then 12
      when 'J' then 11
      else val.to_i
      end
    end.sort

    if royal_flush?(numeric_values, suits)
      "Royal Flush"
    elsif straight_flush?(numeric_values, suits)
      "Straight Flush"
    elsif four_of_a_kind?(numeric_values)
      "Quads"
    elsif full_house?(numeric_values)
      "Full House"
    elsif flush?(suits)
      "Flush"
    elsif straight?(numeric_values)
      "Straight"
    elsif three_of_a_kind?(numeric_values)
      "Trips"
    elsif two_pair?(numeric_values)
      "Two Pair"
    elsif one_pair?(numeric_values)
      "Pair"
    else
      "High Card"
    end
  end

  def detect_partial_hand(cards)
    return nil if cards.empty?
    
    values = cards.map { |code| code[0..-2] }
    suits = cards.map { |code| code[-1] }
    value_counts = values.tally
    
    case cards.length
    when 1
      "High Card"
    when 2
      if value_counts.values.max == 2
        "Pair"
      else
        "High Card"
      end
    when 3
      if value_counts.values.max == 3
        "Trips"
      elsif value_counts.values.max == 2
        "Pair"
      else
        "High Card"
      end
    when 4
      if value_counts.values.max == 4
        "Quads"
      elsif value_counts.values.max == 3
        "Trips"
      elsif value_counts.values.count { |v| v == 2 } == 2
        "Two Pair"
      elsif value_counts.values.max == 2
        "Pair"
      else
        "High Card"
      end
    else
      detect_hand(cards) # Use existing full hand detection for 5 cards
    end
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

  private

  def royal_flush?(values, suits)
    straight_flush?(values, suits) && values.min == 10
  end

  def straight_flush?(values, suits)
    straight?(values) && flush?(suits)
  end

  def four_of_a_kind?(values)
    values.tally.values.include?(4)
  end

  def full_house?(values)
    tally = values.tally.values
    tally.include?(3) && tally.include?(2)
  end

  def flush?(suits)
    suits.uniq.length == 1
  end

  def straight?(values)
    (values.min..values.max).to_a == values ||
      values == [2, 3, 4, 5, 14]  # Ace-low straight
  end

  def three_of_a_kind?(values)
    values.tally.values.include?(3)
  end

  def two_pair?(values)
    values.tally.values.count(2) == 2
  end

  def one_pair?(values)
    values.tally.values.include?(2)
  end
end 