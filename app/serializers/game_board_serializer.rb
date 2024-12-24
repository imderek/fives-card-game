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
    # Get regular columns only (no hand)
    columns = column_range.map do |column|
      cards = @game.board_cards_for_player(player_id, column).map { |card| 
        "#{card[:value]}#{card[:suit].first.upcase}"
      }
      
      {
        cards: cards,
        hand_name: detect_partial_hand(cards),
        score: @game.column_scores[column.to_s] || 0,
        is_hand: false
      }
    end

    # Calculate hand data but don't add it to columns
    hand_cards = player_id == @game.player1_id ? @game.player1_hand : @game.player2_hand
    hand_key = player_id == @game.player1_id ? "player1_hand" : "player2_hand"
    
    formatted_hand_cards = hand_cards.map { |card| "#{card[:value]}#{card[:suit].first.upcase}" }
    hand_name = detect_partial_hand(formatted_hand_cards)
    
    { 
      columns: columns,
      hand: {
        cards: formatted_hand_cards,
        hand_name: hand_name || "High Card",
        score: @game.column_scores[hand_key] || 0
      }
    }
  end
end 