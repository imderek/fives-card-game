class CreateUserPreferences < ActiveRecord::Migration[7.2]
  def change
    create_table :user_preferences do |t|
      t.references :user, null: false, foreign_key: true
      t.string :key, null: false
      t.string :value_type, null: false
      t.text :value
      t.timestamps
    end

    add_index :user_preferences, [:user_id, :key], unique: true
  end
end 