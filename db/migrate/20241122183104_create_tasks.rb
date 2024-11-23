class CreateTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.text :description
      t.date :due_date
      t.string :status, default: 'pending'
      t.references :deal, null: false, foreign_key: true

      t.timestamps
    end
  end
end 