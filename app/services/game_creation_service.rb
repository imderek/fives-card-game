class GameCreationService
  def initialize(user, params)
    @user = user
    @params = params
  end

  def call
    game = Game.new
    game.player1 = @user

    if @params[:bot_difficulty].present?
      setup_bot_game(game)
    else
      setup_pvp_game(game)
    end

    game
  end

  private

  def setup_bot_game(game)
    game.player2 = User.find_by(email: "#{@params[:bot_difficulty]} bot")
    game.game_type = 'bot'
    game.save
  end

  def setup_pvp_game(game)
    return game unless @params[:player2_id].present?
    
    game.player2 = User.find_by(id: @params[:player2_id])
    game.game_type = 'pvp'
    game.save
  end
end 