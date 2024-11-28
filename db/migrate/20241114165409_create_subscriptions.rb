class CreateSubscriptions < ActiveRecord::Migration[7.2]
  def change
    create_table :subscriptions do |t|
      t.references :organization, null: false, foreign_key: true
      t.date :start_date
      t.date :end_date
      t.string :subscription_tier
      t.decimal :subscription_value, precision: 10, scale: 2
      t.string :billing_cycle

      t.timestamps
    end
  end
end
