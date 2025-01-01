import { useEffect, useState } from 'react';
import { createConsumer } from "@rails/actioncable"

const consumer = createConsumer();

export const useGameChannel = (gameId, userId) => {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!gameId || !userId) return;

    // Cleanup any existing subscriptions for this game
    consumer.subscriptions.subscriptions.forEach(sub => {
      if (sub.identifier.includes(gameId)) {
        sub.unsubscribe();
      }
    });

    const channel = consumer.subscriptions.create(
      { 
        channel: "GameChannel",
        game_id: gameId
      },
      {
        connected() {
          console.log(`Connected to game ${gameId} channel`);
          // Request latest game state when reconnecting
          fetch(`/games/${gameId}`, {
            headers: {
              'Accept': 'application/json'
            }
          })
          .then(response => response.json())
          .then(data => {
            if (data.game) {
              setGameState(data.game);
            }
          })
          .catch(error => console.error('Error fetching game state:', error));
        },

        disconnected() {
          console.log(`Disconnected from game ${gameId} channel`);
        },

        received(data) {
          if (data.game) {
            setGameState(data.game);
          }
        }
      }
    );

    return () => {
      channel.unsubscribe();
      setGameState(null);
    };
  }, [gameId, userId]);

  return gameState;
}; 