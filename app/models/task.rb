class Task < ApplicationRecord
  belongs_to :deal
  
  validates :title, presence: true
  validates :status, inclusion: { in: %w[pending in_progress completed] }
end 