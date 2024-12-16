module BotStrategies
  class EasyBot < Base
    def make_move
      return nil if available_cards.empty? || available_columns.empty?

      card = random_card
      {
        suit: card[:suit],
        value: card[:value],
        player_id: game.player2_id,
        column: random_column
      }
    end

    private

    def random_card
      available_cards.sample
    end

    def random_column
      available_columns.sample
    end
  end
end
