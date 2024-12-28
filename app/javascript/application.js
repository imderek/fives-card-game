import "@hotwired/turbo-rails"
import { Application } from "@hotwired/stimulus"
import { initFlowbite } from 'flowbite'
import "./components/GameState.js"

// Initialize Flowbite on both regular page load and Turbo navigation
document.addEventListener('DOMContentLoaded', () => initFlowbite())
document.addEventListener('turbo:render', () => initFlowbite())
document.addEventListener('turbo:load', () => initFlowbite())

// Initialize Stimulus
const application = Application.start()

// Register controllers manually
import CardController from "./controllers/card_controller"
import BotSelectionController from "./controllers/bot_selection_controller"

application.register("card", CardController)
application.register("bot-selection", BotSelectionController)

// Export for use elsewhere
window.Stimulus = application