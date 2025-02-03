// New file to handle poker hand evaluation
const cardValueToInt = (value) => {
  switch (value) {
    case 'A': return 14;
    case 'K': return 13;
    case 'Q': return 12;
    case 'J': return 11;
    default: return parseInt(value);
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

const generatePossibleHands = (cards) => {
  // Find indices of wild cards
  const wildIndices = cards.map((card, index) => 
    card.value.startsWith('W') && card.suit === '★' ? index : -1
  ).filter(i => i !== -1);

  if (wildIndices.length === 0) return [cards];

  // All possible regular card values and suits
  const possibleValues = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const suits = ['♠', '♣', '♥', '♦'];
  const combinations = possibleValues.flatMap(value => 
    suits.map(suit => ({ value, suit }))
  );

  return generateCombinations(cards, wildIndices, combinations);
};

const generateCombinations = (cards, wildIndices, combinations, currentIndex = 0) => {
  if (currentIndex >= wildIndices.length) return [cards.slice()];

  const result = [];
  for (const { value, suit } of combinations) {
    const newCards = cards.slice();
    newCards[wildIndices[currentIndex]] = { value, suit };
    result.push(...generateCombinations(newCards, wildIndices, combinations, currentIndex + 1));
  }
  return result;
};

export const evaluatePokerHand = (cards) => {
  if (!cards.length) return { name: '', score: 0 };

  // Generate all possible hands by replacing wild cards
  const possibleHands = generatePossibleHands(cards);
  
  // Score each possible hand and return the highest score
  const scores = possibleHands.map(hand => {
    const values = hand.map(card => cardValueToInt(card.value));
    const suits = hand.map(card => card.suit);
    
    // For 5-card hands
    if (cards.length === 5) {
      if (isRoyalFlush(values, suits)) return { name: 'Royal Flush', score: 1000 };
      if (isStraightFlush(values, suits)) return { name: 'Straight Flush', score: 800 };
      if (isFourOfAKind(values)) return { name: 'Quads', score: 700 };
      if (isFullHouse(values)) return { name: 'Full House', score: 600 };
      if (isFlush(suits)) return { name: 'Flush', score: 500 };
      if (isStraight(values)) return { name: 'Straight', score: 400 };
      if (isThreeOfAKind(values)) return { name: 'Trips', score: 300 };
      if (isTwoPair(values)) return { name: 'Two Pair', score: 200 };
      if (isOnePair(values)) return { name: 'Pair', score: 100 };
    }

    // For partial hands
    if (isFourOfAKind(values)) return { name: 'Quads', score: 700 };
    if (isThreeOfAKind(values)) return { name: 'Trips', score: 300 };
    if (isTwoPair(values)) return { name: 'Two Pair', score: 200 };
    if (isOnePair(values)) return { name: 'Pair', score: 100 };
    
    return { name: 'High Card', score: Math.max(...values) };
  });

  // Return the highest scoring hand
  return scores.reduce((best, current) => 
    current.score > best.score ? current : best
  );
}; 