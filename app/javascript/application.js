import "@hotwired/turbo-rails"
import { Application } from "@hotwired/stimulus"
import 'flowbite'

// Add this line to import channels
import "./channels"

// Import React and related libraries
import React from 'react'
import { createRoot } from 'react-dom/client'

// Import your components
import GameState from './components/GameState'
import Timer from './components/Timer'  // Make sure this import is at the top level

/*
 * =================
 * Stimulus Setup
 * =================
 */
const application = Application.start()
application.debug = false
window.Stimulus = application

// Register all Stimulus controllers
import BotSelectionController from "./controllers/bot_selection_controller"
import DropdownController from "./controllers/dropdown_controller"
import UserPreferenceController from "./controllers/user_preference_controller"

application.register("bot-selection", BotSelectionController)
application.register("dropdown", DropdownController)
application.register("user-preference", UserPreferenceController)

/*
 * =================
 * Flowbite Setup
 * =================
 */
// Initialize Flowbite after Turbo navigations
document.addEventListener('turbo:load', () => {
  initFlowbite();
})

document.addEventListener('turbo:render', () => {
  initFlowbite();
})

// Initialize Flowbite after Turbo Stream updates to the header
document.addEventListener('turbo:before-stream-render', (event) => {
  const streamElement = event.target;
  if (streamElement.getAttribute('target') === 'header') {
    setTimeout(() => initFlowbite(), 100);
  }
});

document.addEventListener('turbo:render', () => {
  if (document.getElementById('header')) {
    initFlowbite();
  }
});

/*
 * =================
 * React Game Setup
 * =================
 */
// Initialize React game component on page load
document.addEventListener('turbo:load', () => {
  const gameContainer = document.getElementById('react-game-root')
  
  if (gameContainer) {
    initializeGameComponent(gameContainer)
  }
})

// Handle React component cleanup before Turbo navigation
document.addEventListener("turbo:before-render", (event) => {
  const gameRoot = document.getElementById("react-game-root");
  if (gameRoot) {
    event.preventDefault();
    setTimeout(() => event.detail.resume(), 100);
  }
});

/*
 * =================
 * React Timer Setup
 * =================
 */
document.addEventListener('turbo:load', () => {
  const timerContainer = document.getElementById('react-timer-root')
  
  if (timerContainer) {
    try {
      const timerDataStr = timerContainer.dataset.timer
      
      if (!timerDataStr) {
        console.warn('Missing timer data attribute')
        return
      }

      const timerData = JSON.parse(timerDataStr)
      
      const root = createRoot(timerContainer)
      root.render(
        React.createElement(Timer, {
          initialTime: timerData.initialTime,
          isCountdown: timerData.isCountdown,
          onTimeEnd: timerData.onTimeEnd
        })
      )
    } catch (error) {
      console.error('Error initializing Timer component:', error, {
        container: timerContainer,
        dataAttributes: timerContainer?.dataset
      })
    }
  }
})

/*
 * =================
 * Helper Functions
 * =================
 */
function initializeGameComponent(container) {
  try {
    const gameDataStr = container.dataset.game
    const currentUserStr = container.dataset.currentUser
    
    if (!gameDataStr || !currentUserStr) {
      console.warn('Missing data attributes:', {
        game: gameDataStr,
        currentUser: currentUserStr
      })
      return
    }

    const gameData = JSON.parse(gameDataStr)
    const currentUser = JSON.parse(currentUserStr)
    
    const root = createRoot(container)
    root.render(
      <GameState 
        game={gameData} 
        currentUser={currentUser} 
      />
    )
  } catch (error) {
    console.error('Error initializing React app:', error, {
      container: container,
      dataAttributes: container?.dataset
    })
  }
}

