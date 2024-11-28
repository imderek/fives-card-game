class AddCloseDateToDeals < ActiveRecord::Migration[7.2]
  def change
    add_column :deals, :close_date, :date
  end
end
