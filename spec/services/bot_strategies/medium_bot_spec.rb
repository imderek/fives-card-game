require 'rails_helper'

RSpec.describe BotStrategies::MediumBot do
  let(:player1) { create(:user) }
  let(:player2) { create(:user, email: 'medium bot') }
  let(:game) { create(:game, player1: player1, player2: player2, game_type: :bot) }
  let(:bot) { described_class.new(game) }

  describe '#make_move' do
    context 'when evaluating column scores' do
      it 'considers making pairs while balancing column usage' do
        game.board_cards = [
          { suit: '♠', value: '7', player_id: game.player2_id, column: 4 }
        ]
        game.player2_hand = [
          { suit: '♣', value: '7' },
          { suit: '♥', value: 'K' }
        ]

        move = bot.make_move
        expect(move[:value]).to eq('7')  # Should still prefer matching value
        expect(move[:column]).to be_between(4, 7)  # But could be any valid column
      end

      it 'avoids playing in full columns' do
        game.board_cards = [
          { suit: '♠', value: '2', player_id: game.player2_id, column: 4 },
          { suit: '♣', value: '3', player_id: game.player2_id, column: 4 },
          { suit: '♥', value: '4', player_id: game.player2_id, column: 4 },
          { suit: '♦', value: '5', player_id: game.player2_id, column: 4 },
          { suit: '♠', value: '6', player_id: game.player2_id, column: 4 }
        ]
        game.player2_hand = [
          { suit: '♣', value: '7' }
        ]

        move = bot.make_move
        expect(move[:column]).not_to eq(4)
      end
    end

    context 'when starting the game' do
      it 'encourages using multiple columns early' do
        game.board_cards = [
          { suit: '♠', value: '7', player_id: game.player2_id, column: 4 }
        ]
        game.player2_hand = [
          { suit: '♣', value: '8' },
          { suit: '♥', value: '9' }
        ]

        move = bot.make_move
        # Should prefer a new column over stacking in column 4
        expect(move[:column]).not_to eq(4)
      end
    end

    context 'when matching suits' do
      it 'considers suit matches in overall scoring' do
        game.board_cards = [
          { suit: '♠', value: '7', player_id: game.player2_id, column: 4 }
        ]
        game.player2_hand = [
          { suit: '♠', value: '9' },  # Same suit
          { suit: '♥', value: '8' }   # Different suit
        ]

        move = bot.make_move
        expect(move[:suit]).to eq('♠')  # Should prefer matching suit
        expect(move[:column]).to be_between(4, 7)  # But could be any valid column
      end
    end

    context 'when columns are getting tall' do
      it 'prefers shorter columns' do
        game.board_cards = [
          { suit: '♠', value: '2', player_id: game.player2_id, column: 4 },
          { suit: '♣', value: '3', player_id: game.player2_id, column: 4 },
          { suit: '♥', value: '4', player_id: game.player2_id, column: 4 },
          { suit: '♦', value: '5', player_id: game.player2_id, column: 4 }
        ]
        game.player2_hand = [
          { suit: '♠', value: '7' }
        ]

        move = bot.make_move
        # Should prefer an empty or shorter column
        expect(move[:column]).not_to eq(4)
      end
    end

    context 'when no obvious matches exist' do
      it 'prefers leftmost columns for organization' do
        game.board_cards = []
        game.player2_hand = [
          { suit: '♠', value: '7' }
        ]

        move = bot.make_move
        expect(move[:column]).to eq(4) # Should prefer leftmost available column
      end
    end

    context 'when evaluating value matches' do
      it 'prioritizes three of a kind over pairs' do
        game.board_cards = [
          { suit: '♠', value: '7', player_id: game.player2_id, column: 4 },
          { suit: '♣', value: '7', player_id: game.player2_id, column: 4 }
        ]
        game.player2_hand = [
          { suit: '♥', value: '7' },  # Would make three of a kind
          { suit: '♦', value: '8' }   # Would start new pair
        ]

        move = bot.make_move
        expect(move[:value]).to eq('7')
        expect(move[:column]).to eq(4)
      end
    end
  end

  describe '#evaluate_column' do
    it 'returns negative score for invalid moves' do
      score = bot.send(:evaluate_column, nil)
      expect(score).to be < 0
    end

    it 'gives bonus for expanding to new columns early' do
      game.board_cards = [
        { suit: '♠', value: '7', player_id: game.player2_id, column: 4 }
      ]
      
      # Evaluate playing in a new column
      test_column = [{ suit: '♣', value: '8', column: 5 }]
      new_column_score = bot.send(:evaluate_column, test_column)
      
      # Evaluate playing in existing column
      test_column = [
        { suit: '♠', value: '7', column: 4 },
        { suit: '♣', value: '8', column: 4 }
      ]
      existing_column_score = bot.send(:evaluate_column, test_column)

      expect(new_column_score).to be > existing_column_score
    end
  end
end 