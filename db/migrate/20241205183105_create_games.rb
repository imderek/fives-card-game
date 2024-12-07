class CreateGames < ActiveRecord::Migration[7.0]
  def change
    create_table :games do |t|
      t.references :player1, null: false, foreign_key: { to_table: :users }
      t.references :player2, foreign_key: { to_table: :users }
      t.integer :status, default: 0
      t.integer :game_type, default: 0
      t.text :player1_hand
      t.text :player2_hand
      t.text :board_cards
      t.text :deck
      t.bigint :current_turn
      t.bigint :winner_id

      t.timestamps
    end
  end
end 