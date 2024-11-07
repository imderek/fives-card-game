class Variant < ApplicationRecord
    has_many :product_options
    has_many :products, through: :product_options
  
    scope :by_attr, -> (option_type, value) {
      where(option_type: option_type, value: value)
    }
  end