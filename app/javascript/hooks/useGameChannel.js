import { useEffect, useState } from 'react';
import { createConsumer } from "@rails/actioncable"

const consumer = createConsumer();

export const useGameChannel = (gameId, userId) => {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!gameId || !userId) return;

    const channel = consumer.subscriptions.create(
      { 
        channel: "GameChannel",
        game_id: gameId
      },
      {
        connected() {
          console.log(`Connected to game ${gameId} channel`);
        },

        disconnected() {
          console.log(`Disconnected from game ${gameId} channel`);
        },

        received(data) {
          console.log('Received game update:', data);
          if (data.game) {
            setGameState(data.game);
          }
        }
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [gameId, userId]);

  return gameState;
}; 