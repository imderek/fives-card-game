class CreateOrganizations < ActiveRecord::Migration[7.2]
  def change
    create_table :organizations do |t|
      t.string :name
      t.decimal :monthly_recurring_revenue, precision: 10, scale: 2
      t.decimal :annual_recurring_revenue, precision: 10, scale: 2
      t.decimal :lifetime_value, precision: 10, scale: 2
      t.decimal :churn_rate, precision: 5, scale: 4
      t.integer :subscription_length_months
      t.string :billing_contact_email

      t.timestamps
    end
  end
end
