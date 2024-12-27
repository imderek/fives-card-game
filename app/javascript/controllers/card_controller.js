import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["cardElement"]
  
  connect() {
    // console.log("Card controller connected")
  }

  selectCard(event) {
    // If this card is already selected, deselect it and return
    if (this.element.classList.contains('selected-card')) {
      this.deselect()
      return
    }

    // Remove selected class from any previously selected card
    document.querySelectorAll('.selected-card').forEach(el => {
      el.classList.remove('selected-card', 'ring', 'ring-yellow-500', 'top-[-5px]', 'shadow-xl')
    })
    
    // Add selected class to this card
    this.element.classList.add('selected-card', 'ring', 'ring-yellow-500', 'top-[-5px]', 'shadow-xl')
    
    // Store the selected card data globally
    window.selectedCard = JSON.parse(this.element.dataset.card)

    // Enable discard
    const discardBtn = document.querySelector('.discard-area button')
    if (discardBtn) {
      discardBtn.classList.remove('border-slate-600', 'text-slate-400')
      discardBtn.classList.add('bg-red-500', 'hover:bg-red-400', '!border-red-500', 'text-white')
    }
  }

  deselect() {
    // Remove selected class from any selected card
    document.querySelectorAll('.selected-card').forEach(el => {
      el.classList.remove('selected-card', 'ring', 'ring-yellow-500', 'top-[-5px]', 'shadow-xl')
    })
    
    // Clear the selected card data
    window.selectedCard = null

    // Disable discard
    const discardBtn = document.querySelector('.discard-area button')
    if (discardBtn) {
      discardBtn.classList.add('border-slate-600', 'text-slate-400')
      discardBtn.classList.remove('bg-red-500', 'hover:bg-red-400', '!border-red-500', 'text-white')
    }
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
    column.classList.add('outline-slate-500/80', 'outline-2', 'outline', 'outline-offset-2')
    setTimeout(() => {
      column.classList.remove('outline-slate-500/80', 'outline-2', 'outline', 'outline-offset-2')
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
