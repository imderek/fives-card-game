require 'rails_helper'

RSpec.describe Game, type: :model do
  describe '#valid_move?' do
    let(:game) { create(:game, :pvp) }

    before do
      game.update!(
        current_turn: game.player1_id,
        turn_phase: :play_card,
        player1_hand: [{ suit: '♠', value: 'A' }]
      )
    end

    context 'when player 1 is moving' do
      let(:move) { { player_id: game.player1_id, suit: '♠', value: 'A' } }

      it 'allows moves to columns 0-3' do
        (0..3).each do |column|
          expect(game.valid_move?(move.merge(column: column))).to be true
        end
      end

      it 'prevents moves to columns 4-7' do
        (4..7).each do |column|
          expect(game.valid_move?(move.merge(column: column))).to be false
        end
      end
    end

    context 'when column is full' do
      it 'prevents moves to full columns' do
        # Fill column 0 with 5 cards
        game.board_cards = Array.new(5) do
          { player_id: game.player1_id, column: 0, suit: '♥', value: 'K' }
        end

        expect(game.valid_move?(
          player_id: game.player1_id,
          column: 0,
          suit: '♠',
          value: 'A'
        )).to be false
      end
    end

    context 'when card is not in hand' do
      it 'prevents playing cards not in hand' do
        expect(game.valid_move?(
          player_id: game.player1_id,
          column: 0,
          suit: '♥',
          value: '2'
        )).to be false
      end
    end

    context 'when not player\'s turn' do
      it 'prevents moves on opponent\'s turn' do
        game.update!(current_turn: game.player2_id)
        
        expect(game.valid_move?(
          player_id: game.player1_id,
          column: 0,
          suit: '♠',
          value: 'A'
        )).to be false
      end
    end
  end
end 