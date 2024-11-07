class CreateVariants < ActiveRecord::Migration[7.2]
  def change
    create_table :variants do |t|
      t.string :name
      t.string :option_type
      t.string :value

      t.timestamps
    end
  end
end
