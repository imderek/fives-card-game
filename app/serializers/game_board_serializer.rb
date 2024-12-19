class GameBoardSerializer
  include PokerHandDetector
  
  def initialize(game)
    @game = game
  end

  def as_json
    {
      player_1: serialize_player_columns(@game.player1_id, 0..3),
      player_2: serialize_player_columns(@game.player2_id, 4..7)
    }
  end

  private

  def serialize_player_columns(player_id, column_range)
    {
      columns: column_range.map do |column|
        cards = @game.board_cards_for_player(player_id, column).map { |card| 
          "#{card[:value]}#{card[:suit].first.upcase}"
        }
        
        {
          cards: cards,
          hand_name: detect_partial_hand(cards),
          score: @game.column_scores[column.to_s] || 0
        }
      end
    }
  end
end 