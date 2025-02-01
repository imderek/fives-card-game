class GameScoringService
  def initialize(game)
    @game = game
    @scoring_service = PokerHandScoringService.new
  end

  def update_column_scores
    current_scores = @game.column_scores || {}
    
    # Score player 1's columns (0-3)
    (0..3).each do |col|
      cards = @game.board_cards_for_player(@game.player1_id, col)
      current_scores[col.to_s] = @scoring_service.score_partial_hand(cards)
    end
    
    # Score player 2's columns (4-7)
    (4..7).each do |col|
      cards = @game.board_cards_for_player(@game.player2_id, col)
      current_scores[col.to_s] = @scoring_service.score_partial_hand(cards)
    end
    
    @game.update!(column_scores: current_scores)
  end

  def complete_game
    return unless game_complete?

    calculate_final_scores
    determine_winner
    mark_game_completed if @game.winner_id
  end

  private

  def game_complete?
    return false if @game.completed?
    
    # Check if all columns that have cards are complete (5 cards)
    (0..7).all? do |col|
      cards = @game.board_cards_for_player(
        col < 4 ? @game.player1_id : @game.player2_id,
        col
      )
      cards.empty? || cards.length == 5
    end
  end

  def calculate_final_scores
    @game.player1_total_score = calculate_player_score(@game.player1_id)
    @game.player2_total_score = calculate_player_score(@game.player2_id)
    @game.save
  end

  def calculate_player_score(player_id)
    column_range = player_id == @game.player1_id ? (0..3) : (4..7)
    
    column_range.sum do |col|
      cards = @game.board_cards_for_player(player_id, col)
      @scoring_service.score_hand(cards)
    end
  end

  def determine_winner
    if @game.player1_total_score > @game.player2_total_score
      @game.winner_id = @game.player1_id
    elsif @game.player2_total_score > @game.player1_total_score
      @game.winner_id = @game.player2_id
    end
    # If scores are equal, winner remains nil (it's a tie)
  end

  def mark_game_completed
    @game.update(
      status: :completed
    )
  end
end 