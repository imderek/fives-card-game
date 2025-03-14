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

    context 'with wild cards' do
      it 'uses wild card to complete a royal flush' do
        cards = [
          { suit: '♠', value: 'A' },
          { suit: '♠', value: 'K' },
          { suit: '♠', value: 'Q' },
          { suit: '♠', value: 'J' },
          { suit: '★', value: 'W1' }  # Wild card should become 10♠
        ]
        expect(service.score_hand(cards)).to eq(1000)
      end

      it 'uses wild card optimally in multiple possible hands' do
        cards = [
          { suit: '♠', value: '8' },
          { suit: '♣', value: '8' },
          { suit: '♥', value: '8' },
          { suit: '★', value: 'W1' }  # Wild card should become 8♦ for four of a kind
        ]
        expect(service.score_hand(cards)).to eq(700)  # Four of a kind
      end

      it 'handles multiple wild cards' do
        cards = [
          { suit: '♠', value: 'A' },
          { suit: '♠', value: 'K' },
          { suit: '★', value: 'W1' },  # Should become Q♠
          { suit: '★', value: 'W2' },  # Should become J♠
          { suit: '★', value: 'W3' }   # Should become 10♠
        ]
        expect(service.score_hand(cards)).to eq(1000)  # Royal Flush
      end

      it 'uses wild card for straight flush over four of a kind' do
        cards = [
          { suit: '♥', value: '7' },
          { suit: '♥', value: '8' },
          { suit: '♥', value: '9' },
          { suit: '♥', value: '10' },
          { suit: '★', value: 'W1' }  # Should become 6♥ for straight flush
        ]
        expect(service.score_hand(cards)).to eq(800)  # Straight flush
      end

      it 'uses wild card for straight flush over trips' do
        cards = [
          { suit: '♥', value: '2' },
          { suit: '♥', value: '3' },
          { suit: '♥', value: 'A' },
          { suit: '★', value: 'W1' },
          { suit: '★', value: 'W2' }
        ]
        expect(service.score_hand(cards)).to eq(800)  # Straight flush
      end

      it 'uses wild card for quads over full house' do
        cards = [
          { suit: '♣', value: 'K' },
          { suit: '♣', value: 'A' },
          { suit: '★', value: 'W1' },
          { suit: '★', value: 'W2' },
          { suit: '♥', value: 'K' }
        ]
        expect(service.score_hand(cards)).to eq(700)  # Quads
      end

      it 'uses wild card for straight flush over four of a kind' do
        cards = [
          { suit: '♥', value: '7' },
          { suit: '♥', value: '8' },
          { suit: '♥', value: '9' },
          { suit: '♥', value: '10' },
          { suit: '★', value: 'W1' }  # Should become 6♥ for straight flush
        ]
        expect(service.score_hand(cards)).to eq(800)  # Straight flush
      end

      it 'uses wild card for straight flush over flush' do
        cards = [
          { suit: '♥', value: '10' },
          { suit: '♥', value: '7' },
          { suit: '★', value: 'W1' },
          { suit: '★', value: 'W2' },
          { suit: '★', value: 'W3' }
        ]
        expect(service.score_hand(cards)).to eq(800)  # Straight flush
      end

      it 'uses wild card to make a pair over high card' do
        cards = [
          { suit: '♠', value: 'K' },
          { suit: '★', value: 'W1' }  # Should become K♣/♥/♦ for a pair
        ]
        expect(service.score_hand(cards)).to eq(100)  # Pair of Kings
      end

      it 'uses wild card for best possible score in edge cases' do
        cards = [
          { suit: '♠', value: '5' },
          { suit: '♠', value: '6' },
          { suit: '♠', value: '7' },
          { suit: '♠', value: '9' },
          { suit: '★', value: 'W1' }  # Should become 8♠ for straight flush
        ]
        expect(service.score_hand(cards)).to eq(800)  # Straight flush
      end

      it 'handles four wild cards with a low card to make straight flush' do
        cards = [
          { suit: '★', value: 'W1' },
          { suit: '★', value: 'W2' },
          { suit: '★', value: 'W3' },
          { suit: '★', value: 'W4' },
          { suit: '♠', value: '4' }
        ]
        
        result = service.score_hand(cards)
        expect(service.score_hand(cards)).to eq(800)  # Straight flush
      end

      it 'uses wild card to make flush when optimal' do
        cards = [
          { suit: '♦', value: 'K' },
          { suit: '♦', value: '10' },
          { suit: '♦', value: '2' },
          { suit: '♦', value: '5' },
          { suit: '♠', value: '2' },
          { suit: '★', value: 'W2' }  # Wild card should become a diamond to make a flush
        ]
        expect(service.score_hand(cards)).to eq(500)  # Should be a flush
      end

      it 'uses wild card to make full house when optimal with 6 cards' do
        cards = [
          { suit: '♠', value: 'J' },
          { suit: '♥', value: 'J' },
          { suit: '♦', value: '10' },
          { suit: '♣', value: '10' },
          { suit: '♠', value: '6' },
          { suit: '★', value: 'W1' }  # Wild card should become J for full house
        ]
        expect(service.score_hand(cards)).to eq(600)  # Should be a full house (JJJ over 1010)
      end

      it 'uses two wild cards to complete straight flush with J-high' do
        cards = [
          { suit: '♥', value: 'J' },
          { suit: '♥', value: '9' },
          { suit: '★', value: 'W1' },  # Should become 10♥
          { suit: '♥', value: '8' },
          { suit: '★', value: 'W2' }   # Should become 7♥
        ]
        expect(service.score_hand(cards)).to eq(800)  # Straight flush (J,10,9,8,7)
      end
    end

    context 'with more than 5 cards' do
      it 'finds flush when optimal by excluding non-flush card' do
        cards = [
          { suit: '♥', value: '3' },
          { suit: '♥', value: '9' },
          { suit: '♥', value: 'K' },
          { suit: '♥', value: '8' },
          { suit: '♥', value: '6' },
          { suit: '♦', value: '9' }  # This card should be excluded to make the flush
        ]
        expect(service.score_hand(cards)).to eq(500)  # Should be a heart flush
      end

      it 'finds full house when optimal with multiple pairs and three of a kind' do
        cards = [
          { suit: '♠', value: '7' },
          { suit: '♠', value: '5' },
          { suit: '♦', value: '7' },
          { suit: '♦', value: '5' },
          { suit: '♥', value: '5' },
          { suit: '♥', value: 'K' }  # This card should be excluded to make the full house
        ]
        expect(service.score_hand(cards)).to eq(600)  # Should be a full house (5s over 7s)
      end
    end
  end
end 