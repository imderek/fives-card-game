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
    send("apply_#{scenario}_scenario", game)
    
    # Generate remaining deck
    populate_deck(game)
    
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

  def apply_completed_powerful_scenario(game)
    # Player 1's hand - mix of high cards and potential straight/flush draws
    game.player1_hand = [
      {suit: "♠", value: "K"},
      {suit: "♥", value: "Q"},
      {suit: "♦", value: "J"},
      {suit: "♣", value: "10"},
      {suit: "♠", value: "9"},
      {suit: "♥", value: "8"}
    ]
    
    # Player 2's hand - mix of high cards and pairs potential
    game.player2_hand = [
      {suit: "♦", value: "A"},
      {suit: "♣", value: "K"},
      {suit: "♥", value: "J"},
      {suit: "♠", value: "A"},
      {suit: "♦", value: "8"},
      {suit: "♣", value: "7"}
    ]

    game.board_cards = [
      # Player 1's columns (0-3)
      # Flush in column 0
      {suit: "♥", value: "2", player_id: @player1.id, column: 0},
      {suit: "♥", value: "5", player_id: @player1.id, column: 0},
      {suit: "♥", value: "7", player_id: @player1.id, column: 0},
      {suit: "♥", value: "9", player_id: @player1.id, column: 0},
      {suit: "♥", value: "K", player_id: @player1.id, column: 0},

      # Full House in column 1
      {suit: "♠", value: "4", player_id: @player1.id, column: 1},
      {suit: "♦", value: "4", player_id: @player1.id, column: 1},
      {suit: "♣", value: "4", player_id: @player1.id, column: 1},
      {suit: "♠", value: "7", player_id: @player1.id, column: 1},
      {suit: "♦", value: "7", player_id: @player1.id, column: 1},

      # Quads in column 2
      {suit: "♦", value: "10", player_id: @player1.id, column: 2},
      {suit: "♣", value: "10", player_id: @player1.id, column: 2},
      {suit: "♠", value: "10", player_id: @player1.id, column: 2},
      {suit: "♥", value: "10", player_id: @player1.id, column: 2},

      # Straight Flush in column 3
      {suit: "♠", value: "4", player_id: @player1.id, column: 3},
      {suit: "♠", value: "5", player_id: @player1.id, column: 3},
      {suit: "♠", value: "6", player_id: @player1.id, column: 3},
      {suit: "♠", value: "7", player_id: @player1.id, column: 3},
      {suit: "♠", value: "8", player_id: @player1.id, column: 3},

      # Player 2's columns (4-7)
      # Pair moves to column 4
      {suit: "♥", value: "3", player_id: @player2.id, column: 4},
      {suit: "♦", value: "3", player_id: @player2.id, column: 4},
      {suit: "♣", value: "6", player_id: @player2.id, column: 4},
      {suit: "♠", value: "J", player_id: @player2.id, column: 4},
      {suit: "♣", value: "9", player_id: @player2.id, column: 4},

      # Two pair moves to column 5
      {suit: "♣", value: "2", player_id: @player2.id, column: 5},
      {suit: "♠", value: "2", player_id: @player2.id, column: 5},
      {suit: "♠", value: "5", player_id: @player2.id, column: 5},
      {suit: "♦", value: "5", player_id: @player2.id, column: 5},
      {suit: "♥", value: "6", player_id: @player2.id, column: 5},

      # Trips moves to column 6
      {suit: "♦", value: "Q", player_id: @player2.id, column: 6},
      {suit: "♣", value: "3", player_id: @player2.id, column: 6},
      {suit: "♠", value: "10", player_id: @player2.id, column: 6},
      {suit: "♥", value: "10", player_id: @player2.id, column: 6},
      {suit: "♦", value: "10", player_id: @player2.id, column: 6},

      # Straight in column 7
      {suit: "♦", value: "2", player_id: @player2.id, column: 7},
      {suit: "♠", value: "3", player_id: @player2.id, column: 7},
      {suit: "♥", value: "4", player_id: @player2.id, column: 7},
      {suit: "♣", value: "5", player_id: @player2.id, column: 7},
      {suit: "♦", value: "6", player_id: @player2.id, column: 7}
    ]
  end

  def apply_incompleted_powerful_scenario(game)
    # Player 1's hand remains the same - cards that complete powerful hands
    game.player1_hand = [
      {suit: "♦", value: "7"},  # Completes straight in col 0
      {suit: "♥", value: "3"},  # Completes flush in col 1
      {suit: "♣", value: "7"},  # Completes full house in col 2
      {suit: "♠", value: "3"},  # Completes straight flush in col 3
      {suit: "♦", value: "10"}, # Completes quads in col 7
      {suit: "♦", value: "Q"}
    ]

    game.player2_hand = [
      {suit: "♦", value: "K"},  # Completes pair in col 4
      {suit: "♥", value: "3"},  # Completes trips in col 5
      {suit: "♣", value: "5"},  # Completes three pair in col 6
      {suit: "♠", value: "A"},
      {suit: "♠", value: "K"},
      {suit: "♣", value: "J"}
    ]

    game.board_cards = [
      # Player 1's columns (0-3)
      # Nearly flush in column 0 (missing ♥K)
      {suit: "♥", value: "2", player_id: @player1.id, column: 0},
      {suit: "♥", value: "5", player_id: @player1.id, column: 0},
      {suit: "♥", value: "7", player_id: @player1.id, column: 0},
      {suit: "♥", value: "9", player_id: @player1.id, column: 0},

      # Nearly full house in column 1 (missing third 4)
      {suit: "♠", value: "4", player_id: @player1.id, column: 1},
      {suit: "♦", value: "4", player_id: @player1.id, column: 1},
      {suit: "♠", value: "7", player_id: @player1.id, column: 1},
      {suit: "♦", value: "7", player_id: @player1.id, column: 1},

      # Nearly quads in column 2 (missing fourth 10)
      {suit: "♦", value: "10", player_id: @player1.id, column: 2},
      {suit: "♣", value: "10", player_id: @player1.id, column: 2},
      {suit: "♠", value: "10", player_id: @player1.id, column: 2},
      {suit: "♦", value: "Q", player_id: @player1.id, column: 2},

      # Nearly straight flush in column 3 (missing ♠3)
      {suit: "♠", value: "4", player_id: @player1.id, column: 3},
      {suit: "♠", value: "5", player_id: @player1.id, column: 3},
      {suit: "♠", value: "6", player_id: @player1.id, column: 3},
      {suit: "♠", value: "7", player_id: @player1.id, column: 3},

      # Player 2's columns (4-6)
      # Nearly pair in column 4 (missing K)
      {suit: "♣", value: "J", player_id: @player2.id, column: 4},
      {suit: "♠", value: "6", player_id: @player2.id, column: 4},
      {suit: "♦", value: "9", player_id: @player2.id, column: 4},
      {suit: "♥", value: "K", player_id: @player2.id, column: 4},

      # Nearly trips in column 5 (missing third 3)
      {suit: "♦", value: "3", player_id: @player2.id, column: 5},
      {suit: "♣", value: "3", player_id: @player2.id, column: 5},
      {suit: "♣", value: "6", player_id: @player2.id, column: 5},
      {suit: "♠", value: "J", player_id: @player2.id, column: 5},

      # Nearly two pair in column 6
      {suit: "♣", value: "2", player_id: @player2.id, column: 6},
      {suit: "♠", value: "3", player_id: @player2.id, column: 6},
      {suit: "♠", value: "5", player_id: @player2.id, column: 6},
      {suit: "♦", value: "5", player_id: @player2.id, column: 6},

      # Nearly quads in column 7 (missing fourth 10)
      {suit: "♣", value: "10", player_id: @player2.id, column: 7},
      {suit: "♠", value: "10", player_id: @player2.id, column: 7},
      {suit: "♥", value: "10", player_id: @player2.id, column: 7},
      {suit: "♦", value: "Q", player_id: @player2.id, column: 7},
    ]
  end

  # Populates the game's deck with all remaining cards that aren't already in use
  # on the board or in players' hands. Each card is represented as a hash with
  # suit and value. The resulting deck is shuffled before being assigned to the game.
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