import "@hotwired/turbo-rails";
import { Application } from "@hotwired/stimulus";
import "flowbite";

import CardController from "./controllers/card_controller";
import BotSelectionController from "./controllers/bot_selection_controller";
import DropdownController from "./controllers/dropdown_controller";

import { safeParseJSON } from "./utils/helpers/safeParseJSON";

// Initialize Stimulus
const application = Application.start();
application.debug = false; // Keeps debug mode off for production
window.Stimulus = application;

application.register("card", CardController);
application.register("bot-selection", BotSelectionController);
application.register("dropdown", DropdownController);

// Reinitialize Flowbite after each Turbo navigation
document.addEventListener("turbo:load", initFlowbite);
document.addEventListener("turbo:render", initFlowbite);

import React from "react";
import { createRoot } from "react-dom/client";
import GameState from "./components/gamestate/GameState";

document.addEventListener("turbo:load", () => {
  const gameContainer = document.getElementById("react-game-root");

  if (!gameContainer) return;

  // Destructure dataset attributes
  const { game: gameDataStr, currentUser: currentUserStr } = gameContainer.dataset;

  // Handle missing data attributes early
  if (!gameDataStr || !currentUserStr) {
    console.warn("Missing data attributes:", { game: gameDataStr, currentUser: currentUserStr });
    return;
  }

  // Parse JSON data safely
  const gameData = safeParseJSON(gameDataStr, "gameData");
  const currentUser = safeParseJSON(currentUserStr, "currentUser");

  if (!gameData || !currentUser) return;

  // console.group("App State Top Level");
  // console.log("Game Data:", gameData);
  // console.log("Current User:", currentUser);
  // console.groupEnd();

  // Initialize React component if not already initialized
  if (!gameContainer.dataset.reactInitialized) {
    const root = createRoot(gameContainer);
    root.render(<GameState game={gameData} currentUser={currentUser} />);
    gameContainer.dataset.reactInitialized = true; // Mark as initialized
  }
});

// Prevent premature rendering of React component
document.addEventListener("turbo:before-render", (event) => {
  const gameRoot = document.getElementById("react-game-root");
  if (gameRoot) {
    event.preventDefault();

    // Use Turbo's resume functionality to delay rendering
    setTimeout(() => event.detail.resume(), 100);
  }
});
