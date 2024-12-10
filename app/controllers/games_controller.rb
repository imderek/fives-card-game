class GamesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_game, except: [:index, :new, :create]
  skip_before_action :verify_authenticity_token, if: -> { request.format.turbo_stream? }
  include ActionView::RecordIdentifier

  def index
    @games = Game.where(player1: current_user).where('created_at >= ?', 1.hour.ago).order(created_at: :desc)
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
        if current_user.id == @game.current_turn && @game.turn_phase == "play_card"
          card = JSON.parse(params[:card]).symbolize_keys
          card[:player_id] = current_user.id
          
          if @game.valid_move?(card)
            # Remove card from player's hand
            current_hand = current_user.id == @game.player1_id ? :player1_hand : :player2_hand
            @game[current_hand] = @game[current_hand].reject { |c| c[:suit] == card[:suit] && c[:value] == card[:value] }
            
            # Get current board state
            board_state = GameBoardSerializer.new(@game).as_json
            
            # Determine which player's columns to update
            player_key = current_user.id == @game.player1_id ? :player_1 : :player_2
            
            # Add card to the appropriate column
            board_state[player_key][:columns][card[:column]][:cards] << "#{card[:value]}#{card[:suit].first.upcase}"
            
            # Update the game's board_cards with the new state
            @game.board_cards = []
            [:player_1, :player_2].each do |player_key|
              player_id = player_key == :player_1 ? @game.player1_id : @game.player2_id
              board_state[player_key][:columns].each_with_index do |column, column_index|
                column[:cards].each do |card_code|
                  value = card_code[0..-2]
                  suit = card_code[-1].downcase
                  @game.board_cards << {
                    suit: suit,
                    value: value,
                    player_id: player_id,
                    column: column_index
                  }
                end
              end
            end

            @game.turn_phase = :draw_card
            
            if @game.save
              render turbo_stream: [
                turbo_stream.replace("game-state", partial: "games/game_state", locals: { game: @game, current_user: current_user }),
                turbo_stream.replace("game-status", partial: "games/game_status", locals: { game: @game, current_user: current_user }),
                turbo_stream.replace("player-controls", partial: "games/player_controls", locals: { game: @game, current_user: current_user })
              ]
            else
              render turbo_stream: turbo_stream.update("game_error", "Failed to update game")
            end
          else
            render turbo_stream: turbo_stream.update("game_error", "Cannot add more than 5 cards to a column")
          end
        else
          render turbo_stream: turbo_stream.update("game_error", "Not your turn or wrong phase")
        end
      end
    end
  rescue => e
    Rails.logger.error "Error in play_card: #{e.message}\n#{e.backtrace.join("\n")}"
    render turbo_stream: turbo_stream.update("game_error", e.message)
  end

  def draw_card
    respond_to do |format|
      format.turbo_stream do
        if current_user.id == @game.current_turn && @game.turn_phase == "draw_card"
          drawn_card = @game.deck.pop
          current_hand = current_user.id == @game.player1_id ? :player1_hand : :player2_hand
          
          # Add card to player's hand
          @game[current_hand] = @game[current_hand] + [drawn_card.symbolize_keys]
          
          # End turn and switch to play phase
          @game.turn_phase = :play_card
          @game.current_turn = @game.player2_id || @game.player1_id
          
          if @game.save!
            render turbo_stream: [
              turbo_stream.replace("game-state", partial: "games/game_state", locals: { game: @game, current_user: current_user }),
              turbo_stream.replace("game-status", partial: "games/game_status", locals: { game: @game, current_user: current_user }),
              turbo_stream.replace("player-controls", partial: "games/player_controls", locals: { game: @game, current_user: current_user })
            ]
          else
            render turbo_stream: turbo_stream.update("game_error", "Failed to update game")
          end
        else
          render turbo_stream: turbo_stream.update("game_error", "Not your turn or wrong phase")
        end
      end
    end
  rescue => e
    Rails.logger.error "Error in draw_card: #{e.message}\n#{e.backtrace.join("\n")}"
    render turbo_stream: turbo_stream.update("game_error", e.message)
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
end