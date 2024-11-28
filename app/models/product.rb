class Product < ApplicationRecord
  belongs_to :brand
  has_many :product_options
  has_many :variants, through: :product_options

  scope :with_variant, -> (variant) {
    joins(:product_options).merge(ProductOption.by_variant(variant))
  }
end
