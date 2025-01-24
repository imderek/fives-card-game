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

  before_create :set_initial_cash
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

  private
  
  def set_initial_cash
    self.cash ||= 1000
  end

  def generate_remember_token
    self.remember_token ||= SecureRandom.hex(10)
  end
end
