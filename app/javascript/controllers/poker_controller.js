import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="poker"
export default class extends Controller {
  static targets = ['cards', 'stackCount', 'board']

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
    
    const card = this.deck.pop()
    this.player1Cards.push(card)
    this.updateStackCount()
    this.renderCards()
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

  renderBoard() {
    const suitEmoji = {
      hearts: '♥️',
      diamonds: '♦️',
      clubs: '♣️',
      spades: '♠️'
    }
    const getTextColor = suit => ['hearts', 'diamonds'].includes(suit) ? 'text-red-600' : 'text-black'

    this.boardTarget.innerHTML = `
      <div class="grid grid-cols-4 grid-rows-2 gap-8 p-16 h-full w-full">
        ${this.boardState.map((stack, index) => `
          <div class="flex gap-2 flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-lg p-4" 
               data-action="click->poker#playCard" 
               data-poker-stack-param="${index}">
            ${stack.map(card => `
              <div class="w-16 h-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-2xl font-bold ${getTextColor(card.suit)}">
                ${card.value}${suitEmoji[card.suit]}
              </div>
            `).join('')}
            ${Array(5 - stack.length).fill(`
              <div class="hover:bg-green-600 cursor-pointer transition-all duration-200 w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
            `).join('')}
          </div>
        `).join('')}
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
          <h1 class="mb-12 text-white text-2xl">My Cards</h1>
          <div class="flex -space-x-12 items-center justify-center">
            ${this.player1Cards.map((card, index) => {
              const totalCards = this.player1Cards.length;
              const angle = -15 + (30 / (totalCards - 1)) * index;
              const normalizedAngle = angle / 15;
              const yOffset = -20 * (1 - normalizedAngle * normalizedAngle);
              const xOffset = -angle * 0.5;
              const isSelected = index === this.selectedCardIndex;
              return `
              <div class="w-24 h-32 bg-white rounded-lg shadow-md relative ${getTextColor(card.suit)} cursor-pointer transition-transform ${isSelected ? 'ring-4 ring-yellow-400 transform -translate-y-6' : ''}" 
                   data-action="click->poker#selectCard"
                   data-poker-card-index-param="${index}"
                   style="z-index: ${index}; transform-origin: bottom center; transform: ${isSelected ? 'translateY(-1.5rem)' : ''} rotate(${angle}deg) translate(${xOffset}px, ${yOffset}px)">
                <div class="absolute top-2 left-2 text-2xl">${card.value}${suitEmoji[card.suit]}</div>
              </div>
            `}).join('')}
          </div>
        </div>
        <div>
          <h1 class="mb-12 text-white text-2xl">Opponent</h1>
          <div class="flex -space-x-12 items-center justify-center">
            ${this.player2Cards.map((card, index) => {
              // Get the total number of cards in player 2's hand
              const totalCards = this.player2Cards.length;
              // Calculate the rotation angle for each card, spreading them evenly between -15 and +15 degrees
              const angle = -15 + (30 / (totalCards - 1)) * index;
              // Normalize the angle to a value between -1 and 1 for calculating vertical offset
              const normalizedAngle = angle / 15;
              // Calculate vertical offset using quadratic function - cards rise more in the middle
              const yOffset = -20 * (1 - normalizedAngle * normalizedAngle);
              // Calculate horizontal offset to bring cards closer together
              const xOffset = -angle * 0.5; // Increased multiplier to bring cards more inward
              return `
              <div class="w-24 h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg shadow-md relative" style="z-index: ${index}; transform-origin: bottom center; transform: rotate(${angle}deg) translate(${xOffset}px, ${yOffset}px)">
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
