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
      score = cards.length == 5 ? @scoring_service.score_hand(cards) : @scoring_service.score_partial_hand(cards)
      current_scores[col.to_s] = score
    end
    
    # Score player 2's columns (4-7)
    (4..7).each do |col|
      cards = @game.board_cards_for_player(@game.player2_id, col)
      score = cards.length == 5 ? @scoring_service.score_hand(cards) : @scoring_service.score_partial_hand(cards)
      current_scores[col.to_s] = score
    end
    
    # Score hands
    current_scores["player1_hand"] = @scoring_service.score_hand(@game.player1_hand) if @game.player1_hand.present?
    current_scores["player2_hand"] = @scoring_service.score_hand(@game.player2_hand) if @game.player2_hand.present?
    
    @game.update!(column_scores: current_scores)
    
    # Calculate final scores after updating column scores
    calculate_final_scores
  end

  def complete_game
    return unless game_complete?

    # First, ensure column scores are updated
    update_column_scores
    
    # Then calculate final scores
    calculate_final_scores
    
    # Determine winner
    determine_winner
    
    # Mark game as completed
    @game.update!(
      status: :completed,
      winner_id: @game.winner_id
    )
  end

  private

  def game_complete?
    return false if @game.completed?
    
    # Count cards in each column
    column_counts = (0..7).map do |col|
      cards = @game.board_cards_for_player(
        col < 4 ? @game.player1_id : @game.player2_id,
        col
      )
      cards.length
    end

    # Game is complete only when ALL columns have exactly 5 cards
    column_counts.all? { |count| count == 5 }
  end

  def calculate_final_scores
    # Get current column scores
    current_scores = @game.column_scores || {}

    # Add hand scores to column_scores first
    current_scores["player1_hand"] = @scoring_service.score_hand(@game.player1_hand)
    current_scores["player2_hand"] = @scoring_service.score_hand(@game.player2_hand)

    # Then calculate total scores
    @game.player1_total_score = calculate_player_score(@game.player1_id)
    @game.player2_total_score = calculate_player_score(@game.player2_id)

    # Save both total scores and column scores
    @game.update(
      column_scores: current_scores,
      player1_total_score: @game.player1_total_score,
      player2_total_score: @game.player2_total_score
    )
  end

  def calculate_player_score(player_id)
    column_range = player_id == @game.player1_id ? (0..3) : (4..7)
    
    # Score from columns (only complete columns of 5 cards)
    column_score = column_range.sum do |col|
      cards = @game.board_cards_for_player(player_id, col)
      cards.length == 5 ? @scoring_service.score_hand(cards) : 0
    end

    # Score from remaining cards in hand - use score_hand instead of score_partial_hand
    hand = player_id == @game.player1_id ? @game.player1_hand : @game.player2_hand
    hand_score = @scoring_service.score_hand(hand)

    column_score + hand_score
  end

  def determine_winner
    if @game.player1_total_score > @game.player2_total_score
      @game.winner_id = @game.player1_id
    elsif @game.player2_total_score > @game.player1_total_score
      @game.winner_id = @game.player2_id
    end
    # If scores are equal, winner remains nil (it's a tie)
  end
end 