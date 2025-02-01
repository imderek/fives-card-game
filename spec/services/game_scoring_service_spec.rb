require 'rails_helper'

RSpec.describe GameScoringService do
  let(:game) { create(:game, :pvp) }
  let(:service) { described_class.new(game) }

  describe '#update_column_scores' do
    before do
      game.board_cards = [
        { player_id: game.player1_id, column: 0, suit: '♠', value: 'A' },
        { player_id: game.player1_id, column: 0, suit: '♠', value: 'K' },
        { player_id: game.player2_id, column: 4, suit: '♥', value: '8' },
        { player_id: game.player2_id, column: 4, suit: '♦', value: '8' }
      ]
    end

    it 'updates column scores for both players' do
      service.update_column_scores
      
      expect(game.column_scores['0']).to eq(14)  # Ace high
      expect(game.column_scores['4']).to eq(100) # Pair of 8s
    end
  end

  describe '#complete_game' do
    before do
      # Set up a game that's ready to complete
      game.player1_hand = [
        { suit: '♠', value: 'A' },
        { suit: '♠', value: 'K' }
      ]
      game.player2_hand = [
        { suit: '♥', value: 'Q' },
        { suit: '♥', value: 'J' }
      ]
      
      # Fill the board with some cards to make the game complete
      game.board_cards = [
        { player_id: game.player1_id, column: 0, suit: '♣', value: '2' },
        { player_id: game.player1_id, column: 0, suit: '♣', value: '3' },
        { player_id: game.player1_id, column: 0, suit: '♣', value: '4' },
        { player_id: game.player1_id, column: 0, suit: '♣', value: '5' },
        { player_id: game.player1_id, column: 0, suit: '♣', value: '6' },
        
        { player_id: game.player2_id, column: 4, suit: '♦', value: '7' },
        { player_id: game.player2_id, column: 4, suit: '♦', value: '8' },
        { player_id: game.player2_id, column: 4, suit: '♦', value: '9' },
        { player_id: game.player2_id, column: 4, suit: '♦', value: '10' },
        { player_id: game.player2_id, column: 4, suit: '♦', value: 'J' }
      ]
      game.save!
    end

    it 'includes hand scores in column_scores' do
      service.complete_game

      expect(game.reload.column_scores).to include(
        'player1_hand' => kind_of(Integer),
        'player2_hand' => kind_of(Integer)
      )
    end

    context 'when game is not complete' do
      before do
        # Set up incomplete columns
        game.board_cards = [
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'A' },
          { player_id: game.player2_id, column: 4, suit: '♥', value: '8' }
        ]
      end

      it 'does not complete the game' do
        service.complete_game
        expect(game.completed?).to be false
        expect(game.winner_id).to be_nil
      end
    end

    context 'when game is complete' do
      before do
        # Set up winning scenario for player 1
        game.board_cards = [
          # Player 1's royal flush
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'A' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'K' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'Q' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: 'J' },
          { player_id: game.player1_id, column: 0, suit: '♠', value: '10' },
          
          # Player 2's pair
          { player_id: game.player2_id, column: 4, suit: '♥', value: '8' },
          { player_id: game.player2_id, column: 4, suit: '♦', value: '8' },
          { player_id: game.player2_id, column: 4, suit: '♣', value: '7' },
          { player_id: game.player2_id, column: 4, suit: '♠', value: '6' },
          { player_id: game.player2_id, column: 4, suit: '♦', value: '5' }
        ]
      end

      it 'completes the game and determines winner' do
        service.complete_game
        
        expect(game.completed?).to be true
        expect(game.winner_id).to eq(game.player1_id)
        expect(game.player1_total_score).to be > game.player2_total_score
      end
    end
  end
end 