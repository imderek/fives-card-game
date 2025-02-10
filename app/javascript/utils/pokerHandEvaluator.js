// New file to handle poker hand evaluation
export const cardValueToInt = (value) => {
  switch (value) {
    case 'A': return 14;
    case 'K': return 13;
    case 'Q': return 12;
    case 'J': return 11;
    case '10': return 10;
    default: return parseInt(value, 10);
  }
};

// Helper functions for hand evaluation
const isRoyalFlush = (values, suits) => {
  return isStraightFlush(values, suits) && Math.max(...values) === 14;
};

const isStraightFlush = (values, suits) => {
  return isStraight(values) && isFlush(suits);
};

const isFourOfAKind = (values) => {
  const counts = getCounts(values);
  return Object.values(counts).some(count => count >= 4);
};

const isFullHouse = (values) => {
  const counts = getCounts(values);
  const hasThree = Object.values(counts).some(count => count === 3);
  const hasPair = Object.values(counts).some(count => count === 2);
  return hasThree && hasPair;
};

const isFlush = (suits) => {
  return suits.length === 5 && new Set(suits).size === 1;
};

const isStraight = (values) => {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  // Check for Ace-low straight (A,2,3,4,5)
  if (sorted.join(',') === '2,3,4,5,14') return true;
  
  // Check for regular straight
  return sorted.length === 5 && sorted[4] - sorted[0] === 4;
};

const isThreeOfAKind = (values) => {
  const counts = getCounts(values);
  return Object.values(counts).some(count => count === 3);
};

const isTwoPair = (values) => {
  const counts = getCounts(values);
  return Object.values(counts).filter(count => count === 2).length >= 2;
};

const isOnePair = (values) => {
  const counts = getCounts(values);
  return Object.values(counts).some(count => count === 2);
};

// Helper function to count occurrences of each value
const getCounts = (values) => {
  return values.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
};

const canCompleteStraightFlush = (cards) => {
  if (!cards || cards.length === 0) return true;
  
  // All cards must be of the same suit
  const suits = new Set(cards.map(card => card.suit));
  if (suits.size > 1) return false;
  
  const values = cards.map(card => cardValueToInt(card.value)).sort((a, b) => a - b);
  
  // Check if we can complete a straight
  // For each card, see if we can build a straight around it
  for (let i = 0; i < values.length; i++) {
    const centerValue = values[i];
    // Check possible straights: card in each position 1-5
    for (let position = 0; position < 5; position++) {
      const minValue = centerValue - position;
      const maxValue = minValue + 4;
      
      // Count how many of our existing values would fit in this straight
      const fittingValues = values.filter(v => v >= minValue && v <= maxValue);
      const neededWildCards = 5 - fittingValues.length;
      
      // If we need 2 or fewer wild cards, this is possible
      if (neededWildCards <= 2) return true;
    }
  }
  
  // Special case: Ace-low straight (A,2,3,4,5)
  if (values.includes(14)) { // If we have an Ace
    const lowValues = values.filter(v => v <= 5);
    const neededWildCards = 5 - lowValues.length - 1; // -1 for the Ace we have
    if (neededWildCards <= 2) return true;
  }
  
  return false;
};

export const generatePossibleHands = (cards) => {
  // Find indices of wild cards
  const wildIndices = cards.map((card, index) => 
    card.value.startsWith('W') && card.suit === '★' ? index : -1
  ).filter(i => i !== -1);

  if (wildIndices.length === 0) return [cards];
  if (wildIndices.length > 3) {
    // With 4+ wild cards, we can make the best possible hand with the remaining cards
    const nonWildCards = cards.filter(card => !(card.value.startsWith('W') && card.suit === '★'));
    const suit = nonWildCards.length > 0 ? nonWildCards[0].suit : '♠';
    
    if (nonWildCards.length === 0) {
      // If all cards are wild, make a royal flush
      return [[
        { suit: suit, value: 'A' },
        { suit: suit, value: 'K' },
        { suit: suit, value: 'Q' },
        { suit: suit, value: 'J' },
        { suit: suit, value: '10' }
      ]];
    }

    // Check if we can make a royal flush with the non-wild card
    const nonWildValue = cardValueToInt(nonWildCards[0].value);
    if (nonWildValue >= 10 || nonWildValue === 14) { // 10, J, Q, K, or A
      // We can make a royal flush
      const royalFlushCards = ['A', 'K', 'Q', 'J', '10']
        .filter(value => cardValueToInt(value) !== nonWildValue)
        .map(value => ({ suit: suit, value }));
      return [[...nonWildCards, ...royalFlushCards]];
    } else {
      // Make the highest possible straight flush using the non-wild card
      const straightValues = [
        nonWildValue + 4,
        nonWildValue + 3,
        nonWildValue + 2,
        nonWildValue + 1,
        nonWildValue
      ].map(val => intToCardValue(val))
       .filter(val => val !== nonWildCards[0].value)
       .map(value => ({ suit: suit, value }));
      return [[...nonWildCards, ...straightValues]];
    }
  }

  // Get non-wild cards
  const nonWildCards = cards.filter(card => !(card.value.startsWith('W') && card.suit === '★'));

  // Generate all possible combinations
  const possibleValues = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
  const suits = ['♠', '♣', '♥', '♦'];
  
  // If we have a suit from non-wild cards, prioritize that suit
  const existingSuits = new Set(nonWildCards.map(card => card.suit));
  const primarySuit = existingSuits.size === 1 ? nonWildCards[0].suit : null;
  const suitOrder = primarySuit ? [primarySuit] : suits;

  // Check if we have potential for a wheel straight (A,2,3,4,5)
  const values = nonWildCards.map(card => cardValueToInt(card.value));
  const hasAce = values.includes(14);
  const hasLowCards = values.some(v => v <= 5);
  const isWheelPotential = hasAce && hasLowCards && values.every(v => v === 14 || v <= 5);

  // If we have a potential wheel straight and all cards are the same suit,
  // only generate the missing low cards in that suit
  let valueOrder = possibleValues;
  if (isWheelPotential && primarySuit) {
    const missingLowValues = [2, 3, 4, 5]
      .filter(v => !values.includes(v))
      .map(v => v.toString());
    valueOrder = missingLowValues;
  }

  const combinations = valueOrder.flatMap(value => 
    suitOrder.map(suit => ({ value, suit }))
  );

  // Use iteration instead of recursion
  const results = [];
  const stack = [{ currentHand: [...cards], remainingIndices: wildIndices, combinationIndex: 0 }];

  while (stack.length > 0) {
    const { currentHand, remainingIndices, combinationIndex } = stack.pop();

    if (remainingIndices.length === 0) {
      results.push(currentHand);
      continue;
    }

    const wildIndex = remainingIndices[0];
    const nextIndices = remainingIndices.slice(1);

    for (let i = combinationIndex; i < combinations.length; i++) {
      const newHand = [...currentHand];
      newHand[wildIndex] = combinations[i];
      stack.push({ 
        currentHand: newHand, 
        remainingIndices: nextIndices, 
        combinationIndex: 0 
      });
    }
  }

  return results;
};

const intToCardValue = (value) => {
  if (value == null) return '';
  
  const strValue = value.toString();
  
  if (strValue.startsWith('W')) return strValue;
  
  switch (strValue) {
    case '14': return 'A';
    case '13': return 'K';
    case '12': return 'Q';
    case '11': return 'J';
    default: return strValue;
  }
};

const evaluationCache = new Map();

export const evaluatePokerHand = (cards) => {
  if (!cards.length) return { name: '', score: 0 };

  // Create a cache key from the cards
  const cacheKey = cards.map(c => `${c.value}${c.suit}`).join('|');
  if (evaluationCache.has(cacheKey)) {
    return evaluationCache.get(cacheKey);
  }

  // Generate all possible hands by replacing wild cards
  const possibleHands = generatePossibleHands(cards);
  
  // Score each possible hand
  const scores = possibleHands.map(hand => {
    const values = hand.map(card => cardValueToInt(card.value));
    const suits = hand.map(card => card.suit);
    
    // For 5-card hands
    if (hand.length === 5) {
      // Check for wheel straight flush first (A,2,3,4,5)
      const sortedValues = [...values].sort((a, b) => a - b);
      if (isFlush(suits) && 
          sortedValues.join(',') === '2,3,4,5,14') {
        return { name: 'Straight Flush', score: 800 };
      }
      
      if (isRoyalFlush(values, suits)) return { name: 'Royal Flush', score: 1000 };
      if (isStraightFlush(values, suits)) return { name: 'Straight Flush', score: 800 };
      if (isFourOfAKind(values)) return { name: 'Quads', score: 700 };
      if (isFullHouse(values)) return { name: 'Full House', score: 600 };
      if (isFlush(suits)) return { name: 'Flush', score: 500 };
      if (isStraight(values)) return { name: 'Straight', score: 400 };
      if (isThreeOfAKind(values)) return { name: 'Trips', score: 300 };
      if (isTwoPair(values)) return { name: 'Two Pair', score: 200 };
      if (isOnePair(values)) return { name: 'Pair', score: 100 };
      return { name: 'High Card', score: Math.max(...values) };
    }

    // For partial hands
    if (isFourOfAKind(values)) return { name: 'Quads', score: 700 };
    if (isThreeOfAKind(values)) return { name: 'Trips', score: 300 };
    if (isTwoPair(values)) return { name: 'Two Pair', score: 200 };
    if (isOnePair(values)) return { name: 'Pair', score: 100 };
    return { name: 'High Card', score: Math.max(...values) };
  });

  // Return the highest scoring hand
  const result = scores.reduce((best, current) => 
    current.score > best.score ? current : best
  , { name: 'High Card', score: 0 });  // Added default value for reduce

  // Cache and return the result
  evaluationCache.set(cacheKey, result);
  return result;
}; 