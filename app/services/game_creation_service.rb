class GameCreationService
  def initialize(current_user)
    @current_user = current_user
  end

  def create(params)
    @game = Game.new(player1: @current_user)
    
    if params[:bot_difficulty].present?
      setup_bot_game(params[:bot_difficulty])
    else
      setup_pvp_game(params[:player2_id])
    end

    if @game.save
      broadcast_game_creation
      @game
    else
      false
    end
  end

  private

  def setup_bot_game(difficulty)
    difficulty ||= 'easy'
    bot_user = User.find_by(email: "#{difficulty} bot")
    
    @game.player2 = bot_user
    @game.game_type = :bot
  end

  def setup_pvp_game(player2_id)
    @game.player2_id = player2_id
    @game.game_type = :pvp
  end

  def broadcast_game_creation
    [@game.player1_id, @game.player2_id].each do |player_id|
      Turbo::StreamsChannel.broadcast_prepend_to(
        "user_#{player_id}_games",
        target: "games_list",
        partial: "games/game",
        locals: { game: @game, current_user: User.find(player_id), new_game: true }
      )
      
      Turbo::StreamsChannel.broadcast_remove_to(
        "user_#{player_id}_games",
        target: "no_games_message"
      )
    end
  end
end 