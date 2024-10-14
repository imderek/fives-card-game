class AddBrandReferenceToProducts < ActiveRecord::Migration[7.2]
  def change
    add_reference :products, :brand, null: false, foreign_key: true
  end
end
