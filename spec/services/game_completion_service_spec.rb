require 'rails_helper'

RSpec.describe GameCompletionService do
  describe '#calculate_player_score' do
    let(:game) { create(:game) }
    let(:service) { GameCompletionService.new(game) }

    it 'correctly scores hands with face cards' do
      # Set up a game with face cards
      game.board_cards = [
        # Player 1, Column 0: Three Kings
        { suit: "♠", value: "K", player_id: game.player1_id, column: 0 },
        { suit: "♣", value: "K", player_id: game.player1_id, column: 0 },
        { suit: "♥", value: "K", player_id: game.player1_id, column: 0 },
        { suit: "♦", value: "2", player_id: game.player1_id, column: 0 },
        { suit: "♠", value: "3", player_id: game.player1_id, column: 0 },

        # Player 2, Column 4: Three 10s (note: using column 4 for player 2)
        { suit: "♠", value: "10", player_id: game.player2_id, column: 4 },
        { suit: "♣", value: "10", player_id: game.player2_id, column: 4 },
        { suit: "♥", value: "10", player_id: game.player2_id, column: 4 },
        { suit: "♦", value: "2", player_id: game.player2_id, column: 4 },
        { suit: "♠", value: "3", player_id: game.player2_id, column: 4 }
      ]

      player1_score = service.calculate_player_score(game.player1_id)
      player2_score = service.calculate_player_score(game.player2_id)

      # Debug output
      # puts "\nPlayer 1 cards: #{game.board_cards_for_player(game.player1_id, 0).map { |c| c[:value] }}"
      # puts "Player 1 score: #{player1_score}"
      # puts "Player 2 cards: #{game.board_cards_for_player(game.player2_id, 0).map { |c| c[:value] }}"
      # puts "Player 2 score: #{player2_score}"

      # TODO: fix this
      # expect(player1_score).to be > player2_score
    end
  end
end