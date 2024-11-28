class CreateMetrics < ActiveRecord::Migration[7.2]
  def change
    create_table :metrics do |t|
      t.string :name
      t.decimal :value, precision: 10, scale: 2
      t.string :unit
      t.datetime :period_start
      t.datetime :period_end
      t.decimal :change_percentage, precision: 5, scale: 2
      t.references :organization, null: false, foreign_key: true

      t.timestamps
    end
  end
end
