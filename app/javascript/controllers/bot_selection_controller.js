import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["difficulty", "botCard", "checkmark"]
  static classes = ["selected", "unselected"]
  
  connect() {
    // Get difficulty from URL params if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const difficultyParam = urlParams.get('difficulty');
    
    // Select difficulty from param or default to 'easy'
    this.selectBot(difficultyParam || 'easy')
  }
  
  // Method for initial selection (without event)
  selectBot(difficulty) {
    // Update hidden field
    this.difficultyTarget.value = difficulty
    console.log(difficulty)

    // Update card styles
    this.botCardTargets.forEach(card => {
      card.classList.remove('shadow-xl', '!bg-white', 'text-slate-700')
      card.classList.add('bg-transparent', 'border', 'border-slate-500/60')
      card.querySelector('h2').classList.remove('text-slate-700')
      card.querySelector('h2').classList.add('text-white')

      // banner default styles
      const banner = card.querySelector('.banner')
      if (banner) {
        banner.classList.remove('bg-slate-300')
        banner.classList.remove('text-slate-500')
        banner.classList.add('bg-slate-700/70')
      }
    })
    
    // Style selected card
    const selectedCard = this.botCardTargets.find(card => 
      card.dataset.difficulty === difficulty
    )
    selectedCard.classList.add('shadow-xl', '!bg-white', 'text-slate-700')
    selectedCard.classList.remove('bg-transparent', 'border', 'border-slate-500/60')
    selectedCard.querySelector('h2').classList.add('text-slate-700')
    selectedCard.querySelector('h2').classList.remove('text-white')

    // banner
    const banner = selectedCard.querySelector('.banner')
    if (banner) {
      banner.classList.remove('bg-slate-700/70')
      banner.classList.add('bg-slate-300')
      banner.classList.add('text-slate-500')
    }
  }
  
  // Method for click events
  select(event) {
    const difficulty = event.currentTarget.dataset.difficulty
    this.selectBot(difficulty)
  }
}