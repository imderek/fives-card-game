class CreateProductOptions < ActiveRecord::Migration[7.2]
  def change
    create_table :product_options do |t|
      t.references :product, null: false, foreign_key: true
      t.references :variant, null: false, foreign_key: true

      t.timestamps
    end
  end
end
