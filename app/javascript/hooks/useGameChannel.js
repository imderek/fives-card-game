import { useEffect, useState } from 'react';
import { createConsumer } from "@rails/actioncable"

const consumer = createConsumer();

export const useGameChannel = (gameId, userId) => {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!gameId || !userId) return;

    // Extract the ID if we were passed a user object
    const currentUserId = typeof userId === 'object' ? userId.id : userId;

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
            // console.log('Initial game state:', data.game);
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
          // console.log('Received update:', {
          //   recipient_id: data.recipient_id,
          //   currentUserId,
          //   isMyUpdate: data.recipient_id === currentUserId,
          //   status: data.game.status,
          //   winner_id: data.game.winner_id
          // });
          
          setGameState(prevState => {
            if (!prevState) return data.game;

            // Create new state with shared updates
            const newState = {
              ...prevState,
              board_cards: data.game.board_cards,
              current_turn: data.game.current_turn,
              column_scores: data.game.column_scores,
              player1_discard_pile: data.game.player1_discard_pile,
              player2_discard_pile: data.game.player2_discard_pile,
              status: data.game.status,
              winner_id: data.game.winner_id,
              player1_total_score: data.game.player1_total_score,
              player2_total_score: data.game.player2_total_score
            };

            // Update hands based on recipient
            if (data.recipient_id === currentUserId) {
              // Update our hand with full card details
              if (currentUserId === prevState.player1_id && Array.isArray(data.game.player1_hand)) {
                newState.player1_hand = [...data.game.player1_hand];
                // Update opponent's hand count only
                if (typeof data.game.player2_hand === 'number') {
                  newState.player2_hand = Array(data.game.player2_hand).fill({ isPlaceholder: true });
                }
              } else if (currentUserId === prevState.player2_id && Array.isArray(data.game.player2_hand)) {
                newState.player2_hand = [...data.game.player2_hand];
                // Update opponent's hand count only
                if (typeof data.game.player1_hand === 'number') {
                  newState.player1_hand = Array(data.game.player1_hand).fill({ isPlaceholder: true });
                }
              }
            }

            // If game is over, show all cards
            if (data.game.winner_id) {
              if (Array.isArray(data.game.player1_hand)) {
                newState.player1_hand = [...data.game.player1_hand];
              }
              if (Array.isArray(data.game.player2_hand)) {
                newState.player2_hand = [...data.game.player2_hand];
              }
            }

            // console.log('State update:', {
            //   prevState: {
            //     player1_hand: prevState.player1_hand?.length,
            //     player2_hand: prevState.player2_hand?.length,
            //   },
            //   newState: {
            //     player1_hand: newState.player1_hand?.length,
            //     player2_hand: newState.player2_hand?.length,
            //   }
            // });

            return newState;
          });
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