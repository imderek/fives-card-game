# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

Product.create(title: "Estée Lauder Double Wear Foundation", description: "A long-wearing foundation that stays flawless and fresh for up to 24 hours. This cult-favorite provides medium to full coverage with a natural, matte finish. It's oil-free, oil-controlling, and waterproof, perfect for all skin types.")

Product.create(title: "Fenty Beauty Pro Filt'r Soft Matte Longwear Foundation", description: "Rihanna's game-changing foundation offers buildable, medium to full coverage that's lightweight, long-wearing and shine-free. Available in a groundbreaking range of 50 shades, it's designed to work on all skin tones and types.")

Product.create(title: "La Mer Crème de la Mer", description: "An ultra-rich cream that provides deep moisture, renewal, and transformation. Infused with cell-renewing Miracle Broth™, this luxurious cream helps heal dryness, reduce the appearance of fine lines and wrinkles, and restore radiance for a younger-looking complexion.")
