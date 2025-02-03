class Game < ApplicationRecord
  belongs_to :player1, class_name: 'User'
  belongs_to :player2, class_name: 'User', optional: true # optional for bot games
  belongs_to :winner, class_name: 'User', optional: true
  
  serialize :player1_hand, coder: YAML
  serialize :player2_hand, coder: YAML
  serialize :board_cards, coder: YAML
  serialize :deck, coder: YAML
  serialize :player1_discard_pile, coder: YAML
  serialize :player2_discard_pile, coder: YAML
  
  enum :status, [:waiting, :in_progress, :completed]
  enum :game_type, [:pvp, :bot]
  enum :turn_phase, [:play_card, :draw_card], default: :play_card
  
  scope :completed, -> { where(status: :completed) }
  
  before_create :setup_initial_game_state
  
  def broadcast_game_state
    return if skip_broadcast
    
    # Broadcast through GameChannel
    GameChannel.broadcast_update(self)
  end
  
  after_update_commit :broadcast_game_state
  
  attr_accessor :skip_broadcast
  
  def current_player_can_draw?(user_id)
    current_turn == user_id && turn_phase == "draw_card"
  end
  
  def current_player_can_play?(user_id)
    current_turn == user_id && turn_phase == "play_card"
  end
  
  def end_turn
    self.turn_phase = :play_card
    self.current_turn = current_turn == player1_id ? player2_id : player1_id
    save
  end
  
  def board_cards_for_player(player_id, column = nil)
    return [] if board_cards.nil?
    
    filtered_cards = board_cards.select do |card|
      card[:player_id] == player_id && 
      (column.nil? || card[:column].to_i == column.to_i)
    end
    
    filtered_cards || []
  end
  
  def find_card(card_code)
    {
      value: card_code[0..-2],
      suit: card_code[-1].downcase
    }
  end
  
  def card_to_code(card)
    "#{card[:value]}#{card[:suit].first.upcase}"
  end
  
  def code_to_card(code)
    {
      value: code[0..-2],
      suit: code[-1].downcase
    }
  end
  
  def valid_move?(card)
    # Convert column to integer if it's a string
    column_index = card[:column].to_i
    
    # Get cards in the target column for this player
    column_cards = board_cards_for_player(card[:player_id], column_index)
    
    # Check if column is full (max 5 cards)
    return false if column_cards.length >= 5
    
    # Check if it's the player's turn
    return false if card[:player_id] != current_turn
    
    # Check if the card is in the player's hand
    player_hand = card[:player_id] == player1_id ? player1_hand : player2_hand
    card_in_hand = player_hand.any? { |hand_card| 
      hand_card[:suit] == card[:suit] && hand_card[:value] == card[:value]
    }
    
    # Check if the column is valid for the player
    valid_columns = card[:player_id] == player1_id ? (0..3) : (4..7)
    column_in_range = valid_columns.include?(column_index)
    
    card_in_hand && column_in_range
  end
  
  # Add helper methods for game types
  def bot?
    game_type == "bot"
  end

  def pvp?
    game_type == "pvp"
  end

  # Add validation for players
  validate :validate_players
  
  
  def setup_initial_game_state
    return if @skip_setup
    
    # Initialize everything immediately for all games
    self.deck = generate_deck
    self.player1_hand = draw_initial_hand
    self.player2_hand = draw_initial_hand
    self.board_cards = []
    self.player1_discard_pile = []
    self.player2_discard_pile = []
    self.current_turn = player1_id
    self.turn_phase = :play_card
    self.status = :in_progress
  end
  
  private

  def generate_deck
    # Generate standard cards
    suits = ['♠', '♣', '♥', '♦']
    values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    standard_cards = suits.product(values).map { |suit, value| { suit: suit, value: value } }
    
    # Generate 4 unique wild cards with wild_id as part of the value
    wild_cards = (1..4).map do |i|
      { suit: '★', value: "W#{i}" }  # Include the number in the value
    end
    
    # Combine and shuffle all cards
    (standard_cards + wild_cards).shuffle
  end
  
  def draw_initial_hand
    deck.pop(6)
  end

  def validate_players
    if pvp?
      errors.add(:player2_id, "must be present for PvP games") if player2_id.nil?
      errors.add(:base, "Cannot play against yourself") if player1_id == player2_id
    elsif bot?
      errors.add(:player2, "must be a bot user") unless player2&.email&.include?("bot")
    end
  end
end 