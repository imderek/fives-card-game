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
        unless valid_turn?
          render_error("Not your turn or wrong phase") and return
        end

        card = params[:card].to_unsafe_h.symbolize_keys.merge(player_id: current_user.id)
        
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

  def play_card_and_update_game(card)
    # Remove played card from hand
    current_hand = current_user.id == @game.player1_id ? :player1_hand : :player2_hand
    @game[current_hand] = @game[current_hand].reject do |c| 
      c[:suit] == card[:suit] && c[:value] == card[:value]
    end

    # Update board state
    update_board_state(card)
    
    # Draw new card
    drawn_card = @game.deck.pop
    @game[current_hand] = @game[current_hand] + [drawn_card.symbolize_keys]
    
    # Update turn
    @game.current_turn = @game.player2_id || @game.player1_id
    @game.turn_phase = :play_card
    
    @game.save
  end

  def update_board_state(played_card)
    board_state = GameBoardSerializer.new(@game).as_json
    player_key = current_user.id == @game.player1_id ? :player_1 : :player_2
    
    # Add card to column
    board_state[player_key][:columns][played_card[:column].to_i][:cards] << 
      "#{played_card[:value]}#{played_card[:suit].first.upcase}"
    
    # Convert board state back to board_cards array
    @game.board_cards = []
    [:player_1, :player_2].each do |player_key|
      player_id = player_key == :player_1 ? @game.player1_id : @game.player2_id
      board_state[player_key][:columns].each_with_index do |column, column_index|
        column[:cards].each do |card_code|
          @game.board_cards << {
            suit: card_code[-1].downcase,
            value: card_code[0..-2],
            player_id: player_id,
            column: column_index
          }
        end
      end
    end
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
end