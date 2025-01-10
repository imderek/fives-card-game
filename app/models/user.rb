class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Remove the email validation
  validates :email, presence: true

  belongs_to :organization

  has_many :games_as_player1, class_name: 'Game', foreign_key: 'player1_id'
  has_many :games_as_player2, class_name: 'Game', foreign_key: 'player2_id'
  has_many :won_games, class_name: 'Game', foreign_key: 'winner_id'

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

  private
  
  def generate_remember_token
    self.remember_token ||= SecureRandom.hex(10)
  end
end
