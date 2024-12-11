class GamesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_game, except: [:index, :new, :create]
  skip_before_action :verify_authenticity_token, if: -> { request.format.turbo_stream? }
  include ActionView::RecordIdentifier

  def index
    @games = Game.where(player1: current_user).where('created_at >= ?', 23.hours.ago).order(created_at: :desc)
  end

  def show
    @player_hand = @game.player1_id == current_user.id ? @game.player1_hand : @game.player2_hand
  end

  def new
    @game = Game.new
  end

  def create
    @game = Game.new(game_params)
    @game.player1 = current_user
    @game.player2_id ||= User.find_by(email: 'bot@example.com').id  # Use the bot user

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
        Rails.logger.debug "Current turn: #{@game.current_turn}"
        Rails.logger.debug "Current user: #{current_user.id}"
        Rails.logger.debug "Bot ID: #{@game.player2_id}"
        
        unless valid_turn?
          render_error("Not your turn or wrong phase") and return
        end

        card = params[:card].to_unsafe_h.symbolize_keys.merge(player_id: current_user.id)
        Rails.logger.debug "Playing card: #{card.inspect}"
        
        unless @game.valid_move?(card)
          render_error("Cannot add more than 5 cards to a column") and return
        end

        if play_card_and_update_game(card)
          render_success_response
        else
          render_error("Failed to update game")
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
    begin
      Rails.logger.debug "Playing card: #{played_card.inspect}"
      
      # Update board state with the played card
      update_board_state(played_card)
      
      # Remove card from player's hand and update current turn
      if played_card[:player_id] == @game.player1_id
        @game.player1_hand.delete_if { |card| card[:suit] == played_card[:suit] && card[:value] == played_card[:value] }
        # Draw a card for player 1
        drawn_card = @game.deck.pop
        @game.player1_hand << drawn_card if drawn_card
        @game.current_turn = @game.player2_id
      else
        @game.player2_hand.delete_if { |card| card[:suit] == played_card[:suit] && card[:value] == played_card[:value] }
        # Draw a card for player 2
        drawn_card = @game.deck.pop
        @game.player2_hand << drawn_card if drawn_card
        @game.current_turn = @game.player1_id
      end

      if @game.save
        # The after_update_commit callback will handle broadcasting
        
        # If it's the bot's turn, make their move
        if bot_turn?
          make_bot_move
        end
        
        true
      else
        Rails.logger.error "Failed to save game: #{@game.errors.full_messages}"
        false
      end
    rescue => e
      Rails.logger.error "Error in play_card_and_update_game: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      false
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
    render turbo_stream: [
      turbo_stream.replace("game-state", partial: "games/game_state", locals: { game: @game, current_user: current_user }),
      turbo_stream.replace("game-status", partial: "games/game_status", locals: { game: @game, current_user: current_user }),
      turbo_stream.replace("player-controls", partial: "games/player_controls", locals: { game: @game, current_user: current_user })
    ]
  end

  def render_error(message)
    render turbo_stream: turbo_stream.update("game_error", message)
  end

  def bot_turn?
    @game.current_turn == @game.player2_id && @game.player2.email == 'bot@example.com'
  end

  def make_bot_move
    # Pick a random card and column for the bot
    bot_hand = @game.player2_hand
    return if bot_hand.empty?
    
    # Get available columns (those with fewer than 5 cards)
    available_columns = (4..7).select do |col|
      @game.board_cards.count { |card| card[:player_id] == @game.player2_id && card[:column] == col } < 5
    end
    
    Rails.logger.debug "Available columns for bot: #{available_columns.inspect}"
    return if available_columns.empty?  # No valid moves available
    
    bot_card = bot_hand.sample
    bot_column = available_columns.sample  # Already using columns 4-7
    
    played_card = {
      suit: bot_card[:suit],
      value: bot_card[:value],
      player_id: @game.player2_id,
      column: bot_column
    }
    
    Rails.logger.debug "Bot playing card #{bot_card.inspect} in column #{bot_column}"
    play_card_and_update_game(played_card)
  end
end