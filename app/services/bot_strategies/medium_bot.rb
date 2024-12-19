module BotStrategies
  class MediumBot < Base
    def make_move
      Rails.logger.debug "MediumBot: Starting make_move"
      return nil if available_cards.empty? || available_columns.empty?

      Rails.logger.debug "MediumBot: Available cards: #{available_cards.inspect}"
      Rails.logger.debug "MediumBot: Available columns: #{available_columns.inspect}"

      best_move = find_best_move
      Rails.logger.debug "MediumBot: Best move found: #{best_move.inspect}"
      
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
      best_score = -1000
      best_move = nil

      available_cards = game.player2_hand
      available_columns = (4..7).to_a

      available_cards.each do |card|
        available_columns.each do |column|
          move = {
            card: card,
            column: column
          }
          
          # Create a test column state
          column_cards = game.board_cards_for_player(game.player2_id, column) || []
          test_column = column_cards + [{**card, column: column}]
          
          score = evaluate_column(test_column)
          
          Rails.logger.debug "MediumBot: Testing #{card[:value]}#{card[:suit]} in column #{column} - Score: #{score}"
          
          if score > best_score
            best_score = score
            best_move = move
          end
        end
      end

      Rails.logger.debug "MediumBot: Best move found: #{best_move.inspect} with score: #{best_score}"
      best_move
    end

    def evaluate_column(column)
      return -999 if column.nil? # Never choose nil columns
      
      score = 0
      column_number = column.last[:column].to_i
      existing_cards = game.board_cards_for_player(game.player2_id, column_number) || []
      
      # Strongly discourage overfilling columns
      return -999 if existing_cards.length >= 5
      
      # Get current card we're trying to play
      current_card = column.last
      
      # Get all cards in this player's columns
      all_player_cards = (0..7).flat_map do |col|
        game.board_cards_for_player(game.player2_id, col) || []
      end.compact

      # Encourage using new columns when we don't have many in use
      used_columns = (4..7).count { |col| game.board_cards_for_player(game.player2_id, col)&.any? }
      if existing_cards.empty? && used_columns < 2
        score += 50 # Big bonus for using new columns early
      end

      # Score for matches in the current column
      all_cards = existing_cards + [current_card]
      value_matches = all_cards.count { |c| c[:value] == current_card[:value] }
      suit_matches = all_cards.count { |c| c[:suit] == current_card[:suit] }
      
      # Bonus for matching values in same column
      score += case value_matches
      when 2 then 40  # Pair
      when 3 then 80  # Trips
      when 4 then 160 # Quads
      else 0
      end

      # Bonus for matching suits in same column
      score += suit_matches * 15 if suit_matches > 1

      # Penalize stacking too many cards in one column
      score -= existing_cards.length * 10

      # Small bonus for columns closer to 4 (left side of bot's area)
      score += (8 - column_number) * 2

      Rails.logger.debug "MediumBot: Column #{column_number} evaluation - Score: #{score}, Cards: #{all_cards.map{|c| "#{c[:suit]}#{c[:value]}"}.join(',')}"
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
