class AddTurnPhaseToGames < ActiveRecord::Migration[7.0]
  def change
    add_column :games, :turn_phase, :integer, default: 0
  end
end 