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
    
    # Get current board state
    board_state = GameBoardSerializer.new(self).as_json
    
    # Determine which player's columns to check
    player_key = card[:player_id] == player1_id ? :player_1 : :player_2
    
    # Get the current number of cards in the target column
    current_column_cards = board_state[player_key][:columns][column_index][:cards].size
    
    # Check if adding a card would exceed the maximum (5 cards)
    current_column_cards < 5
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
  
  private
  
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
  
  def generate_deck
    suits = ['♠', '♣', '♥', '♦']
    values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    suits.product(values).map { |suit, value| { suit: suit, value: value } }.shuffle
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