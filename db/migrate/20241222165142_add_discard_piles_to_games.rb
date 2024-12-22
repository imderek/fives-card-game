class AddDiscardPilesToGames < ActiveRecord::Migration[7.2]
  def change
    add_column :games, :player1_discard_pile, :text
    add_column :games, :player2_discard_pile, :text
  end
end
