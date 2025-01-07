class GamesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_game, except: [:index, :new, :create]
  skip_before_action :verify_authenticity_token, if: -> { request.format.turbo_stream? }
  include ActionView::RecordIdentifier

  def index
    @games = Game.where('(player1_id = ? OR player2_id = ?)', current_user.id, current_user.id)
                 .order(created_at: :desc)
                 .includes(:player1, :player2)
                 .limit(7)
    @high_scores = if ActiveRecord::Base.connection.adapter_name.downcase == 'postgresql'
      Game.select('player1_id, BOOL_OR(is_private) as is_private, MAX(player1_total_score) as high_score')
    else
      Game.select('player1_id, MAX(is_private) as is_private, MAX(player1_total_score) as high_score')
    end
          .where('player1_total_score > 0')
          .where(is_private: false)
          .includes(:player1)
          .group('player1_id')
          .order('high_score DESC')
          .limit(5)
  end

  def show
    @game = Game.find(params[:id])
    @game_with_players = @game.as_json(
      include: [:player1, :player2],
      methods: [:player1_hand, :player2_hand, :board_cards]
    )

    respond_to do |format|
      format.html
      format.json { render json: { game: @game_with_players } }
    end
  end

  def new
    @game = Game.new

    @available_players = User.where.not(id: current_user.id)
                             .where.not("email LIKE ?", "%bot%")
                             .order('email ASC')
  end

  def create
    @game = Game.new
    @game.player1 = current_user
    
    if params[:game][:bot_difficulty].present?
      setup_bot_game
    else
      setup_pvp_game
    end

    if @game.save
      # Broadcast to both the general stream and player-specific streams
      Turbo::StreamsChannel.broadcast_prepend_to(
        "games",
        target: "games_list",
        partial: "games/game",
        locals: { game: @game, current_user: current_user }
      )

      # Broadcast to each player's specific stream
      [@game.player1_id, @game.player2_id].each do |player_id|
        Turbo::StreamsChannel.broadcast_prepend_to(
          "user_#{player_id}_games",
          target: "games_list",
          partial: "games/game",
          locals: { game: @game, current_user: current_user }
        )
      end

      respond_to do |format|
        format.html { redirect_to @game }
        format.json { render json: { id: @game.id }, status: :created }
      end
    else
      respond_to do |format|
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: { errors: @game.errors }, status: :unprocessable_entity }
      end
    end
  end

  def play_card
    respond_to do |format|
      format.turbo_stream do
        @game.skip_broadcast = true  # Disable automatic broadcasting
        
        played_card = params[:card].merge(player_id: current_user.id)
        
        if play_card_and_update_game(played_card)
          # Update scores for both players' columns
          current_scores = @game.column_scores || {}
          
          # Score player 1's columns (0-3)
          (0..3).each do |col|
            cards = @game.board_cards_for_player(@game.player1_id, col)
            current_scores[col.to_s] = GameCompletionService.new(@game).score_partial_hand(cards)
          end
          
          # Score player 2's columns (4-7)
          (4..7).each do |col|
            cards = @game.board_cards_for_player(@game.player2_id, col)
            current_scores[col.to_s] = GameCompletionService.new(@game).score_partial_hand(cards)
          end
          
          @game.update!(column_scores: current_scores)
          @game.broadcast_game_state  # First broadcast with updated scores
          
          if bot_turn?
            make_bot_move 
            # Update scores again after bot move
            current_scores = @game.column_scores || {}
            (0..7).each do |col|
              player_id = col < 4 ? @game.player1_id : @game.player2_id
              cards = @game.board_cards_for_player(player_id, col)
              current_scores[col.to_s] = GameCompletionService.new(@game).score_partial_hand(cards)
            end
            @game.update!(column_scores: current_scores)
          end
          
          @game.skip_broadcast = false
          @game.broadcast_game_state  # Final broadcast
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

  def discard_card
    respond_to do |format|
      format.turbo_stream do
        @game.skip_broadcast = true
        
        if valid_turn?
          # Check if player has already discarded by looking at their discard pile
          if (current_user.id == @game.player1_id && !@game.player1_discard_pile.empty?) ||
             (current_user.id == @game.player2_id && !@game.player2_discard_pile.empty?)
            render_error("You can only discard one card per game")
            return
          end

          # Initialize discard piles if they're nil
          @game.player1_discard_pile ||= []
          @game.player2_discard_pile ||= []
          
          discarded_card = {
            suit: params[:card][:suit],
            value: params[:card][:value]
          }
          
          if current_user.id == @game.player1_id
            @game.player1_hand.delete_if { |card| card[:suit] == discarded_card[:suit] && card[:value] == discarded_card[:value] }
            @game.player1_discard_pile << discarded_card
            drawn_card = @game.deck.pop
            @game.player1_hand << drawn_card if drawn_card
            @game.current_turn = @game.player2_id
          else
            @game.player2_hand.delete_if { |card| card[:suit] == discarded_card[:suit] && card[:value] == discarded_card[:value] }
            @game.player2_discard_pile << discarded_card
            drawn_card = @game.deck.pop
            @game.player2_hand << drawn_card if drawn_card
            @game.current_turn = @game.player1_id
          end
          
          if @game.save
            @game.broadcast_game_state
            
            if bot_turn?
              make_bot_move
            end
            
            @game.skip_broadcast = false
            @game.broadcast_game_state
            head :ok
          else
            render_error("Failed to save game state")
          end
        else
          render_error("Invalid turn")
        end
      end
    end
  rescue => e
    Rails.logger.error "Error in discard_card: #{e.message}\n#{e.backtrace.join("\n")}"
    render_error(e.message)
  end

  def destroy
    @game = Game.find(params[:id])
    
    if @game.destroy
      # Broadcast removal to both players
      [@game.player1_id, @game.player2_id].each do |player_id|
        Turbo::StreamsChannel.broadcast_remove_to(
          "games_for_user_#{player_id}",
          target: dom_id(@game)
        )
      end
      
      redirect_to games_path
    end
  end

  private

  def set_game
    @game = Game.find(params[:id])
  end

  def game_params
    params.require(:game).permit(:player2_id)
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
      Rails.logger.debug "Initial hand state: #{@game.player1_hand.inspect}" if played_card[:player_id] == @game.player1_id
      Rails.logger.debug "Initial hand state: #{@game.player2_hand.inspect}" if played_card[:player_id] == @game.player2_id
      
      update_board_state(played_card)
      
      # Remove card from player's hand and update current turn
      if played_card[:player_id] == @game.player1_id
        # Remove the played card
        Rails.logger.debug "Before removing card from player1 hand: #{@game.player1_hand.inspect}"
        @game.player1_hand.delete_if { |card| 
          card[:suit] == played_card[:suit] && card[:value] == played_card[:value] 
        }
        Rails.logger.debug "After removing card from player1 hand: #{@game.player1_hand.inspect}"
        
        # Draw a new card and add it to hand
        drawn_card = @game.deck.pop
        if drawn_card
          Rails.logger.debug "Player 1 drew: #{drawn_card.inspect}"
          @game.player1_hand = @game.player1_hand + [drawn_card]
          Rails.logger.debug "Final player1 hand: #{@game.player1_hand.inspect}"
        end
        
        @game.current_turn = @game.player2_id
      else
        # Remove the played card
        Rails.logger.debug "Before removing card from player2 hand: #{@game.player2_hand.inspect}"
        @game.player2_hand.delete_if { |card| 
          card[:suit] == played_card[:suit] && card[:value] == played_card[:value] 
        }
        Rails.logger.debug "After removing card from player2 hand: #{@game.player2_hand.inspect}"
        
        # Draw a new card and add it to hand
        drawn_card = @game.deck.pop
        if drawn_card
          Rails.logger.debug "Player 2 drew: #{drawn_card.inspect}"
          @game.player2_hand = @game.player2_hand + [drawn_card]
          Rails.logger.debug "Final player2 hand: #{@game.player2_hand.inspect}"
        end
        
        @game.current_turn = @game.player1_id
      end

      success = @game.save
      Rails.logger.debug "Save successful: #{success}"
      Rails.logger.debug "Final game state after save: #{@game.attributes.inspect}"

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
    return false unless @game.bot? # Only check for bot turns in bot games
    return false unless @game.current_turn == @game.player2_id
    
    @game.player2.email.include?("bot")
  end

  def setup_bot_game
    difficulty = params[:game][:bot_difficulty] || 'easy'
    bot_user = User.find_by(email: "#{difficulty} bot")
    
    @game.player2 = bot_user
    @game.game_type = :bot
  end

  def setup_pvp_game
    @game.player2_id = params[:game][:player2_id]
    @game.game_type = :pvp
  end
end