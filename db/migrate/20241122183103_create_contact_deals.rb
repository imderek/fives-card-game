class CreateContactDeals < ActiveRecord::Migration[7.2]
  def change
    create_table :contact_deals do |t|
      t.references :contact, null: false, foreign_key: true
      t.references :deal, null: false, foreign_key: true
      t.boolean :primary, default: false

      t.timestamps
    end
  end
end
