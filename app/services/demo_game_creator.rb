class DemoGameCreator
  def self.create_game(player1:, player2:, scenario: :powerful_hands)
    new(player1, player2).create_game(scenario)
  end

  def initialize(player1, player2)
    @player1 = player1
    @player2 = player2
  end

  def create_game(scenario)
    game = Game.new(base_attributes)
    
    # Apply the selected scenario
    send("apply_#{scenario}_scenario", game)
    
    # Generate remaining deck
    populate_deck(game)
    
    # Save and calculate scores
    game.instance_variable_set(:@skip_setup, true)
    game.save!
    calculate_scores(game)
    
    game
  end

  private

  def base_attributes
    {
      player1: @player1,
      player2: @player2,
      status: "waiting",
      game_type: "pvp",
      turn_phase: "play_card",
      current_turn: @player1.id,
      player1_hand: [],
      player2_hand: [],
      board_cards: []
    }
  end

  def apply_powerful_hands_scenario(game)
    game.player1_hand = [
      {suit: "♠", value: "2"},
      {suit: "♥", value: "3"},
      {suit: "♦", value: "4"},
      {suit: "♣", value: "5"},
      {suit: "♠", value: "6"}
    ]
    
    game.player2_hand = [
      {suit: "♣", value: "10"},
      {suit: "♦", value: "J"},
      {suit: "♥", value: "Q"},
      {suit: "♠", value: "K"},
      {suit: "♣", value: "A"}
    ]

    game.board_cards = [
      # Player 1's columns
      *straight_in_column(0, @player1.id),
      *flush_in_column(1, @player1.id),
      *full_house_in_column(2, @player1.id),
      *quads_in_column(3, @player1.id),

      # Player 2's columns
      *high_cards_in_column(4, @player2.id),
      *pair_in_column(5, @player2.id),
      *two_pair_in_column(6, @player2.id),
      *trips_in_column(7, @player2.id)
    ]
  end

  def apply_beginner_scenario(game)
    # Example: Only one strong hand per player
    game.player1_hand = [
      {suit: "♠", value: "2"},
      {suit: "♥", value: "3"},
      {suit: "♦", value: "4"},
      {suit: "♣", value: "5"},
      {suit: "♠", value: "6"}
    ]
    
    game.player2_hand = [
      {suit: "♣", value: "10"},
      {suit: "♦", value: "J"},
      {suit: "♥", value: "Q"},
      {suit: "♠", value: "K"},
      {suit: "♣", value: "A"}
    ]

    game.board_cards = [
      *straight_in_column(0, @player1.id),
      *high_cards_in_column(1, @player1.id),
      *high_cards_in_column(2, @player1.id),
      *high_cards_in_column(3, @player1.id),
      
      *trips_in_column(4, @player2.id),
      *high_cards_in_column(5, @player2.id),
      *high_cards_in_column(6, @player2.id),
      *high_cards_in_column(7, @player2.id)
    ]
  end

  # Helper methods for different poker hands
  def straight_in_column(column, player_id)
    [
      {suit: "♥", value: "2", player_id: player_id, column: column},
      {suit: "♣", value: "3", player_id: player_id, column: column},
      {suit: "♦", value: "4", player_id: player_id, column: column},
      {suit: "♠", value: "5", player_id: player_id, column: column},
      {suit: "♥", value: "6", player_id: player_id, column: column}
    ]
  end

  def flush_in_column(column, player_id)
    [
      {suit: "♥", value: "2", player_id: player_id, column: column},
      {suit: "♥", value: "5", player_id: player_id, column: column},
      {suit: "♥", value: "8", player_id: player_id, column: column},
      {suit: "♥", value: "J", player_id: player_id, column: column},
      {suit: "♥", value: "K", player_id: player_id, column: column}
    ]
  end

  def full_house_in_column(column, player_id)
    [
      {suit: "♠", value: "J", player_id: player_id, column: column},
      {suit: "♥", value: "J", player_id: player_id, column: column},
      {suit: "♦", value: "J", player_id: player_id, column: column},
      {suit: "♣", value: "4", player_id: player_id, column: column},
      {suit: "♦", value: "4", player_id: player_id, column: column}
    ]
  end

  def quads_in_column(column, player_id)
    [
      {suit: "♠", value: "A", player_id: player_id, column: column},
      {suit: "♥", value: "A", player_id: player_id, column: column},
      {suit: "♦", value: "A", player_id: player_id, column: column},
      {suit: "♣", value: "A", player_id: player_id, column: column}
    ]
  end

  def high_cards_in_column(column, player_id)
    [
      {suit: "♦", value: "K", player_id: player_id, column: column},
      {suit: "♣", value: "2", player_id: player_id, column: column},
      {suit: "♠", value: "3", player_id: player_id, column: column},
      {suit: "♥", value: "9", player_id: player_id, column: column}
    ]
  end

  def pair_in_column(column, player_id)
    [
      {suit: "♠", value: "10", player_id: player_id, column: column},
      {suit: "♥", value: "10", player_id: player_id, column: column},
      {suit: "♦", value: "5", player_id: player_id, column: column},
      {suit: "♣", value: "6", player_id: player_id, column: column},
      {suit: "♠", value: "9", player_id: player_id, column: column}
    ]
  end

  def two_pair_in_column(column, player_id)
    [
      {suit: "♠", value: "8", player_id: player_id, column: column},
      {suit: "♣", value: "8", player_id: player_id, column: column},
      {suit: "♥", value: "7", player_id: player_id, column: column},
      {suit: "♣", value: "7", player_id: player_id, column: column},
      {suit: "♦", value: "3", player_id: player_id, column: column}
    ]
  end

  def trips_in_column(column, player_id)
    [
      {suit: "♠", value: "Q", player_id: player_id, column: column},
      {suit: "♦", value: "Q", player_id: player_id, column: column},
      {suit: "♣", value: "Q", player_id: player_id, column: column},
      {suit: "♥", value: "4", player_id: player_id, column: column},
      {suit: "♦", value: "7", player_id: player_id, column: column}
    ]
  end

  def populate_deck(game)
    used_cards = (game.board_cards + game.player1_hand + game.player2_hand)
      .map { |card| "#{card[:suit]}#{card[:value]}" }
    
    all_cards = []
    ['♠', '♣', '♥', '♦'].each do |suit|
      ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].each do |value|
        card_key = "#{suit}#{value}"
        all_cards << {suit: suit, value: value} unless used_cards.include?(card_key)
      end
    end
    
    game.deck = all_cards.shuffle
  end

  def calculate_scores(game)
    current_scores = {}
    
    # Score player 1's columns (0-3)
    (0..3).each do |col|
      cards = game.board_cards_for_player(game.player1_id, col)
      current_scores[col.to_s] = GameCompletionService.new(game).score_partial_hand(cards)
    end

    # Score player 2's columns (4-7)
    (4..7).each do |col|
      cards = game.board_cards_for_player(game.player2_id, col)
      current_scores[col.to_s] = GameCompletionService.new(game).score_partial_hand(cards)
    end

    game.update!(column_scores: current_scores)
  end
end 