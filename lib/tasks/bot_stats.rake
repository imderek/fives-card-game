require 'terminal-table'

namespace :bots do
  desc "Display statistics for all bots"
  task stats: :environment do
    bots = [
      User.easy_bot,
      User.medium_bot,
      User.hard_bot
    ]

    rows = bots.compact.map do |bot|
      [
        bot.email,
        bot.games.completed.count,
        bot.average_completed_game_score&.round(2) || 'N/A'
      ]
    end

    table = Terminal::Table.new(
      title: 'Bot Statistics',
      headings: ['Bot', 'Completed Games', 'Average Score'],
      rows: rows
    )

    puts table
  end
end 