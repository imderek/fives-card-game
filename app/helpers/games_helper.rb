module GamesHelper
  def column_strength_classes(score)
    base_classes = "min-w-[4.5rem] min-h-[14.25rem] p-2 relative column shadow-lg transition-all duration-150 flex flex-col gap-1 w-full"
    
    strength_classes = case score
    when 1000 # Royal Flush
      "bg-purple-600/60 ring-2 ring-purple-500"
    when 800..999 # Straight Flush
      "bg-red-600/60 ring-2 ring-red-500"
    when 700..799 # Quads
      "bg-orange-600/60 ring-2 ring-orange-500"
    when 600..699 # Full House
      "bg-amber-600/60 ring-2 ring-amber-500"
    when 500..599 # Flush
      "bg-yellow-600/60 ring-2 ring-yellow-500"
    when 400..499 # Straight
      "bg-lime-600/60 ring-2 ring-lime-500"
    when 300..399 # Trips
      "bg-green-600/60 ring-2 ring-green-500"
    when 200..299 # Two Pair
      "bg-teal-600/60 ring-2 ring-teal-500"
    when 100..199 # One Pair
      "bg-cyan-600/60 ring-2 ring-cyan-500"
    else # High Card or no hand
      "bg-slate-600/60"
    end

    "#{base_classes} #{strength_classes} rounded-lg"
  end

  def score_color_class(score)
    case score
    when 1000      then "text-purple-400"
    when 800..999  then "text-red-400"
    when 700..799  then "text-orange-400"
    when 600..699  then "text-amber-400"
    when 500..599  then "text-yellow-400"
    when 400..499  then "text-lime-400"
    when 300..399  then "text-green-400"
    when 200..299  then "text-teal-400"
    when 100..199  then "text-cyan-400"
    else "text-slate-400" # Keep original color for default case
    end
  end
end 