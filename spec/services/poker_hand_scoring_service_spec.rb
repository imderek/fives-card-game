require 'rails_helper'

RSpec.describe PokerHandScoringService do
  let(:service) { described_class.new }

  describe '#score_hand' do
    it 'returns 0 for empty hands' do
      expect(service.score_hand([])).to eq(0)
    end

    context 'with 5-card hands' do
      it 'scores royal flush (1000)' do
        cards = [
          { suit: '♠', value: 'A' },
          { suit: '♠', value: 'K' },
          { suit: '♠', value: 'Q' },
          { suit: '♠', value: 'J' },
          { suit: '♠', value: '10' }
        ]
        expect(service.score_hand(cards)).to eq(1000)
      end

      it 'scores straight flush (800)' do
        cards = [
          { suit: '♠', value: '9' },
          { suit: '♠', value: '8' },
          { suit: '♠', value: '7' },
          { suit: '♠', value: '6' },
          { suit: '♠', value: '5' }
        ]
        expect(service.score_hand(cards)).to eq(800)
      end

      it 'scores four of a kind (700)' do
        cards = [
          { suit: '♠', value: '8' },
          { suit: '♣', value: '8' },
          { suit: '♥', value: '8' },
          { suit: '♦', value: '8' },
          { suit: '♠', value: '5' }
        ]
        expect(service.score_hand(cards)).to eq(700)
      end
    end

    context 'with partial hands' do
      it 'scores three of a kind (300)' do
        cards = [
          { suit: '♠', value: '8' },
          { suit: '♣', value: '8' },
          { suit: '♥', value: '8' }
        ]
        expect(service.score_hand(cards)).to eq(300)
      end

      it 'scores pair (100)' do
        cards = [
          { suit: '♠', value: '8' },
          { suit: '♣', value: '8' }
        ]
        expect(service.score_hand(cards)).to eq(100)
      end

      it 'returns high card value for no pairs' do
        cards = [
          { suit: '♠', value: 'K' },
          { suit: '♣', value: '8' }
        ]
        expect(service.score_hand(cards)).to eq(13) # K = 13
      end
    end
  end
end 