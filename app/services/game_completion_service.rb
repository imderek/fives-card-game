class GameCompletionService
  def initialize(game)
    @game = game
  end

  def check_for_winner
    return unless board_full?
    
    player1_score = calculate_player_score(@game.player1_id)
    player2_score = calculate_player_score(@game.player2_id)
    
    @game.update(
      status: :completed,
      winner_id: determine_winner(player1_score, player2_score)
    )
  end

  def board_full?
    # Check player 1's columns (0-3)
    player1_full = (0..3).all? do |column|
      @game.board_cards.count { |card| card[:player_id] == @game.player1_id && card[:column] == column } >= 5
    end

    # Check player 2's columns (4-7)
    player2_full = (4..7).all? do |column|
      @game.board_cards.count { |card| card[:player_id] == @game.player2_id && card[:column] == column } >= 5
    end

    player1_full && player2_full
  end

  def calculate_player_score(player_id)
    # Implement scoring logic here
    @game.board_cards.count { |card| card[:player_id] == player_id }
  end

  def determine_winner(player1_score, player2_score)
    return nil if player1_score == player2_score
    player1_score > player2_score ? @game.player1_id : @game.player2_id
  end
end 