class Game < ApplicationRecord
  belongs_to :player1, class_name: 'User'
  belongs_to :player2, class_name: 'User', optional: true # optional for bot games
  belongs_to :winner, class_name: 'User', optional: true
  
  serialize :player1_hand, coder: YAML
  serialize :player2_hand, coder: YAML
  serialize :board_cards, coder: YAML
  serialize :deck, coder: YAML
  
  enum :status, [:waiting, :in_progress, :completed]
  enum :game_type, [:pvp, :bot]
  enum :turn_phase, [:play_card, :draw_card], default: :play_card
  
  before_create :setup_initial_game_state
  
  after_update_commit :broadcast_game_state
  
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
  
  def board_cards_for_player(player_id, column)
    board_cards.select do |card| 
      if player_id == player1_id
        # Player 1's cards are in columns 0-3
        card[:player_id] == player1_id && card[:column] == column
      else
        # Player 2's cards are in columns 4-7
        card[:player_id] == player2_id && card[:column] == (column + 4)
      end
    end
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
  
  private
  
  def setup_initial_game_state
    self.deck = generate_deck
    self.player1_hand = draw_initial_hand
    self.player2_hand = draw_initial_hand
    self.board_cards = [] # Each card will now need: { suit:, value:, player_id:, column: }
    self.current_turn = player1_id
    self.turn_phase = :play_card
  end
  
  def generate_deck
    suits = ['♠', '♣', '♥', '♦']
    values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    suits.product(values).map { |suit, value| { suit: suit, value: value } }.shuffle
  end
  
  def draw_initial_hand
    deck.pop(6)
  end
  
  def broadcast_game_state
    Rails.logger.debug "Broadcasting game state for game #{id}"
    [player1_id, player2_id].compact.each do |player_id|
      Rails.logger.debug "Broadcasting to player #{player_id}"
      
      current_user = User.find(player_id)
      
      # Create a dedicated stream name for each player
      stream_name = "game_#{id}_player_#{player_id}"
      
      broadcast_replace_to(
        stream_name,
        target: "game-state",
        partial: "games/game_state",
        locals: { game: self, current_user: current_user }
      )

      broadcast_replace_to(
        stream_name,
        target: "game-status",
        partial: "games/game_status",
        locals: { game: self, current_user: current_user }
      )

      broadcast_replace_to(
        stream_name,
        target: "player-controls",
        partial: "games/player_controls",
        locals: { game: self, current_user: current_user }
      )
      
      Rails.logger.debug "Finished broadcasting to player #{player_id}"
    end
  end
end 