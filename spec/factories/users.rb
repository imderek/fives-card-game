FactoryBot.define do
  factory :user do
    sequence(:first_name) { |n| "Player" }
    sequence(:last_name) { |n| "#{n}" }
    sequence(:email) { |n| "player#{n}@example.com" }
    password { "password123" }
    is_active { true }
    association :organization
  end
end 