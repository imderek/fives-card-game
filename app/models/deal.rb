class Deal < ApplicationRecord
  belongs_to :organization
  has_many :contact_deals, dependent: :destroy
  has_many :contacts, through: :contact_deals
  has_many :tasks, dependent: :destroy
end

