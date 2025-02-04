class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :trackable

  # Remove the email validation
  validates :email, presence: true

  belongs_to :organization

  has_many :games_as_player1, class_name: 'Game', foreign_key: 'player1_id', dependent: :destroy
  has_many :games_as_player2, class_name: 'Game', foreign_key: 'player2_id', dependent: :destroy
  has_many :won_games, class_name: 'Game', foreign_key: 'winner_id', dependent: :destroy

  has_many :preferences, class_name: 'UserPreference'

  # Skip password validation
  def password_required?
    false
  end

  def update_with_password(params, *options)
    if params[:password].blank? && params[:password_confirmation].blank?
      params.delete(:password)
      params.delete(:password_confirmation)
    end
    update_without_password(params, *options)
  end

  before_create :generate_remember_token

  def games
    Game.where('player1_id = ? OR player2_id = ?', id, id)
  end

  def average_completed_game_score
    avg = Game.where("(player1_id = :id OR player2_id = :id)", id: id)
      .where(status: :completed)
      .pluck(Arel.sql("AVG(CASE 
        WHEN player1_id = #{id} THEN player1_total_score 
        ELSE player2_total_score 
      END)"))
      .first
    avg&.to_f&.round(2)
  end

  def total_wins
    Game.where(winner_id: id, is_private: false).count
  end

  def calculate_total_points
    # Create subqueries for both player positions
    player1_points = Game.where(is_private: false)
                        .where("player1_id = ? AND player1_total_score > 0", id)
                        .sum(:player1_total_score)
    
    player2_points = Game.where(is_private: false)
                        .where("player2_id = ? AND player2_total_score > 0", id)
                        .sum(:player2_total_score)
    
    player1_points + player2_points
  end

  # Class methods for finding bots
  def self.easy_bot
    find_by(email: 'easy bot')
  end

  def self.medium_bot
    find_by(email: 'medium bot')
  end

  def self.hard_bot
    find_by(email: 'hard bot')
  end

  def win_rate
    completed_games = Game.where("(player1_id = :id OR player2_id = :id) AND is_private = false", id: id)
                         .where(status: :completed)
    
    total_games = completed_games.count
    return nil if total_games.zero?
    
    wins = completed_games.where(winner_id: id).count
    ((wins.to_f / total_games) * 100).round(2)
  end

  def get_preference(key, default = nil)
    preference = preferences.find_by(key: key)
    preference&.typed_value || default
  end
  
  def set_preference(key, value)
    value_type = case value
                 when TrueClass, FalseClass then 'boolean'
                 when Integer then 'integer'
                 when Float then 'float'
                 when Array then 'array'
                 else 'string'
                 end
    
    serialized_value = value_type == 'array' ? value.to_json : value.to_s
    
    preferences
      .find_or_initialize_by(key: key)
      .update!(value_type: value_type, value: serialized_value)
  end
  
  def wild_cards_enabled?
    get_preference('wild_cards_enabled', false)
  end

  private
  
  def generate_remember_token
    self.remember_token ||= SecureRandom.hex(10)
  end
end
