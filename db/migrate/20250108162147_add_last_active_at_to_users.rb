class AddLastActiveAtToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :last_active_at, :datetime
  end
end
