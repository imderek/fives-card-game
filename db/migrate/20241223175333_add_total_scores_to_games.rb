class AddTotalScoresToGames < ActiveRecord::Migration[7.2]
  def change
    add_column :games, :player1_total_score, :integer
    add_column :games, :player2_total_score, :integer
  end
end
