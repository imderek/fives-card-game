import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["cardElement"]
  
  connect() {
    // console.log("Card controller connected")
  }

  selectCard(event) {
    // console.log("Card selected", this.element.dataset.card)
    
    // Remove selected class from any previously selected card
    document.querySelectorAll('.selected-card').forEach(el => {
      el.classList.remove('selected-card', 'ring', 'ring-yellow-500', 'top-[-6px]', 'shadow-xl')
    })
    
    // Add selected class to this card
    this.element.classList.add('selected-card', 'ring', 'ring-yellow-500', 'top-[-6px]', 'shadow-xl')
    
    // Store the selected card data globally
    window.selectedCard = JSON.parse(this.element.dataset.card)
  }

  playColumn(event) {
    if (!window.selectedCard) {
      console.log("No card selected")
      return
    }

    // Check if column already has 5 cards
    const cardsInColumn = event.currentTarget.querySelector('.flex').children.length
    if (cardsInColumn >= 5) {
      console.log("Column is full")
      return
    }

    // Flash the selected column with a highlight
    const column = event.currentTarget
    column.classList.add('ring-2', 'ring-amber-500')
    setTimeout(() => {
      // console.log('resetting column')
      column.classList.remove('ring-2', 'ring-amber-500')
    }, 500)

    const columnIndex = event.currentTarget.dataset.columnIndex
    // console.log("Playing card", window.selectedCard, "to column", columnIndex)

    const card = {
      ...window.selectedCard,
      column: columnIndex
    }

    // Submit the move
    fetch(`/games/${window.selectedCard.gameId}/play_card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/vnd.turbo-stream.html',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({ card: card })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.text()
    })
    .then(html => {
      // console.log("Move successful")
      // Clear the selection
      window.selectedCard = null
      document.querySelectorAll('.selected-card').forEach(el => {
        el.classList.remove('selected-card', 'ring-2', 'ring-blue-500')
      })
    })
    .catch(error => {
      console.error('Error playing card:', error)
    })
  }

  discardCard(event) {
    // console.log("Discarding card", this.element.dataset.card)
    if (!window.selectedCard) {
      console.log('No card selected')
      return
    }

    const card = {
      ...window.selectedCard
    }

    // Submit the discard
    fetch(`/games/${window.selectedCard.gameId}/discard_card`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/vnd.turbo-stream.html',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({ card: card })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.text()
    })
    .then(html => {
      // Clear the selection
      window.selectedCard = null
      document.querySelectorAll('.selected-card').forEach(el => {
        el.classList.remove('selected-card', 'ring-2', 'ring-blue-500')
      })
    })
    .catch(error => {
      console.error('Error discarding card:', error)
    })
  }
}
