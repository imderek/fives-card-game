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
  email: "Derek",
  password: Rails.env.development? ? "demo" : "production",
  organization_id: org.id 
)

# Create fake users
[
  "John D",
  "Jane S", 
  "Bob W",
  "Mary J",
  "James B",
  "Sarah D",
  "Michael M"
].each do |name|
  User.create!(
    email: name,
    password: SecureRandom.hex(10),
    organization_id: org.id
  )
end


# Create bot users for different difficulties
['easy bot', 'medium bot', 'hard bot'].each do |difficulty|
  User.create!(
    email: difficulty,
    password: SecureRandom.hex(10),
    organization_id: org.id
  )
end

# Create organization memberships
OrganizationMembership.create!([
  { organization_id: org.id, user_id: user.id, role: "admin" }
])

# Create 3 completed games for each user
User.where("email NOT LIKE ?", "%bot%").each do |user|
  3.times do
    bot_player = User.where("email LIKE ?", "%bot%").sample
    
    # Random scores between 1000-5000, rounded to nearest hundred
    player1_score = (rand(1000..5000) / 100.0).round * 100
    player2_score = (rand(1000..5000) / 100.0).round * 100
    
    # Determine winner based on scores
    winner_id = player1_score > player2_score ? user.id : bot_player.id
    
    Game.create!(
      player1: user,
      player2: bot_player,
      status: :completed,
      player1_total_score: player1_score, 
      player2_total_score: player2_score,
      winner_id: winner_id,
      created_at: rand(2.weeks.ago..Time.current)
    )
  end
end

# Create a specific game with Derek having powerful hands
derek = User.find_by("LOWER(email) = ?", "derek")
bot = User.where("email LIKE ?", "%bot%").first

# Create a game with powerful hands
DemoGameCreator.create_game(
  player1: derek,
  player2: bot,
  scenario: :powerful_hands
)

# Or create a game with beginner-friendly hands
DemoGameCreator.create_game(
  player1: derek,
  player2: bot,
  scenario: :beginner
)

puts "DB seeding complete!"