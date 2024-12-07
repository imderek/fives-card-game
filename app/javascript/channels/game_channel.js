import consumer from "./consumer"

document.addEventListener("turbo:load", () => {
  const element = document.getElementById("game-container")
  if (element) {
    const gameId = element.dataset.gameId
    
    consumer.subscriptions.create({ channel: "GameChannel", game_id: gameId }, {
      connected() {
        // Called when the subscription is ready for use on the server
      },

      disconnected() {
        // Called when the subscription has been terminated by the server
      },

      received(data) {
        // Replace the game state with the new HTML
        const gameState = document.getElementById("game-state")
        if (gameState && data.html) {
          gameState.innerHTML = data.html
        }
      }
    })
  }
}) 