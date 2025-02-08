import { evaluatePokerHand } from '../pokerHandEvaluator';

describe('evaluatePokerHand', () => {
  it('returns empty hand for empty input', () => {
    expect(evaluatePokerHand([])).toEqual({ name: '', score: 0 });
  });

  describe('5-card hands', () => {
    it('scores royal flush (1000)', () => {
      const cards = [
        { suit: '♠', value: 'A' },
        { suit: '♠', value: 'K' },
        { suit: '♠', value: 'Q' },
        { suit: '♠', value: 'J' },
        { suit: '♠', value: '10' }
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'Royal Flush', score: 1000 });
    });

    it('scores straight flush (800)', () => {
      const cards = [
        { suit: '♠', value: '9' },
        { suit: '♠', value: '8' },
        { suit: '♠', value: '7' },
        { suit: '♠', value: '6' },
        { suit: '♠', value: '5' }
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'Straight Flush', score: 800 });
    });

    it('scores four of a kind (700)', () => {
      const cards = [
        { suit: '♠', value: '8' },
        { suit: '♣', value: '8' },
        { suit: '♥', value: '8' },
        { suit: '♦', value: '8' },
        { suit: '♠', value: '5' }
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'Quads', score: 700 });
    });
  });

  describe('partial hands', () => {
    it('scores three of a kind (300)', () => {
      const cards = [
        { suit: '♠', value: '8' },
        { suit: '♣', value: '8' },
        { suit: '♥', value: '8' }
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'Trips', score: 300 });
    });

    it('scores pair (100)', () => {
      const cards = [
        { suit: '♠', value: '8' },
        { suit: '♣', value: '8' }
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'Pair', score: 100 });
    });

    it('returns high card value for no pairs', () => {
      const cards = [
        { suit: '♠', value: 'K' },
        { suit: '♣', value: '8' }
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'High Card', score: 13 }); // K = 13
    });
  });

  describe('with wild cards', () => {
    it('uses wild card to complete a royal flush', () => {
      const cards = [
        { suit: '♠', value: 'A' },
        { suit: '♠', value: 'K' },
        { suit: '♠', value: 'Q' },
        { suit: '♠', value: 'J' },
        { suit: '★', value: 'W1' }  // Wild card should become 10♠
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'Royal Flush', score: 1000 });
    });

    it('uses wild card optimally in multiple possible hands', () => {
      const cards = [
        { suit: '♠', value: '8' },
        { suit: '♣', value: '8' },
        { suit: '♥', value: '8' },
        { suit: '★', value: 'W1' }  // Wild card should become 8♦ for four of a kind
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'Quads', score: 700 });
    });

    it('handles multiple wild cards', () => {
      const cards = [
        { suit: '♠', value: 'A' },
        { suit: '♠', value: 'K' },
        { suit: '★', value: 'W1' },  // Should become Q♠
        { suit: '★', value: 'W2' },  // Should become J♠
        { suit: '★', value: 'W3' }   // Should become 10♠
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'Royal Flush', score: 1000 });
    });

    it('uses wild card for straight flush over four of a kind', () => {
      const cards = [
        { suit: '♥', value: '7' },
        { suit: '♥', value: '8' },
        { suit: '♥', value: '9' },
        { suit: '♥', value: '10' },
        { suit: '★', value: 'W1' }  // Should become 6♥ for straight flush
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'Straight Flush', score: 800 });
    });

    it('uses wild card for straight flush over trips', () => {
      const cards = [
        { suit: '♥', value: '2' },
        { suit: '♥', value: '3' },
        { suit: '♥', value: 'A' },
        { suit: '★', value: 'W1' },
        { suit: '★', value: 'W2' }
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'Straight Flush', score: 800 });
    });

    it('uses wild card to make a pair over high card', () => {
      const cards = [
        { suit: '♠', value: 'K' },
        { suit: '★', value: 'W1' }  // Should become K♣/♥/♦ for a pair
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'Pair', score: 100 });
    });
  });
}); 