class UserPreference < ApplicationRecord
  belongs_to :user
  
  validates :key, presence: true, uniqueness: { scope: :user_id }
  validates :value_type, presence: true
  
  def typed_value
    case value_type
    when 'boolean'
      ActiveModel::Type::Boolean.new.cast(value)
    when 'integer'
      value.to_i
    when 'float'
      value.to_f
    when 'array'
      JSON.parse(value)
    else
      value
    end
  end
end 