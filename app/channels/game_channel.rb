class GameChannel < ApplicationCable::Channel
  def subscribed
    game = Game.find(params[:game_id])
    stream_for game
  end

  def self.broadcast_update(game)
    broadcast_to(game, {
      game: game.as_json(
        methods: [
          :player1_hand, 
          :player2_hand, 
          :board_cards,
          :player1_discard_pile,
          :player2_discard_pile
        ]
      )
    })
  end

  def unsubscribed
    # Cleanup when channel is unsubscribed
  end
end 