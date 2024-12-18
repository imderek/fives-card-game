class Card
  def self.value_to_number(value)
    case value.to_s
    when 'A' then 14
    when 'K' then 13
    when 'Q' then 12
    when 'J' then 11
    else value.to_i
    end
  end
end 