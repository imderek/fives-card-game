class Deal < ApplicationRecord
  belongs_to :organization
  belongs_to :owner, class_name: 'User', optional: true
  has_many :contact_deals, dependent: :destroy
  has_many :contacts, through: :contact_deals
  has_many :tasks, dependent: :destroy
end

