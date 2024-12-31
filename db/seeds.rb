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

game = Game.new(
  player1: derek,
  player2: bot,
  status: "waiting",
  game_type: "pvp",
  turn_phase: "play_card",
  current_turn: derek.id,
  player1_hand: [
    {suit: "♠", value: "2"},
    {suit: "♥", value: "3"},
    {suit: "♦", value: "4"},
    {suit: "♣", value: "5"},
    {suit: "♠", value: "6"}
  ],
  player2_hand: [
    {suit: "♣", value: "10"},
    {suit: "♦", value: "J"}, 
    {suit: "♥", value: "Q"},
    {suit: "♠", value: "K"},
    {suit: "♣", value: "A"}
  ],
  board_cards: [
    # Player 1's columns (0-3)
    # Straight in column 0
    {suit: "♥", value: "2", player_id: derek.id, column: 0},
    {suit: "♣", value: "3", player_id: derek.id, column: 0},
    {suit: "♦", value: "4", player_id: derek.id, column: 0},
    {suit: "♠", value: "5", player_id: derek.id, column: 0},
    {suit: "♥", value: "6", player_id: derek.id, column: 0},

    # Flush in column 1
    {suit: "♥", value: "2", player_id: derek.id, column: 1},
    {suit: "♥", value: "5", player_id: derek.id, column: 1},
    {suit: "♥", value: "8", player_id: derek.id, column: 1},
    {suit: "♥", value: "J", player_id: derek.id, column: 1},
    {suit: "♥", value: "K", player_id: derek.id, column: 1},

    # Full House in column 2
    {suit: "♠", value: "J", player_id: derek.id, column: 2},
    {suit: "♥", value: "J", player_id: derek.id, column: 2},
    {suit: "♦", value: "J", player_id: derek.id, column: 2},
    {suit: "♣", value: "4", player_id: derek.id, column: 2},
    {suit: "♦", value: "4", player_id: derek.id, column: 2},

    # Quads in column 3 (4 cards only)
    {suit: "♠", value: "A", player_id: derek.id, column: 3},
    {suit: "♥", value: "A", player_id: derek.id, column: 3},
    {suit: "♦", value: "A", player_id: derek.id, column: 3},
    {suit: "♣", value: "A", player_id: derek.id, column: 3},

    # Player 2's columns (4-7)
    # Trips in column 4
    # High Card in column 4 (4 cards only)
    {suit: "♦", value: "K", player_id: bot.id, column: 4},
    {suit: "♣", value: "2", player_id: bot.id, column: 4},
    {suit: "♠", value: "3", player_id: bot.id, column: 4},
    {suit: "♥", value: "9", player_id: bot.id, column: 4},

    # Pair in column 5
    {suit: "♠", value: "10", player_id: bot.id, column: 5},
    {suit: "♥", value: "10", player_id: bot.id, column: 5},
    {suit: "♦", value: "5", player_id: bot.id, column: 5},
    {suit: "♣", value: "6", player_id: bot.id, column: 5},
    {suit: "♠", value: "9", player_id: bot.id, column: 5},

    # Two Pair in column 6
    {suit: "♠", value: "8", player_id: bot.id, column: 6},
    {suit: "♣", value: "8", player_id: bot.id, column: 6},
    {suit: "♥", value: "7", player_id: bot.id, column: 6},
    {suit: "♣", value: "7", player_id: bot.id, column: 6},
    {suit: "♦", value: "3", player_id: bot.id, column: 6},

    # Trips in column 7
    {suit: "♠", value: "Q", player_id: bot.id, column: 7},
    {suit: "♦", value: "Q", player_id: bot.id, column: 7},
    {suit: "♣", value: "Q", player_id: bot.id, column: 7},
    {suit: "♥", value: "4", player_id: bot.id, column: 7},
    {suit: "♦", value: "7", player_id: bot.id, column: 7}
  ]
)

# Generate remaining deck (excluding cards in play)
used_cards = (game.board_cards + game.player1_hand + game.player2_hand).map { |card| "#{card[:suit]}#{card[:value]}" }
all_cards = []
['♠', '♣', '♥', '♦'].each do |suit|
  ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].each do |value|
    card_key = "#{suit}#{value}"
    all_cards << {suit: suit, value: value} unless used_cards.include?(card_key)
  end
end
game.deck = all_cards.shuffle

game.instance_variable_set(:@skip_setup, true)
game.save!

# Calculate scores
current_scores = {}

# Score player 1's columns (0-3)
(0..3).each do |col|
  cards = game.board_cards_for_player(game.player1_id, col)
  current_scores[col.to_s] = GameCompletionService.new(game).score_partial_hand(cards)
end

# Score player 2's columns (4-7)
(4..7).each do |col|
  cards = game.board_cards_for_player(game.player2_id, col)
  current_scores[col.to_s] = GameCompletionService.new(game).score_partial_hand(cards)
end

game.update!(column_scores: current_scores)

puts "DB seeding complete!"