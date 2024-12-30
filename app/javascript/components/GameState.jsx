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

  // Add null check before rendering
  if (!game) {
    return <div className="text-white">Loading game state...</div>;
  }

  return (
    <div id="react-game-state" className="w-full flex flex-col items-center gap-4">
      <div className="text-white">React: cards on board: {game.board_cards.length}</div>
    </div>
  );
};

export default GameState; 