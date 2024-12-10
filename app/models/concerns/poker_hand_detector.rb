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
      "Four of a Kind"
    elsif full_house?(numeric_values)
      "Full House"
    elsif flush?(suits)
      "Flush"
    elsif straight?(numeric_values)
      "Straight"
    elsif three_of_a_kind?(numeric_values)
      "Three of a Kind"
    elsif two_pair?(numeric_values)
      "Two Pair"
    elsif one_pair?(numeric_values)
      "One Pair"
    else
      "High Card"
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