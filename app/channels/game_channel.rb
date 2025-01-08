class GameChannel < ApplicationCable::Channel
  def subscribed
    game = Game.find(params[:game_id])
    Rails.logger.info "GameChannel#subscribed: game_id=#{params[:game_id]}"

    # Ensure the current user is authorized to view this game
    if (game.bot? && game.player1_id == current_user.id) ||
       (game.pvp? && [game.player1_id, game.player2_id].include?(current_user.id))
      stream_for game
      Rails.logger.info "Successfully subscribed to game #{game.id}"
    else
      Rails.logger.warn "Unauthorized subscription attempt to game #{game.id} by user #{current_user.id}"
      reject
    end
  rescue => e
    Rails.logger.error "Error in GameChannel#subscribed: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    reject
  end

  def self.broadcast_update(game)
    Rails.logger.info "Broadcasting update for game #{game.id}"

    # For both bot and PvP games, broadcast shared state to both players
    shared_state = game.as_json(
      methods: [
        :board_cards,
        :player1_discard_pile,
        :player2_discard_pile,
        :column_scores,
        :current_turn,
        :winner_id  # Make sure winner is included
      ]
    )

    # Then broadcast player-specific hands
    [1, 2].each do |player_num|
      player_id = game.send("player#{player_num}_id")
      player_hand = game.send("player#{player_num}_hand")
      
      broadcast_to(game, {
        recipient_id: player_id,
        game: shared_state.merge(
          # Only include this player's hand
          "player#{player_num}_hand" => player_hand,
          # For the other player's hand, just send the count
          "player#{3-player_num}_hand" => player_hand&.length || 0
        )
      })
    end

    Rails.logger.info "Finished broadcasting update for game #{game.id}"
  end

  def unsubscribed
    Rails.logger.info "GameChannel#unsubscribed"
  end
end 