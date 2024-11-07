# This file contains seed data for products and brands in the beauty industry.
# The data can be loaded with the bin/rails db:seed command.
ProductOption.delete_all
Variant.delete_all
Product.destroy_all
Brand.destroy_all


# Create Brands
brands = [
  { name: "Estée Lauder" },
  { name: "Fenty Beauty" },
  { name: "La Mer" },
  { name: "MAC Cosmetics" },
  { name: "NARS" }
]

created_brands = brands.map { |brand| Brand.create!(brand) }

# Create Products
products = [
  {
    title: "Double Wear Stay-in-Place Foundation",
    description: "A revolutionary 24-hour wear, oil-free foundation that delivers a flawless, natural matte finish. This waterproof and transfer-resistant formula is designed to withstand heat, humidity, and non-stop activity. It's perfect for all skin types and provides medium to full coverage that feels lightweight and comfortable. The foundation stays color-true and won't change color, smudge or come off on clothes.",
    brand: created_brands[0]
  },
  {
    title: "Pro Filt'r Soft Matte Longwear Foundation",
    description: "A game-changing soft matte, long-wear foundation with buildable, medium to full coverage. Available in a groundbreaking range of 50 shades, this foundation is designed to work across all skin types and tones. The oil-free formula is made with climate-adaptive technology that's resistant to sweat and humidity, and stays flexible, so it moves with your skin. The result is a smooth, pore-diffused, shine-free finish that easily builds to your ideal coverage.",
    brand: created_brands[1]
  },
  {
    title: "Crème de la Mer",
    description: "An ultra-luxurious moisturizing cream that helps heal dryness and restore radiance. Featuring the nutrient-rich Miracle Broth™, this cream is the heart of La Mer's profound powers of transformation. It's formulated with sea kelp, vitamins and minerals, oils of citrus, eucalyptus, wheat germ, alfalfa and sunflower. This rich cream deeply soothes sensitivity and helps heal dryness, redness, and irritation, helping bring skin back to its healthiest center. Skin looks naturally vibrant, restored to its healthiest center. Aging lines and pores are noticeably diminished.",
    brand: created_brands[2]
  },
  {
    title: "Studio Fix Fluid SPF 15",
    description: "A modern foundation that combines a natural matte finish and medium-to-full buildable coverage with broad spectrum SPF 15 protection. This long-wearing formula is available in an inclusive range of shades for all skin tones. It's oil-free, controls shine, and is non-caking, non-settling and non-creasing. The foundation helps minimize the appearance of pores and imperfections, giving skin a smoother, more flawless look and finish. It's also sweat- and humidity-resistant, making it perfect for all climates.",
    brand: created_brands[3]
  },
  {
    title: "Sheer Glow Foundation",
    description: "An award-winning foundation that enhances, without masking, your overall natural complexion. This brightening, hydrating, and luminous foundation leaves skin looking radiant and replenished. Uniquely designed to create a softer, more dimensional finish, it features NARS' Complexion Brightening Formula, which leaves skin hydrated, more luminous, softer and smoother. Powerful antioxidants help protect against damaging free radicals and turmeric extract improves skin's radiance over time. The foundation is buildable from sheer to medium coverage and suitable for normal, normal-to-dry and dry skin types.",
    brand: created_brands[4]
  },
  {
    title: "Advanced Night Repair Synchronized Multi-Recovery Complex",
    description: "A revolutionary night serum that reduces multiple signs of aging caused by the environmental assaults of modern life. This fast-penetrating, oil-free formula works throughout the night to deliver a significant reduction in the look of lines and wrinkles, revealing smoother, more radiant, and younger-looking skin. It maximizes the power of skin's natural nighttime renewal with our exclusive ChronoluxCB™ Technology. The serum also provides 72-hour hydration and comprehensive anti-oxidant protection, while strengthening the skin barrier and supporting skin's natural repair processes.",
    brand: created_brands[0]
  },
  {
    title: "Killawatt Freestyle Highlighter",
    description: "A game-changing, lightweight, long-wear cream-powder hybrid highlighter that ranges from subtle dayglow to insanely supercharged. Its creamy texture is super-smooth, blends effortlessly, and stays put without creasing. The highlighter delivers a hyper-metallic finish in solos and duos, with shades that are designed to flatter all skin tones. From soft pearl to supercharged tangerine, it gives you the freedom to go big or go subtle. The cream-powder formula is weightless, long-wearing and blends seamlessly with very little effort. It can be used on the face, eyes, lips, collarbone... literally anywhere you crave a touch of light.",
    brand: created_brands[1]
  },
  {
    title: "The Treatment Lotion",
    description: "A moisture-rich lotion that hydrates, renews and conditions the skin, preparing it for the treatments to follow. This transformative lotion delivers a wave of hydration, instantly softening and nourishing the skin. It's infused with La Mer's cell-renewing Miracle Broth™ and their proprietary Lime Tea Concentrate, which helps protect against environmental stress and pollution. The lotion penetrates rapidly, allowing the skin to absorb the benefits of the treatments that follow. Over time, skin looks more energized and awakened from within, while pores appear refined and skin feels smoother and more supple.",
    brand: created_brands[2]
  },
  {
    title: "Retro Matte Lipstick",
    description: "A long-lasting matte lipstick with intense color payoff and a completely matte finish. This highly pigmented formula delivers color in just one stroke, with a no-shine matte finish that lasts for up to 8 hours. The lipstick is formulated to be non-drying and comfortable on the lips, despite its matte texture. It's available in a wide range of shades, from neutral nudes to vibrant reds and deep berries, suitable for all skin tones. The bullet is precisely shaped to allow for easy and accurate application, even without a lip liner.",
    brand: created_brands[3]
  },
  {
    title: "Radiant Creamy Concealer",
    description: "An award-winning concealer that provides medium-to-full, buildable coverage with a natural, radiant finish. This multi-action formula not only conceals and corrects, but also hydrates, smooths, and enhances. It instantly obscures imperfections and diminishes fine lines and signs of fatigue. Enriched with hydrating, multi-action skincare benefits and light-diffusing technology, it creates a softer, smoother complexion while instantly matching your skin's texture. The concealer is long-wearing, crease-proof, and non-settling, making it perfect for all-day wear. It's ideal for all skin types and is available in a wide range of shades to suit all skin tones.",
    brand: created_brands[4]
  },
  {
    title: "Pure Color Envy Sculpting Lipstick",
    description: "A color-saturated, moisture-complex lipstick that sculpts and defines lips with multi-faceted color. This luxurious lipstick glides on effortlessly, enveloping lips in rich, saturated color with just one stroke. The multi-faceted pigments create definition, and the time-released moisture complex helps capture and seal-in hydration. It stays color-true for up to 6 hours, and the ultra-creamy texture feels comfortable and lightweight on the lips. The lipstick is infused with sculpting pigments that give definition to the lips, creating a plumped, voluminous look. Available in a wide range of shades from subtle nudes to bold reds, it's suitable for all skin tones and occasions.",
    brand: created_brands[0]
  },
  {
    title: "Gloss Bomb Universal Lip Luminizer",
    description: "The ultimate gotta-have-it lip gloss with explosive shine that feels as good as it looks. This is the stop-everything, give-it-to-me gloss that feels as good as it looks. The non-sticky formula is super shiny, has an addictive peach-vanilla scent, and feels so luxe that you'll want to slather it on over and over. It's designed to be the ultimate finishing touch to any look. Packed with shea butter, it makes lips look instantly fuller and smoother. The extra large wand allows for easy application and buildable coverage, so you can dial up the shine factor. Available in a range of universal shades, it's perfect for all skin tones and can be worn alone or over lipstick.",
    brand: created_brands[1]
  }
]

products.each { |product| Product.create!(product) }

# Define available color options without the "#" symbol
colors = [
  { name: "Color", option_type: "color", value: "ec4899" },  # pink-500
  { name: "Color", option_type: "color", value: "f43f5e" },  # rose-500
  { name: "Color", option_type: "color", value: "ef4444" },  # red-500
  { name: "Color", option_type: "color", value: "fbcfe8" },  # pink-300
  { name: "Color", option_type: "color", value: "e11d48" },  # rose-600
  { name: "Color", option_type: "color", value: "fecaca" },  # red-200
  { name: "Color", option_type: "color", value: "f9a8d4" },  # pink-200
  { name: "Color", option_type: "color", value: "94a3b8" },  # slate-400
  { name: "Color", option_type: "color", value: "64748b" },  # slate-500
  { name: "Color", option_type: "color", value: "67e8f9" },  # cyan-300
  { name: "Color", option_type: "color", value: "7dd3fc" }   # sky-300
]

# Create color variants
color_variants = colors.map { |color| Variant.create!(color) }

# Ensure that all the products exist before adding product options
Product.find_each do |product|
  # Select between 4 and 8 random colors for each product
  selected_colors = color_variants.sample(rand(4..8))

  selected_colors.each do |color|
    # Create the product option for each selected color variant
    ProductOption.create!(product: product, variant: color)
  end
end

puts "Each product now has between 4 and 8 unique color options with hex codes (without #)!"

puts "Done!"
