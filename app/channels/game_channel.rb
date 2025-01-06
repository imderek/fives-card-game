class GameChannel < ApplicationCable::Channel
  def subscribed
    game = Game.find(params[:game_id])
    Rails.logger.info "GameChannel#subscribed: game_id=#{params[:game_id]}"
    stream_for game
    Rails.logger.info "Successfully subscribed to game #{game.id}"
  rescue => e
    Rails.logger.error "Error in GameChannel#subscribed: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    reject
  end

  def self.broadcast_update(game)
    Rails.logger.info "Broadcasting update for game #{game.id}"
    broadcast_to(game, {
      game: game.as_json(
        methods: [
          :player1_hand, 
          :player2_hand, 
          :board_cards,
          :player1_discard_pile,
          :player2_discard_pile,
          :deck,
          :column_scores
        ]
      )
    })
    Rails.logger.info "Finished broadcasting update for game #{game.id}"
  end

  def unsubscribed
    Rails.logger.info "GameChannel#unsubscribed"
  end
end 