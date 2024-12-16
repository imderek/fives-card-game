# This file contains seed data for products and brands in the beauty industry.
# The data can be loaded with the bin/rails db:seed command.

# Reset all tables
OrganizationMembership.destroy_all
Game.destroy_all
User.destroy_all
Organization.destroy_all

# Create organizations
org = Organization.create!(
  name: "Acme Corporation"
)

# Create users
user = User.create!(
  email: "demo@demo.com",
  password: Rails.env.development? ? "demo" : "production",
  organization_id: org.id 
)

# Create bot users for different difficulties
['easy', 'medium', 'hard'].each do |difficulty|
  User.create!(
    email: "bot_#{difficulty}@example.com",
    password: SecureRandom.hex(10),
    organization_id: org.id
  )
end

# Create organization memberships
OrganizationMembership.create!([
  { organization_id: org.id, user_id: user.id, role: "admin" }
])

puts "DB seeding complete!"
