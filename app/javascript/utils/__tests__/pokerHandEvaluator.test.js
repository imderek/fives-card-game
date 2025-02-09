import { evaluatePokerHand, generatePossibleHands, cardValueToInt } from '../pokerHandEvaluator';

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

    it('uses wild cards to complete A-5 straight flush in hearts', () => {
      const cards = [
        { suit: '♥', value: 'A' },
        { suit: '♥', value: '4' },
        { suit: '★', value: 'W1' },  // Should become 5♥
        { suit: '♥', value: '3' },
        { suit: '★', value: 'W2' }   // Should become 2♥
      ];
      expect(evaluatePokerHand(cards)).toEqual({ name: 'Straight Flush', score: 800 });
    });

    it('handles four wild cards efficiently', () => {
      const cards = [
        { suit: '★', value: 'W1' },
        { suit: '★', value: 'W2' },
        { suit: '★', value: 'W3' },
        { suit: '★', value: 'W4' },
        { suit: '♠', value: '8' }  // With an 8, we can only make a straight flush
      ];
      
      // This should complete quickly and not stack overflow
      const result = evaluatePokerHand(cards);
      
      // With 4 wild cards and an 8, we should make a straight flush
      expect(result).toEqual({ name: 'Straight Flush', score: 800 });
    });

    it('handles four wild cards in a column with other cards', () => {
      const cards = [
        { suit: '★', value: 'W1', column: 0 },
        { suit: '★', value: 'W2', column: 0 },
        { suit: '★', value: 'W3', column: 0 },
        { suit: '★', value: 'W4', column: 0 },
        { suit: '♣', value: '8', column: 1 },
        { suit: '♠', value: '8', column: 1 }
      ];
      
      // This should complete quickly and not stack overflow
      const result = evaluatePokerHand(cards.filter(card => card.column === 0));
      
      // With 4 wild cards, we should always be able to make a royal flush
      expect(result).toEqual({ name: 'Royal Flush', score: 1000 });
    });

    it('handles four wild cards with high card to make royal flush', () => {
      const cards = [
        { suit: '★', value: 'W1' },
        { suit: '★', value: 'W2' },
        { suit: '★', value: 'W3' },
        { suit: '★', value: 'W4' },
        { suit: '♠', value: 'K' }  // High card allows royal flush
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result).toEqual({ name: 'Royal Flush', score: 1000 });
    });

    it('handles four wild cards with low card to make straight flush', () => {
      const cards = [
        { suit: '★', value: 'W1' },
        { suit: '★', value: 'W2' },
        { suit: '★', value: 'W3' },
        { suit: '★', value: 'W4' },
        { suit: '♠', value: '5' }  // Low card means best is straight flush
      ];
      
      const result = evaluatePokerHand(cards);
      expect(result).toEqual({ name: 'Straight Flush', score: 800 });
    });

    it('handles four wild cards in a column with low card', () => {
      const cards = [
        { suit: '★', value: 'W1', column: 0 },
        { suit: '★', value: 'W2', column: 0 },
        { suit: '★', value: 'W3', column: 0 },
        { suit: '★', value: 'W4', column: 0 },
        { suit: '♠', value: '3', column: 0 }
      ];
      
      const result = evaluatePokerHand(cards.filter(card => card.column === 0));
      expect(result).toEqual({ name: 'Straight Flush', score: 800 });
    });
  });
});

describe('generatePossibleHands', () => {
  it('generates correct combinations for wheel straight flush', () => {
    const cards = [
      { suit: '♥', value: '2' },
      { suit: '♥', value: '3' },
      { suit: '♥', value: 'A' },
      { suit: '★', value: 'W1' },
      { suit: '★', value: 'W2' }
    ];
    
    const hands = generatePossibleHands(cards);
    
    // Log first few combinations to understand what's being generated
    // console.log('First 5 combinations:', JSON.stringify(hands.slice(0, 5), null, 2));
    
    // Check if any combinations form a wheel straight flush
    const wheelStraightFlush = hands.find(hand => {
      const values = hand.map(card => cardValueToInt(card.value)).sort((a, b) => a - b);
      const suits = hand.map(card => card.suit);
      // Log the values we're checking
      // console.log('Checking hand:', values, suits);
      return values.join(',') === '2,3,4,5,14' && suits.every(s => s === '♥');
    });
    
    expect(wheelStraightFlush).toBeTruthy();
    
    if (wheelStraightFlush) {
      // console.log('Found wheel straight flush:', JSON.stringify(wheelStraightFlush, null, 2));
    }
  });
}); 