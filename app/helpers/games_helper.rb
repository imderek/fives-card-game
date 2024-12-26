module GamesHelper
  def column_strength_classes(score)
    base_classes = "min-w-[4.5rem] min-h-[14.25rem] p-2 relative column shadow-lg transition-all duration-150 flex flex-col gap-1 w-full"
    
    strength_classes = case score
    when 1000, 800..999  # Royal Flush & Straight Flush
      "bg-purple-600/60 ring-2 ring-purple-500"
    when 700..799, 600..699  # Quads & Full House
      "bg-red-600/60 ring-2 ring-red-500"
    when 500..599, 400..499  # Flush & Straight
      "bg-amber-600/60 ring-2 ring-amber-500"
    when 300..399  # Three of a Kind
      "bg-green-600/60 ring-2 ring-green-500"
    when 101..299  # Pairs
      "bg-cyan-600/60 ring-2 ring-cyan-500"
    when 50..100  # High Card
      "bg-slate-600/60 ring-2 ring-slate-500"
    else # High Card or no hand
      "bg-slate-600/60"
    end

    "#{base_classes} #{strength_classes} rounded-lg"
  end

  def score_color_class(score)
    case score
    when 1000, 800..999  # Royal Flush & Straight Flush
      "text-purple-400"
    when 700..799, 600..699  # Quads & Full House
      "text-red-400"
    when 500..599, 400..499  # Flush & Straight
      "text-amber-400"
    when 300..399  # Three of a Kind
      "text-green-400"
    when 101..299  # Pairs
      "text-cyan-400"
    when 50..100  # High Card
      "text-slate-200"
    else # High Card
      "text-slate-400"
    end
  end
end 