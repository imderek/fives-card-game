class CreateDeals < ActiveRecord::Migration[7.2]
  def change
    create_table :deals do |t|
      t.string :name
      t.text :description
      t.string :status
      t.references :organization, null: false, foreign_key: true

      t.timestamps
    end
  end
end
