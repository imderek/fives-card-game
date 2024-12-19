class AddColumnScoresToGames < ActiveRecord::Migration[7.0]
  def change
    add_column :games, :column_scores, :jsonb, default: {}
    # Will store data like: { "0": 100, "1": 300, ... } where numbers represent scores
  end
end 