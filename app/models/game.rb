class Game < ApplicationRecord
  belongs_to :player1, class_name: 'User'
  belongs_to :player2, class_name: 'User', optional: true # optional for bot games
  
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
  
  private
  
  def setup_initial_game_state
    self.deck = generate_deck
    self.player1_hand = draw_initial_hand
    self.player2_hand = draw_initial_hand
    self.board_cards = []
    self.current_turn = player1_id
    self.turn_phase = :play_card
  end
  
  def generate_deck
    suits = ['♠', '♣', '♥', '♦']
    values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    suits.product(values).map { |suit, value| { suit: suit, value: value } }.shuffle
  end
  
  def draw_initial_hand
    deck.pop(7)
  end
  
  def broadcast_game_state
    Rails.logger.debug "Broadcasting game state for game #{id}"
    [player1_id, player2_id].compact.each do |player_id|
      Rails.logger.debug "Broadcasting to player #{player_id}"
      
      current_user = User.find(player_id)
      
      broadcast_replace_to(
        "game_#{id}",
        target: "game-state",
        partial: "games/game_state",
        locals: { game: self, current_user: current_user }
      )

      broadcast_replace_to(
        "game_#{id}",
        target: "game-status",
        partial: "games/game_status",
        locals: { game: self, current_user: current_user }
      )

      broadcast_replace_to(
        "game_#{id}",
        target: "player-controls",
        partial: "games/player_controls",
        locals: { game: self, current_user: current_user }
      )
      
      Rails.logger.debug "Finished broadcasting to player #{player_id}"
    end
  end
end 