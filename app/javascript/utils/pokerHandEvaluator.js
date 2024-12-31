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

export const evaluatePokerHand = (cards) => {
  if (!cards.length) return { name: '', score: 0 };
  
  const values = cards.map(card => cardValueToInt(card.value));
  const suits = cards.map(card => card.suit);
  
  // For 5-card hands
  if (cards.length === 5) {
    if (isRoyalFlush(values, suits)) return { name: 'Royal Flush', score: 1000 };
    if (isStraightFlush(values, suits)) return { name: 'Straight Flush', score: 800 };
    if (isFourOfAKind(values)) return { name: 'Four of a Kind', score: 700 };
    if (isFullHouse(values)) return { name: 'Full House', score: 600 };
    if (isFlush(suits)) return { name: 'Flush', score: 500 };
    if (isStraight(values)) return { name: 'Straight', score: 400 };
    if (isThreeOfAKind(values)) return { name: 'Three of a Kind', score: 300 };
    if (isTwoPair(values)) return { name: 'Two Pair', score: 200 };
    if (isOnePair(values)) return { name: 'Pair', score: 100 };
  }

  // For partial hands
  if (isFourOfAKind(values)) return { name: 'Four of a Kind', score: 700 };
  if (isThreeOfAKind(values)) return { name: 'Three of a Kind', score: 300 };
  if (isTwoPair(values)) return { name: 'Two Pair', score: 200 };
  if (isOnePair(values)) return { name: 'Pair', score: 100 };
  
  return { name: 'High Card', score: Math.max(...values) };
}; 