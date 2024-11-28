class AddAmountToDeals < ActiveRecord::Migration[7.2]
  def change
    add_column :deals, :amount, :decimal, precision: 10, scale: 2
  end
end
