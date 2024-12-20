import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="poker"
export default class extends Controller {
  static targets = ['cards', 'stackCount', 'board', 'drawButton']

  connect() {
    // Initialize board state
    this.boardState = Array(8).fill().map(() => [])
    this.selectedCardIndex = null
    this.dealCards()
    this.renderBoard()
  }

  createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades']
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    const deck = []

    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value })
      }
    }

    return deck
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]
    }
  }

  updateStackCount() {
    // Only show remaining cards that haven't been dealt
    this.stackCountTarget.textContent = this.deck.length
  }

  drawCard() {
    if (this.deck.length <= 1) return // No more cards in stack
    // if (this.player1Cards.length >= 8) return // Can't hold more than 8 cards
    
    const card = this.deck.pop()
    this.player1Cards.push(card)
    this.updateStackCount()
    this.renderCards()

    // Force removal of hover state by cloning and replacing the button on mobile only
    // if (window.innerWidth < 768) { // 768px is standard md breakpoint
    //   const drawButton = this.drawButtonTarget
    //   const clone = drawButton.cloneNode(true)
    //   // Re-add the Stimulus data attributes and event listeners
    //   clone.setAttribute('data-poker-target', 'drawButton')
    //   clone.setAttribute('data-action', 'poker#drawCard')
    //   drawButton.classList.add('bg-green-800')
    //   // Small delay to ensure active state is visible
    //   setTimeout(() => {
    //     drawButton.parentNode.replaceChild(clone, drawButton)
    //   }, 150)
    // }
  }

  dealCards() {
    this.deck = this.createDeck()
    this.shuffleDeck()
    
    this.player1Cards = []
    this.player2Cards = []
    
    // Deal 6 cards to each player
    for (let i = 0; i < 6; i++) {
      this.player1Cards.push(this.deck.pop())
      this.player2Cards.push(this.deck.pop())
    }
    
    this.updateStackCount()
    this.renderCards()
    // this.dealButtonTarget.textContent = "Deal Again"
  }

  evaluateHand(cards) {
    if (cards.length !== 5) return null;

    // Count occurrences of each value
    const valueCounts = cards.reduce((acc, card) => {
      acc[card.value] = (acc[card.value] || 0) + 1;
      return acc;
    }, {});

    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const isFlush = cards.every(card => card.suit === cards[0].suit);
    const valueMap = {
      'A': 'Ace', 'K': 'King', 'Q': 'Queen', 'J': 'Jack',
      '10': 'Ten', '9': 'Nine', '8': 'Eight', '7': 'Seven',
      '6': 'Six', '5': 'Five', '4': 'Four', '3': 'Three', '2': 'Two'
    };
    
    // Check for straight
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const cardValues = cards.map(card => values.indexOf(card.value)).sort((a, b) => a - b);
    const isStraight = cardValues.every((val, i) => i === 0 || val === cardValues[i - 1] + 1);

    if (isFlush && isStraight) return "Straight Flush";
    if (counts[0] === 4) {
      const quadValue = Object.entries(valueCounts).find(([_, count]) => count === 4)[0];
      const quadCardName = valueMap[quadValue] || quadValue;
      return `Quad ${quadCardName}s`;
    }
    if (counts[0] === 3 && counts[1] === 2) return "Full House";
    if (isFlush) return "Flush";
    if (isStraight) return "Straight";
    if (counts[0] === 3) {
      const tripValue = Object.entries(valueCounts).find(([_, count]) => count === 3)[0];
      const tripCardName = valueMap[tripValue] || tripValue;
      return `Trip ${tripCardName}s`;
    }
    if (counts[0] === 2 && counts[1] === 2) return "Two Pair";
    if (counts[0] === 2) {
      const pairValue = Object.entries(valueCounts).find(([_, count]) => count === 2)[0];
      const pairCardName = valueMap[pairValue] || pairValue;
      return `Pair of ${pairCardName}s`;
    }
    const highCard = cardValues[cardValues.length - 1];
    const highCardValue = valueMap[values[highCard]] || values[highCard];
    return `${highCardValue} High`;
  }

  renderBoard() {
    const suitEmoji = {
      hearts: '♥️',
      diamonds: '♦️',
      clubs: '♣️',
      spades: '♠️'
    }
    const getTextColor = suit => ['hearts', 'diamonds'].includes(suit) ? 'text-red-600' : 'text-black'

    this.boardTarget.innerHTML = `
      <div class="grid grid-cols-4 grid-rows-2 gap-2 md:gap-8 py-4 p-6 md:p-16 w-full justify-center">
        ${this.boardState.map((stack, index) => {
          const handType = stack.length === 5 ? this.evaluateHand(stack) : null;
          return `
          <div class="py-2 hover:bg-green-900 cursor-pointer transition-all duration-200 relative flex gap-1 flex-col items-start justify-center border border-white/30 rounded-lg"
               data-action="click->poker#playCard" 
               data-poker-stack-param="${index}">
               ${handType ? `<div class="mx-auto bg-yellow-400 text-white shadow-md text-xs text-center md:text-sm font-medium px-2.5 py-0.5 rounded-lg">${handType}</div>` : ''}
               ${stack.map(card => `
               <div class="mx-auto w-14 md:w-16 h-12 md:h-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-lg md:text-2xl font-bold ${getTextColor(card.suit)}">
               ${card.value}${suitEmoji[card.suit]}
               </div>
               `).join('')}
               ${Array(5 - stack.length).fill(`
               <div class="mx-auto transition-all duration-200 w-14 md:w-16 h-12 md:h-24 bg-white/10 rounded-lg border border-white/20"></div>
               `).join('')}
          </div>
        `}).join('')}
      </div>
    `
  }

  playCard(event) {
    // Only proceed if a card is selected
    if (this.selectedCardIndex === null) return
    
    const stackIndex = parseInt(event.currentTarget.dataset.pokerStackParam)
    
    // Only allow playing on the first row (player's side)
    if (stackIndex >= 4) return
    
    // Check if the stack has room
    if (this.boardState[stackIndex].length < 5) {
      const card = this.player1Cards[this.selectedCardIndex]
      this.player1Cards.splice(this.selectedCardIndex, 1)
      this.boardState[stackIndex].push(card)
      
      // Reset selection
      this.selectedCardIndex = null
      
      this.renderCards()
      this.renderBoard()
    }
  }

  renderCards() {
    const suitEmoji = {
      hearts: '♥️',
      diamonds: '♦️',
      clubs: '♣️',
      spades: '♠️'
    }
    const getTextColor = suit => ['hearts', 'diamonds'].includes(suit) ? 'text-red-600' : 'text-black'
    
    this.cardsTarget.innerHTML = `
      <div class="text-center flex flex-col gap-12">
        <div>
          <h1 class="hidden mb-10 text-white text-2xl">My Cards</h1>
          <div class="flex -space-x-12 items-center justify-center">
            ${this.player1Cards.map((card, index) => {
              // Get total number of cards in player's hand
              const totalCards = this.player1Cards.length;

              // Calculate rotation angle between -15 and +15 degrees based on card position
              const angle = -25 + (50 / (totalCards - 1)) * index;

              // Normalize angle to value between -1 and 1 for offset calculations
              const normalizedAngle = angle / 25;

              // Calculate vertical offset using quadratic function
              // Cards rise more in the middle of the hand (-20px max)
              const yOffset = -20 * (1 - normalizedAngle * normalizedAngle);

              // Calculate slight horizontal offset to bring cards closer together
              // Multiplier of 0.05 keeps cards from spreading too far
              const xOffset = -angle * 0.25;

              // Track if this card is currently selected
              const isSelected = index === this.selectedCardIndex;
              return `
              <div class="w-20 h-28 bg-white rounded-lg relative ${getTextColor(card.suit)} cursor-pointer transition-transform ${isSelected ? 'shadow-lg ring-4 ring-yellow-400 transform -translate-y-6' : 'shadow-md'}"
                   data-action="click->poker#selectCard"
                   data-poker-card-index-param="${index}"
                   style="z-index: ${index}; transform-origin: bottom center; transform: ${isSelected ? 'translateY(-0.75rem)' : ''} rotate(${angle}deg) translate(${xOffset}px, ${yOffset}px)">
                <div class="absolute top-2 left-2 text-xl">${card.value}${suitEmoji[card.suit]}</div>
              </div>
            `}).join('')}
          </div>
        </div>
        <div class="hidden md:block">
          <h1 class="mb-12 text-white text-2xl">Opponent</h1>
          <div class="flex -space-x-12 items-center justify-center">
            ${this.player2Cards.map((card, index) => {
              // Get the total number of cards in player 2's hand
              const totalCards = this.player2Cards.length;
              // Calculate the rotation angle for each card, spreading them evenly between -15 and +15 degrees
              const angle = -25 + (50 / (totalCards - 1)) * index;
              // Normalize the angle to a value between -1 and 1 for calculating vertical offset
              const normalizedAngle = angle / 25;
              // Calculate vertical offset using quadratic function - cards rise more in the middle
              const yOffset = -20 * (1 - normalizedAngle * normalizedAngle);
              // Calculate horizontal offset to bring cards closer together
              const xOffset = -angle * 0.5; // Increased multiplier to bring cards more inward
              return `
              <div class="w-20 h-28 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg shadow-md relative" style="z-index: ${index}; transform-origin: bottom center; transform: rotate(${angle}deg) translate(${xOffset}px, ${yOffset}px)">
              </div>
            `}).join('')}
          </div>
        </div>
      </div>
    `
  }

  selectCard(event) {
    const cardIndex = parseInt(event.currentTarget.dataset.pokerCardIndexParam)
    
    // Toggle selection
    if (this.selectedCardIndex === cardIndex) {
      this.selectedCardIndex = null
    } else {
      this.selectedCardIndex = cardIndex
    }
    
    this.renderCards()
  }
}
