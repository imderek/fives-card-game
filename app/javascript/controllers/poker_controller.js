import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="poker"
export default class extends Controller {
  static targets = ['cards', 'stackCount', 'board']

  connect() {
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
    this.boardTarget.innerHTML = `
      <div class="grid grid-cols-4 grid-rows-2 gap-8 p-16 h-full w-full">
        <div class="flex gap-2 flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-lg p-4">
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
        </div>
        <div class="flex gap-2 flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-lg p-4">
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
        </div>
        <div class="flex gap-2 flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-lg p-4">
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
        </div>
        <div class="flex gap-2 flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-lg p-4">
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
        </div>
        <div class="flex gap-2 flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-lg p-4">
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
        </div>
        <div class="flex gap-2 flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-lg p-4">
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
        </div>
        <div class="flex gap-2 flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-lg p-4">
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
        </div>
        <div class="flex gap-2 flex-col items-center justify-center border-2 border-dashed border-white/30 rounded-lg p-4">
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
          <div class="w-16 h-24 bg-white/10 rounded-lg border border-white/20"></div>
        </div>
      </div>
    `
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
          <h1 class="mb-7 text-white text-2xl">My Cards</h1>
          <div class="flex gap-4">
            ${this.player1Cards.map(card => `
              <div class="w-24 h-32 bg-white rounded-lg shadow-md relative ${getTextColor(card.suit)}">
                <div class="absolute top-2 left-2 text-2xl">${card.value}${suitEmoji[card.suit]}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div>
          <h1 class="mb-7 text-white text-2xl">Opponent</h1>
          <div class="flex gap-4">
            ${this.player2Cards.map(() => `
              <div class="w-24 h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg shadow-md flex items-center justify-center text-3xl text-white"></div>
            `).join('')}
          </div>
        </div>
      </div>
    `
  }
}
