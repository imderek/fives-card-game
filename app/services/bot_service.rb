# app/services/bot_service.rb
class BotService
  STRATEGY_MAPPING = {
    'easy bot' => BotStrategies::EasyBot,
    'medium bot' => BotStrategies::MediumBot,
    'hard bot' => BotStrategies::HardBot,
    # Add more strategies as they're implemented:
    # 'bot_hard@example.com' => BotStrategies::HardBot
  }

  def self.get_strategy(game)
    bot_email = game.player2.email
    strategy_class = STRATEGY_MAPPING[bot_email] || BotStrategies::EasyBot
    strategy_class.new(game)
  end
end
