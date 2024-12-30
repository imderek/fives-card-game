import React from 'react';
import Card from './Card';
import PlayerHand from './PlayerHand';
import GameBoard from './GameBoard';
import PlayerInfo from './PlayerInfo';
import { useGameChannel } from '../hooks/useGameChannel';

const GameState = ({ game: initialGame, currentUser }) => {
  const [selectedCard, setSelectedCard] = React.useState(null);
  
  // Use the WebSocket hook
  const liveGameState = useGameChannel(initialGame?.id, currentUser);
  
  // Merge initial game state with live updates
  const game = liveGameState || initialGame;
  
  const isPlayer1 = currentUser?.id === game?.player1_id;
  const playerHand = isPlayer1 ? game?.player1_hand || [] : game?.player2_hand || [];
  const opponentHand = isPlayer1 ? game?.player2_hand || [] : game?.player1_hand || [];
  
  const canDiscard = game?.winner_id === null && 
    game?.current_turn === currentUser?.id && 
    game?.turn_phase === "play_card" && 
    ((currentUser?.id === game?.player1_id && game?.player1_discard_pile?.length === 0) || 
     (currentUser?.id === game?.player2_id && game?.player2_discard_pile?.length === 0));

  const handleDiscard = async () => {
    if (!game?.id) return;
    
    try {
      const response = await fetch(`/games/${game.id}/discard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]')?.content
        }
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error discarding:', error);
    }
  };

  const handlePlayCard = (card) => {
    if (selectedCard?.suit === card.suit && selectedCard?.value === card.value) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  console.log('Rendering GameState with selectedCard:', selectedCard);

  if (!game || !currentUser) {
    return <div>Loading game...</div>;
  }

  return (
    <div id="react-game-state" className="w-full flex flex-col items-center gap-4">
      <div className="text-white">React: board cards: {game.board_cards.length}</div>
    </div>
  );
};

export default GameState; 