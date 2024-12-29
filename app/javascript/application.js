import "@hotwired/turbo-rails"
import "./controllers"

// Add React setup
import React from 'react'
import { createRoot } from 'react-dom/client'
import GameState from './components/GameState'

document.addEventListener('turbo:load', () => {
  const gameContainer = document.getElementById('game-container')
  
  if (gameContainer) {
    const gameData = JSON.parse(gameContainer.dataset.game)
    const currentUser = JSON.parse(gameContainer.dataset.currentUser)
    
    const root = createRoot(gameContainer)
    root.render(
      <GameState 
        game={gameData} 
        currentUser={currentUser} 
      />
    )
  }
})