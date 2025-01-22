class AddCashToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :cash, :integer, default: 1000, null: false
  end
end 