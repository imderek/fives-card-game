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
          if (!data.recipient_id) {
            // Bot game update - use entire state
            console.log(`Received full game update (bot game)`);
            setGameState(data.game);
          } else if (data.recipient_id === userId) {
            // PvP update for this player - merge with existing state
            console.log(`Received player-specific update for user ${userId}`);
            setGameState(prevState => ({
              ...prevState,
              ...data.game
            }));
          } else {
            // PvP update for other player - only update shared state
            console.log(`Received shared state update for game`);
            setGameState(prevState => ({
              ...prevState,
              ...data.game,
              // Preserve our own hand
              player1_hand: prevState?.player1_hand,
              player2_hand: prevState?.player2_hand,
            }));
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