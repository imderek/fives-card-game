class ProductOption < ApplicationRecord
  belongs_to :product
  belongs_to :variant

  scope :by_variant, -> (variant) { where(variant: variant) }
end