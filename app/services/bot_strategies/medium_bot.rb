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
      best_score = -Float::INFINITY  # Changed from -1 to handle negative scores
      best_move = nil

      available_cards.each do |card|
        available_columns.each do |column|
          temp_column = game.board_cards_for_player(game.player2_id, column)
                           .map { |c| { suit: c[:suit], value: c[:value] } }
          temp_column << card
          score = evaluate_column(temp_column)
          
          Rails.logger.debug "MediumBot: Evaluating card #{card.inspect} in column #{column} - Score: #{score}"

          if score > best_score
            best_score = score
            best_move = { card: card, column: column }
            Rails.logger.debug "MediumBot: New best move found - Score: #{score}"
          end
        end
      end

      Rails.logger.debug "MediumBot: Final best move: #{best_move.inspect} with score: #{best_score}"
      best_move
    end

    def evaluate_column(column)
      return 15 if column.nil? || column.empty? # Base score for empty columns
      
      score = 0
      column_number = column.last[:column].to_i
      existing_cards = game.board_cards_for_player(game.player2_id, column_number) || []
      
      # Get all cards in this player's columns for cross-column patterns
      all_player_cards = (0..7).flat_map do |col|
        game.board_cards_for_player(game.player2_id, col) || []
      end.compact

      # If this is a new column (no existing cards), evaluate cross-column patterns only
      if existing_cards.empty?
        # Score for new patterns across columns
        all_cards = all_player_cards + [column.last]
        
        # Group by value for matching sets
        value_groups = all_cards.group_by { |card| card[:value] }
        value_groups.each do |value, cards|
          case cards.length
          when 2 then score += 25  # Pair
          when 3 then score += 50  # Three of a kind
          when 4 then score += 100 # Four of a kind
          end
        end

        # Group by suit for flushes
        suit_groups = all_cards.group_by { |card| card[:suit] }
        suit_groups.each do |suit, cards|
          score += cards.length * 10 if cards.length >= 3  # Potential flush
        end

        return score + 15 # Base score for new columns
      end

      # Rest of the evaluation for columns with existing cards
      all_cards = existing_cards + [column.last]
      
      # Evaluate existing column patterns
      value_groups = all_cards.group_by { |c| c[:value] }
      value_groups.each do |value, cards|
        case cards.length
        when 2 then score += 30  # Pair in same column
        when 3 then score += 60  # Three of a kind in same column
        when 4 then score += 120 # Four of a kind in same column
        end
      end

      # Score for flush potential
      suits = all_cards.map { |c| c[:suit] }
      if suits.uniq.length == 1
        score += all_cards.length * 20
      end

      Rails.logger.debug "MediumBot: Column evaluation - Score: #{score}, Cards: #{all_cards.map{|c| "#{c[:suit]}#{c[:value]}"}.join(',')}"
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
