class GameBoardSerializer
  def initialize(game)
    @game = game
  end

  def as_json
    {
      player_1: serialize_player_columns(@game.player1_id),
      player_2: serialize_player_columns(@game.player2_id)
    }
  end

  private

  def serialize_player_columns(player_id)
    {
      columns: (0..3).map do |column|
        {
          cards: @game.board_cards_for_player(player_id, column).map { |card| 
            "#{card[:value]}#{card[:suit].first.upcase}"
          },
          hand_name: nil # You can add poker hand detection logic here later
        }
      end
    }
  end
end 