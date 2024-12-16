module BotStrategies
  class Base
    attr_reader :game

    def initialize(game)
      @game = game
    end

    def make_move
      raise NotImplementedError, "Subclasses must implement make_move"
    end

    protected

    def available_columns
      # Bot uses columns 4-7
      (4..7).select do |col|
        game.board_cards.count { |card| card[:player_id] == game.player2_id && card[:column] == col } < 5
      end
    end

    def available_cards
      game.player2_hand
    end
  end
end
