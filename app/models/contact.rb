class Contact < ApplicationRecord
  belongs_to :organization
  has_many :contact_deals, dependent: :destroy
  has_many :deals, through: :contact_deals

  def name
    "#{first_name} #{last_name}"
  end
end
