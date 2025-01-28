require 'rails_helper'

RSpec.describe BotStrategies::HardBot do
  let(:player1) { create(:user) }
  let(:player2) { create(:user, email: 'hard bot') }
  let(:game) { create(:game, player1: player1, player2: player2, game_type: :bot) }
  let(:bot) { described_class.new(game) }

  describe '#make_move' do
    context 'when looking for quads' do
      it 'completes quads when possible' do
        # Set up a scenario where the bot has three of a kind on board
        # and the matching card in hand
        game.board_cards = [
          { suit: '♠', value: '7', player_id: game.player2_id, column: 4 },
          { suit: '♣', value: '7', player_id: game.player2_id, column: 4 },
          { suit: '♥', value: '7', player_id: game.player2_id, column: 4 }
        ]
        game.player2_hand = [
          { suit: '♦', value: '7' },
          { suit: '♠', value: '2' }
        ]

        move = bot.make_move
        expect(move).to eq({
          suit: '♦',
          value: '7',
          player_id: game.player2_id,
          column: 4
        })
      end
    end

    context 'when looking for full house' do
      it 'builds towards a full house when having trips and a pair' do
        game.board_cards = [
          { suit: '♠', value: '7', player_id: game.player2_id, column: 4 },
          { suit: '♣', value: '7', player_id: game.player2_id, column: 4 }
        ]
        game.player2_hand = [
          { suit: '♥', value: '7' },
          { suit: '♠', value: '2' },
          { suit: '♣', value: '2' }
        ]

        move = bot.make_move
        expect(move[:value]).to eq('7')
        expect(move[:column]).to eq(4)
      end
    end

    context 'when having multiple pairs in hand' do
      it 'plays the higher value pair in an empty column' do
        game.board_cards = []
        game.player2_hand = [
          { suit: '♠', value: 'K' },
          { suit: '♣', value: 'K' },
          { suit: '♥', value: '7' },
          { suit: '♦', value: '7' }
        ]

        move = bot.make_move
        expect(move[:value]).to eq('K')
        expect(move[:column]).to be_between(4, 7)
      end
    end

    context 'when board is empty' do
      it 'starts with the highest value pair if available' do
        game.board_cards = []
        game.player2_hand = [
          { suit: '♠', value: 'A' },
          { suit: '♣', value: 'A' },
          { suit: '♥', value: '7' },
          { suit: '♦', value: '2' }
        ]

        move = bot.make_move
        expect(move[:value]).to eq('A')
        expect(move[:column]).to eq(4) # Should prefer leftmost column when starting
      end
    end

    context 'when no good combinations available' do
      it 'plays in an empty column if available' do
        game.board_cards = []
        game.player2_hand = [
          { suit: '♠', value: 'K' },
          { suit: '♣', value: '7' },
          { suit: '♥', value: '4' },
          { suit: '♦', value: '2' }
        ]

        move = bot.make_move
        expect(move[:value]).to be_in(['K', '7', '4', '2'])  # Could be any card in hand
        expect(move[:column]).to eq(4)  # But should still prefer leftmost column
      end
    end
  end
end 