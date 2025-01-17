import "@hotwired/turbo-rails"
import { Application } from "@hotwired/stimulus"
import 'flowbite'

// Add this line to import channels
import "./channels"

// Initialize Stimulus
const application = Application.start()
application.debug = false
window.Stimulus = application

// Import controllers manually
import BotSelectionController from "./controllers/bot_selection_controller"
import DropdownController from "./controllers/dropdown_controller"

// Register controllers
application.register("bot-selection", BotSelectionController)
application.register("dropdown", DropdownController)

// Initialize Flowbite after each Turbo navigation
document.addEventListener('turbo:load', () => {
  initFlowbite();
})

document.addEventListener('turbo:render', () => {
  initFlowbite();
})

// Add React setup
import React from 'react'
import { createRoot } from 'react-dom/client'
import GameState from './components/GameState'

document.addEventListener('turbo:load', () => {
  const gameContainer = document.getElementById('react-game-root')
  
  if (gameContainer) {
    try {
      // Add null checks and logging
      const gameDataStr = gameContainer.dataset.game
      const currentUserStr = gameContainer.dataset.currentUser
      
      if (!gameDataStr || !currentUserStr) {
        console.warn('Missing data attributes:', {
          game: gameDataStr,
          currentUser: currentUserStr
        })
        return
      }

      const gameData = JSON.parse(gameDataStr)
      const currentUser = JSON.parse(currentUserStr)
      
      const root = createRoot(gameContainer)
      root.render(
        <GameState 
          game={gameData} 
          currentUser={currentUser} 
        />
      )
    } catch (error) {
      console.error('Error initializing React app:', error, {
        container: gameContainer,
        dataAttributes: gameContainer?.dataset
      })
    }
  }
})

document.addEventListener("turbo:before-render", (event) => {
  const gameRoot = document.getElementById("react-game-root");
  if (gameRoot) {
    event.preventDefault();
    
    // Use the event's detail.resume callback instead
    setTimeout(() => {
      event.detail.resume();
    }, 100);
  }
});