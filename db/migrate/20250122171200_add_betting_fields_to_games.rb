class AddBettingFieldsToGames < ActiveRecord::Migration[7.2]
  def change
    add_column :games, :player1_bet, :integer, default: 0
    add_column :games, :player2_bet, :integer, default: 0
    add_column :games, :pot_size, :integer, default: 0
  end
end
