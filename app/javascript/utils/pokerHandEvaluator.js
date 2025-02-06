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

  // Get non-wild cards
  const nonWildCards = cards.filter(card => !(card.value.startsWith('W') && card.suit === '★'));

  // Helper function to get card value rank
  const getCardRank = (value) => {
    const ranks = {
      'A': 14, 'K': 13, 'Q': 12, 'J': 11,
      '10': 10, '9': 9, '8': 8, '7': 7,
      '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
    };
    return ranks[value] || parseInt(value);
  };

  // If we have enough wild cards to make the best possible hand
  if (wildIndices.length >= 3) {
    // For a 5-card column, determine the best possible hand based on existing cards
    if (cards.length === 5) {
      const bestHand = new Array(5);
      
      // Place non-wild cards in their original positions first
      cards.forEach((card, index) => {
        if (!(card.value.startsWith('W') && card.suit === '★')) {
          bestHand[index] = card;
        }
      });

      // Find the highest value card among non-wild cards
      const highestCard = nonWildCards.reduce((highest, card) => {
        const currentRank = getCardRank(card.value);
        const highestRank = getCardRank(highest?.value || '2');
        return currentRank > highestRank ? card : highest;
      }, null);

      // If we have a high card (J or better), make four of a kind
      if (highestCard && getCardRank(highestCard.value) >= 11) {
        const suits = ['♠', '♣', '♥', '♦'].filter(suit => suit !== highestCard.suit);
        const matchingCards = suits.map(suit => ({ value: highestCard.value, suit }));
        
        // Fill empty positions with matching cards first
        let matchIndex = 0;
        for (let i = 0; i < 5 && matchIndex < matchingCards.length; i++) {
          if (!bestHand[i]) {
            bestHand[i] = matchingCards[matchIndex++];
          }
        }
        
        // Fill any remaining position with the highest remaining card
        for (let i = 0; i < 5; i++) {
          if (!bestHand[i]) {
            bestHand[i] = { value: 'A', suit: '♠' };
          }
        }
      } else {
        // Otherwise, make a Royal Flush using the suit of any existing card
        const targetSuit = nonWildCards[0]?.suit || '♠';
        const royalFlush = [
          { value: '10', suit: targetSuit },
          { value: 'J', suit: targetSuit },
          { value: 'Q', suit: targetSuit },
          { value: 'K', suit: targetSuit },
          { value: 'A', suit: targetSuit }
        ];

        // Skip any values we already have
        const existingValues = new Set(nonWildCards.map(card => card.value));
        const neededCards = royalFlush.filter(card => !existingValues.has(card.value));
        let neededCardIndex = 0;

        // Fill empty positions with needed cards
        for (let i = 0; i < 5; i++) {
          if (!bestHand[i] && neededCardIndex < neededCards.length) {
            bestHand[i] = neededCards[neededCardIndex++];
          }
        }
      }

      return [bestHand];
    }
    
    // For partial columns (less than 5 cards), return four of a kind of the highest card
    const bestHand = new Array(cards.length);
    
    // Place non-wild cards in their original positions
    cards.forEach((card, index) => {
      if (!(card.value.startsWith('W') && card.suit === '★')) {
        bestHand[index] = card;
      }
    });

    // Find highest existing card or default to Ace
    const highestCard = nonWildCards.reduce((highest, card) => {
      const currentRank = getCardRank(card.value);
      const highestRank = getCardRank(highest?.value || '2');
      return currentRank > highestRank ? card : highest;
    }, { value: 'A', suit: '♠' });

    // Fill remaining positions with matching cards of different suits
    const suits = ['♠', '♣', '♥', '♦'].filter(suit => suit !== highestCard.suit);
    let suitIndex = 0;
    
    for (let i = 0; i < cards.length; i++) {
      if (!bestHand[i]) {
        bestHand[i] = { value: highestCard.value, suit: suits[suitIndex++ % suits.length] };
      }
    }
    
    return [bestHand];
  }

  // Rest of the existing code for handling 1-2 wild cards
  const possibleValues = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const suits = ['♠', '♣', '♥', '♦'];
  
  if (wildIndices.length === 2) {
    if (cards.length === 5) {
      return generateOptimizedCombinations(cards, wildIndices, nonWildCards);
    }
    const combinations = possibleValues.map(value => ({ value, suit: suits[0] }));
    return generateCombinations(cards, wildIndices, combinations);
  }

  const combinations = possibleValues.flatMap(value => 
    suits.map(suit => ({ value, suit }))
  );
  return generateCombinations(cards, wildIndices, combinations);
};

// Helper function to generate optimized combinations for straight flushes
const generateOptimizedCombinations = (cards, wildIndices, nonWildCards) => {
  const bestHand = [...cards];
  const suit = nonWildCards[0]?.suit || '♠';
  
  // Check for potential royal flush first
  if (canCompleteRoyalFlush(nonWildCards)) {
    const royalValues = ['10', 'J', 'Q', 'K', 'A'];
    const existingValues = new Set(nonWildCards.map(card => card.value));
    const neededValues = royalValues.filter(v => !existingValues.has(v));
    
    let valueIndex = 0;
    wildIndices.forEach(index => {
      bestHand[index] = { value: neededValues[valueIndex++], suit };
    });
    return [bestHand];
  }

  // Check for straight flush potential
  if (canCompleteStraightFlush(nonWildCards)) {
    const values = nonWildCards.map(card => cardValueToInt(card.value)).sort((a, b) => a - b);
    const neededValues = findStraightValues(values, wildIndices.length);
    
    let valueIndex = 0;
    wildIndices.forEach(index => {
      bestHand[index] = { value: intToCardValue(neededValues[valueIndex++]), suit };
    });
    return [bestHand];
  }

  // Find highest pair to make four of a kind
  const valueCounts = {};
  nonWildCards.forEach(card => {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
  });
  
  const pairValue = Object.entries(valueCounts)
    .filter(([_, count]) => count >= 2)
    .sort(([a], [b]) => cardValueToInt(b) - cardValueToInt(a))[0]?.[0];

  if (pairValue) {
    const suits = ['♠', '♣', '♥', '♦'].filter(s => 
      !nonWildCards.some(card => card.suit === s && card.value === pairValue)
    );
    
    wildIndices.forEach((index, i) => {
      bestHand[index] = { value: pairValue, suit: suits[i] };
    });
    return [bestHand];
  }

  // Default to high cards if no better hand possible
  const highCard = nonWildCards.reduce((best, card) => 
    cardValueToInt(card.value) > cardValueToInt(best?.value || '2') ? card : best
  , { value: 'A', suit: '♠' });

  wildIndices.forEach((index, i) => {
    const suits = ['♠', '♣', '♥', '♦'].filter(s => s !== highCard.suit);
    bestHand[index] = { value: highCard.value, suit: suits[i % suits.length] };
  });
  
  return [bestHand];
};

// Helper functions for optimized combinations
const canCompleteRoyalFlush = (nonWildCards) => {
  if (!nonWildCards.length) return true;
  const suits = new Set(nonWildCards.map(card => card.suit));
  if (suits.size > 1) return false;
  
  const values = new Set(nonWildCards.map(card => card.value));
  const royalValues = new Set(['10', 'J', 'Q', 'K', 'A']);
  return [...values].every(v => royalValues.has(v));
};

const canCompleteStraightFlush = (nonWildCards) => {
  if (!nonWildCards.length) return true;
  const suits = new Set(nonWildCards.map(card => card.suit));
  return suits.size <= 1;
};

const findStraightValues = (values, wildCount) => {
  if (!values.length) return [14, 13, 12, 11, 10].slice(0, wildCount);
  
  // Handle Ace-low straight
  if (values.includes(14) && values.includes(2) && values.includes(3)) {
    return [4, 5].slice(0, wildCount);
  }
  
  // Find gaps in sequence
  const gaps = [];
  for (let i = 0; i < values.length - 1; i++) {
    const diff = values[i + 1] - values[i] - 1;
    if (diff > 0 && diff <= wildCount) {
      for (let j = 1; j <= diff; j++) {
        gaps.push(values[i] + j);
      }
    }
  }
  
  return gaps.slice(0, wildCount);
};

const intToCardValue = (value) => {
  switch (value) {
    case 14: return 'A';
    case 13: return 'K';
    case 12: return 'Q';
    case 11: return 'J';
    default: return value.toString();
  }
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
  const result = scores.reduce((best, current) => 
    current.score > best.score ? current : best
  );

  // Cache and return the result
  evaluationCache.set(cacheKey, result);
  return result;
}; 