module BotStrategies
  class MediumBot < Base
    def make_move
      # Return early if no moves are possible
      return nil if available_cards.empty? || available_columns.empty?

      best_move = find_best_move
      return nil unless best_move

      # Format the move in the expected structure
      {
        suit: best_move[:card][:suit],
        value: best_move[:card][:value],
        player_id: game.player2_id,
        column: best_move[:column]
      }
    end

    private

    # find the best move by evaluating the score of each possible move
    def find_best_move
      best_score = -1000
      best_move = nil

      available_cards = game.player2_hand
      available_columns = (4..7).to_a

      # Try each possible card and column combination
      available_cards.each do |card|
        available_columns.each do |column|
          move = {
            card: card,
            column: column
          }
          
          # Simulate playing this card in this column
          column_cards = game.board_cards_for_player(game.player2_id, column) || []
          test_column = column_cards + [{**card, column: column}]

          score = evaluate_column(test_column)
          
          if score > best_score
            best_score = score
            best_move = move
          end
        end
      end

      best_move
    end

    # evaluate the score of a column
    def evaluate_column(column)
      return -999 if column.nil? # Invalid move
      
      score = 0
      column_number = column.last[:column].to_i
      existing_cards = game.board_cards_for_player(game.player2_id, column_number) || []
      
      # Prevent playing in columns that are full
      return -999 if existing_cards.length >= 5
      
      current_card = column.last
      
      # Get all cards across all columns for this player
      all_player_cards = (0..7).flat_map do |col|
        game.board_cards_for_player(game.player2_id, col) || []
      end.compact

      # Strategy: Encourage using multiple columns early in the game
      used_columns = (4..7).count { |col| game.board_cards_for_player(game.player2_id, col)&.any? }
      if existing_cards.empty? && used_columns < 2
        score += 50 # Bonus for expanding to new columns
      end

      # Score based on matching cards in the column
      all_cards = existing_cards + [current_card]
      value_matches = all_cards.count { |c| c[:value] == current_card[:value] }
      suit_matches = all_cards.count { |c| c[:suit] == current_card[:suit] }
      
      # Scoring system:
      # - Pairs: 40 points
      # - Three of a kind: 80 points
      # - Four of a kind: 160 points
      score += case value_matches
      when 2 then 40
      when 3 then 80
      when 4 then 160
      else 0
      end

      # Bonus for suit matches (15 points per match beyond the first)
      score += suit_matches * 15 if suit_matches > 1

      # Penalize tall columns to encourage spreading cards out
      score -= existing_cards.length * 10

      # Small bonus for using leftmost columns for better organization
      score += (8 - column_number) * 2

      score
    end

    def card_to_value(value)
      case value
      when 'A' then 14
      when 'K' then 13
      when 'Q' then 12
      when 'J' then 11
      else value.to_i
      end
    end
  end
end
