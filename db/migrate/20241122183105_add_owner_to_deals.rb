class AddOwnerToDeals < ActiveRecord::Migration[7.1]
  def change
    add_reference :deals, :owner, null: true, foreign_key: { to_table: :users }
    
    # Optionally, if you want to set existing deals to have the first user as owner:
    reversible do |dir|
      dir.up do
        Deal.update_all(owner_id: User.first&.id) if User.first.present?
      end
    end
  end
end 