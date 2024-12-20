import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["difficulty", "botCard", "checkmark"]
  static classes = ["selected", "unselected"]
  
  connect() {
    // Select Easy bot by default
    this.selectBot('easy')
  }
  
  // Method for initial selection (without event)
  selectBot(difficulty) {
    if (difficulty === 'hard') return // Don't allow hard difficulty yet
    
    // Update hidden field
    this.difficultyTarget.value = difficulty

    // Update card styles
    this.botCardTargets.forEach(card => {
      card.classList.remove('shadow-xl', '!bg-white', 'text-slate-700')
      card.classList.add('bg-transparent', 'border', 'border-slate-500/60')
      card.querySelector('h2').classList.remove('text-slate-700')
      card.querySelector('h2').classList.add('text-white')
    })
    
    // Style selected card
    const selectedCard = this.botCardTargets.find(card => 
      card.dataset.difficulty === difficulty
    )
    selectedCard.classList.add('shadow-xl', '!bg-white', 'text-slate-700')
    selectedCard.classList.remove('bg-transparent', 'border', 'border-slate-500/60')
    selectedCard.querySelector('h2').classList.add('text-slate-700')
    selectedCard.querySelector('h2').classList.remove('text-white')
  }
  
  // Method for click events
  select(event) {
    const difficulty = event.currentTarget.dataset.difficulty
    this.selectBot(difficulty)
  }
}