import React from 'react';
import Card from './Card';
import PlayerHand from './PlayerHand';
import GameBoard from './GameBoard';
import PlayerInfo from './PlayerInfo';
import { useGameChannel } from '../hooks/useGameChannel';

const GameState = ({ game: initialGame, currentUser }) => {
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [optimisticState, setOptimisticState] = React.useState(null);
  
  // Use the WebSocket hook
  const liveGameState = useGameChannel(initialGame?.id, currentUser);
  
  // Merge initial game state with live updates and optimistic updates
  const game = optimisticState || liveGameState || initialGame;
  
  const isPlayer1 = currentUser?.id === game?.player1_id;
  const playerHand = isPlayer1 ? game?.player1_hand || [] : game?.player2_hand || [];
  const opponentHand = isPlayer1 ? game?.player2_hand || [] : game?.player1_hand || [];

  // When we receive a new server state, clear optimistic state if it matches
  React.useEffect(() => {
    if (liveGameState && optimisticState) {
      // Clear optimistic state since server has caught up
      setOptimisticState(null);
    }
  }, [liveGameState]);

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

  const handlePlayCardToColumn = async (columnIndex) => {
    if (!selectedCard || !game?.id) return;

    // Make optimistic update
    setOptimisticState(prevState => {
      const currentState = prevState || game;
      const handKey = isPlayer1 ? 'player1_hand' : 'player2_hand';
      
      return {
        ...currentState,
        [handKey]: currentState[handKey].map(card => 
          card.suit === selectedCard.suit && card.value === selectedCard.value
            ? { ...card, isPlaceholder: true } // Instead of removing, mark as placeholder
            : card
        ),
        board_cards: [
          ...(currentState.board_cards || []),
          { ...selectedCard, column: columnIndex }
        ]
      };
    });

    setSelectedCard(null);

    try {
      const response = await fetch(`/games/${game.id}/play_card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/vnd.turbo-stream.html',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
          card: {
            ...selectedCard,
            column: columnIndex
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        setOptimisticState(null);
      }
    } catch (error) {
      console.error('Error playing card:', error);
      setOptimisticState(null);
    }
  };

  if (!game || !currentUser) {
    return <div>Loading game...</div>;
  }

  return (
    <div id="react-game-state" className="w-full py-3 flex flex-col items-center gap-4">
      {/* Player's hand */}
      <PlayerHand 
        cards={playerHand.map(card => ({
          ...card,
          isSelected: selectedCard?.suit === card.suit && selectedCard?.value === card.value
        }))}
        isCurrentPlayer={game.current_turn === currentUser.id}
        canPlay={game.turn_phase === "play_card"}
        onPlayCard={handlePlayCard}
      />

      {/* Discard button */}
      {canDiscard && (
        <div className="discard-area">
          <div className="flex flex-row items-center justify-center gap-2">
            <div className="block text-xs font-normal text-slate-400">You can opt to</div>
            <button 
              onClick={handleDiscard}
              className="w-28 px-2 py-2 mb-0.5 text-xs font-medium border border-slate-600 text-slate-400 rounded-lg transition-colors"
            >
              Discard & Draw
            </button>
            <div className="block text-xs font-normal text-slate-400 mr-[0.3rem]">but only once</div>
          </div>
        </div>
      )}

      {/* Game board */}
      <GameBoard
        cards={game.board_cards || []}
        selectedCard={selectedCard}
        onPlayCardToColumn={handlePlayCardToColumn}
      />
    </div>
  );
};

export default GameState; 