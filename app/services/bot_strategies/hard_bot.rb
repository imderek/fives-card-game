module BotStrategies
  class HardBot < Base
    def make_move
      return nil if available_cards.empty? || available_columns.empty?

      best_move = find_best_move
      return nil unless best_move

      {
        suit: best_move[:card][:suit],
        value: best_move[:card][:value],
        player_id: game.player2_id,
        column: best_move[:column]
      }
    end

    private

    def find_best_move
      hand_cards = game.player2_hand
      
      # Situation 3: Look for multiples in hand that match with board
      hand_cards.each do |card|
        # Check for quads first, then trips, then pairs
        [4, 3, 2].each do |target_count|
          available_columns.each do |column|
            column_cards = game.board_cards_for_player(game.player2_id, column) || []
            matching_values = column_cards.count { |c| c[:value] == card[:value] }
            
            # If we found a match of the target size
            if matching_values == target_count - 1 && column_cards.length < 5
              return { card: card, column: column }
            end
          end
        end
      end

      # Situation 2: Multiple in hand with empty column available
      hand_value_counts = count_values_in_hand(hand_cards)
      if multiple = find_best_multiple_in_hand(hand_value_counts)
        if empty_column = find_empty_column
          return { card: multiple, column: empty_column }
        end
      end

      # Situation 4: No multiples match with board, find highest match
      available_columns.each do |column|
        column_cards = game.board_cards_for_player(game.player2_id, column) || []
        hand_cards.each do |card|
          if column_cards.any? { |c| c[:value] == card[:value] } && column_cards.length < 5
            return { card: card, column: column }
          end
        end
      end

      # Default: Random card in random column (preferring empty columns)
      if empty_column = find_empty_column
        return { card: hand_cards.sample, column: empty_column }
      end

      # Absolute fallback: Random card in random valid column
      { card: hand_cards.sample, column: available_columns.sample }
    end

    def count_values_in_hand(cards)
      cards.each_with_object(Hash.new(0)) do |card, counts|
        counts[card[:value]] += 1
      end
    end

    def find_best_multiple_in_hand(value_counts)
      # Find the highest count multiple in hand
      best_value = value_counts.max_by { |value, count| [count, card_to_value(value)] }
      return nil unless best_value && best_value[1] > 1
      
      # Return the card with this value from the hand
      game.player2_hand.find { |card| card[:value] == best_value[0] }
    end

    def find_empty_column
      available_columns.find do |column|
        (game.board_cards_for_player(game.player2_id, column) || []).empty?
      end
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