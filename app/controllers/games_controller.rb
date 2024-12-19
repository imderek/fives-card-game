class GamesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_game, except: [:index, :new, :create]
  skip_before_action :verify_authenticity_token, if: -> { request.format.turbo_stream? }
  include ActionView::RecordIdentifier

  def index
    @games = Game.where('created_at >= ? AND (player1_id = ? OR player2_id = ?)', 23.hours.ago, current_user.id, current_user.id)
                 .order(created_at: :desc)
                 .includes(:player1, :player2)
                 .limit(5)
    @leaderboard = User.select('users.*, COUNT(games.id) as wins')
                      .left_joins(:won_games)
                      .where("email NOT LIKE ?", "%bot%")
                      .group('users.id')
                      .order('wins DESC')
                      .limit(5)
  end

  def show
    @player_hand = @game.player1_id == current_user.id ? @game.player1_hand : @game.player2_hand
  end

  def new
    @game = Game.new
  end

  def create
    @game = Game.new
    @game.player1 = current_user
    
    # If no player2 is selected, use the selected bot difficulty
    if params[:game][:player2_id].blank?
      bot_difficulty = params[:game][:bot_difficulty] || 'easy'
      bot_user = User.find_by(email: "#{bot_difficulty} bot")
      @game.player2_id = bot_user.id
    else
      @game.player2_id = params[:game][:player2_id]
    end

    if @game.save
      Turbo::StreamsChannel.broadcast_append_to(
        "games",
        target: "games_list",
        partial: "games/game_broadcast",
        locals: { game: @game }
      )
      
      redirect_to @game, notice: 'Game was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def play_card
    respond_to do |format|
      format.turbo_stream do
        @game.skip_broadcast = true  # Disable automatic broadcasting
        
        # Create the played_card hash with the required data
        played_card = params[:card].merge(player_id: current_user.id)
        
        if play_card_and_update_game(played_card)
          # Update column score after playing card
          column = played_card[:column].to_i
          column_cards = @game.board_cards_for_player(current_user.id, column)
          new_score = GameCompletionService.new(@game).score_partial_hand(column_cards)
          
          # Update the column scores in the database
          current_scores = @game.column_scores || {}
          current_scores[column.to_s] = new_score
          @game.update!(column_scores: current_scores)
          
          # Check for bot's turn and make move if needed
          make_bot_move if bot_turn?
          
          @game.skip_broadcast = false  # Re-enable and do one final broadcast
          @game.broadcast_game_state
          head :ok
        else
          render_error("Invalid move")
        end
      end
    end
  rescue => e
    Rails.logger.error "Error in play_card: #{e.message}\n#{e.backtrace.join("\n")}"
    render_error(e.message)
  end


  def destroy
    @game = Game.find(params[:id])
    
    if @game.destroy
      Turbo::StreamsChannel.broadcast_remove_to(
        "games",
        target: dom_id(@game)
      )
      
      redirect_to games_path
    end
  end

  private

  def set_game
    @game = Game.find(params[:id])
  end

  def game_params
    params.require(:game).permit(:game_type, :player2_id)
  end

  def valid_move?(card)
    return true  # Allow any card to be played
  end

  def update_player_hand(drawn_card)
    current_hand = current_user.id == @game.player1_id ? :player1_hand : :player2_hand
    @game[current_hand] << drawn_card
    @game.save
  end

  private

  def valid_turn?
    current_user.id == @game.current_turn && @game.turn_phase == "play_card"
  end

  def play_card_and_update_game(played_card)
    success = false
    
    begin
      Rails.logger.debug "Playing card: #{played_card.inspect}"
      update_board_state(played_card)
      
      # Remove card from player's hand and update current turn
      if played_card[:player_id] == @game.player1_id
        @game.player1_hand.delete_if { |card| card[:suit] == played_card[:suit] && card[:value] == played_card[:value] }
        drawn_card = @game.deck.pop
        @game.player1_hand << drawn_card if drawn_card
        @game.current_turn = @game.player2_id
      else
        @game.player2_hand.delete_if { |card| card[:suit] == played_card[:suit] && card[:value] == played_card[:value] }
        drawn_card = @game.deck.pop
        @game.player2_hand << drawn_card if drawn_card
        @game.current_turn = @game.player1_id
      end

      success = @game.save

      # Check for winner using the GameCompletionService
      GameCompletionService.new(@game).check_for_winner

      success
    rescue => e
      Rails.logger.error "Error in play_card_and_update_game: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      false
    end
  end

  def make_bot_move
    Rails.logger.debug "Making bot move for game #{@game.id}"
    
    strategy = BotService.get_strategy(@game)
    bot_move = strategy.make_move
    
    if bot_move
      Rails.logger.debug "Bot playing move: #{bot_move.inspect}"
      play_card_and_update_game(bot_move)
    end
  end

  def update_board_state(played_card)
    Rails.logger.debug "Updating board state with card: #{played_card.inspect}"
    Rails.logger.debug "Player1 ID: #{@game.player1_id}, Player2 ID: #{@game.player2_id}"
    
    # Initialize board_cards if nil
    @game.board_cards ||= []
    
    # Add the new card to board_cards without adjusting the column
    @game.board_cards << {
      suit: played_card[:suit],
      value: played_card[:value],
      player_id: played_card[:player_id],
      column: played_card[:column].to_i  # Just convert to integer, no adjustment
    }
    
    Rails.logger.debug "Final board_cards: #{@game.board_cards.inspect}"
  end

  def render_success_response
    render turbo_stream: turbo_stream.update("game_error", "") # Just clear any errors
  end

  def render_error(message)
    render turbo_stream: turbo_stream.update("game_error", message)
  end

  def bot_turn?
    Rails.logger.debug "Checking bot turn - current_turn: #{@game.current_turn}, player2: #{@game.player2.email}"
    is_bot = @game.player2.email.include?("bot")
    is_bot_turn = @game.current_turn == @game.player2_id
    
    if is_bot && is_bot_turn
      Rails.logger.debug "Bot's turn - making move"
      return true
    end
    
    false
  end
end