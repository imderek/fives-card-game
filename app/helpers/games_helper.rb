module GamesHelper
  def column_strength_classes(score)
    base_classes = "min-w-[4.5rem] min-h-[14.25rem] p-2 relative column transition-colors duration-150 flex flex-col gap-1 w-full"
    
    strength_classes = case score
    when 1000, 700..999  # Royal Flush & Straight Flush & Quads
      "bg-gradient-to-br from-purple-600 via-purple-800/30 via-35% to-purple-600/60 ring-1 ring-purple-500 bg-[length:200%_100%] shadow-[0_0_14px_10px_rgba(168,85,247,0.5)] "
    when 600..699  # Full House
      "bg-gradient-to-br from-red-600/80 via-red-800/30 via-35% to-red-600/60 ring-1 ring-red-500 bg-[length:200%_100%] shadow-[0_0_14px_5px_rgba(220,38,38,0.5)]"
    when 500..599  # Flush
      "bg-gradient-to-br from-amber-600/80 via-amber-800/30 via-35% to-amber-600/60 ring-1 ring-amber-500 bg-[length:200%_100%]"
    when 400..499  # Straight
      "bg-gradient-to-br from-lime-600/80 via-lime-800/30 via-35% to-lime-600/60 ring-1 ring-lime-500 bg-[length:200%_100%]"
    when 300..399  # Trips
      "bg-cyan-600/40 ring-1 ring-cyan-500"
    when 101..299  # Two Pair
      "bg-slate-600/60"
    when 50..100  # Pair
      "bg-slate-600/60"
    else # High Card or no hand
      "bg-slate-600/60"
    end

    "#{base_classes} #{strength_classes} rounded-lg"
  end

  def score_color_class(score)
    case score
    when 1000, 700..999  # Royal Flush & Straight Flush & Quads
      "text-purple-400"
    when 600..699  # Full House
      "text-red-400"
    when 500..599  # Flush
      "text-amber-400"
    when 400..499  # Straight
      "text-lime-300"
    when 300..399  # Trips
      "text-cyan-400"
    when 101..299  # Two Pair
      "text-cyan-400"
    when 50..100  # Pair
      "text-slate-200"
    else # High Card
      "text-slate-400"
    end
  end
end 