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

  console.log('GameState render:', {
    selectedCard,
    boardCards: game.board_cards,
    optimisticState: optimisticState?.board_cards
  });

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

  const handlePlayCardToColumn = (columnIndex) => {
    if (!selectedCard) return;

    console.log('Before update:', {
      selectedCard,
      columnIndex,
      currentBoardCards: game.board_cards
    });

    // Make optimistic update
    setOptimisticState(prevState => {
      const currentState = prevState || game;
      const handKey = isPlayer1 ? 'player1_hand' : 'player2_hand';
      
      // Create a deep copy of the current state
      const newState = {
        ...currentState,
        board_cards: [...(currentState.board_cards || [])],
        player1_hand: [...(currentState.player1_hand || [])],
        player2_hand: [...(currentState.player2_hand || [])]
      };

      // Remove card from player's hand
      newState[handKey] = newState[handKey].filter(
        card => !(card.suit === selectedCard.suit && card.value === selectedCard.value)
      );

      // Add card to board
      newState.board_cards.push({ ...selectedCard, column: columnIndex });

      console.log('New optimistic state:', {
        oldBoardCards: currentState.board_cards?.length,
        newBoardCards: newState.board_cards.length,
        oldHand: currentState[handKey]?.length,
        newHand: newState[handKey].length
      });

      return newState;
    });

    // Clear selected card immediately for better UX
    setSelectedCard(null);
  };

  if (!game || !currentUser) {
    return <div>Loading game...</div>;
  }

  return (
    <div id="react-game-state" className="w-full flex flex-col items-center gap-4">
      <div className="text-white">Debug - Board Cards: {game.board_cards?.length || 0}</div>
      
      {/* Opponent info */}
      <PlayerInfo 
        player={isPlayer1 ? game.player2 : game.player1}
        isCurrentTurn={game.current_turn !== currentUser.id}
        cardCount={opponentHand.length}
      />

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

      {/* Game board */}
      <GameBoard
        cards={game.board_cards || []}
        selectedCard={selectedCard}
        onPlayCardToColumn={handlePlayCardToColumn}
      />

      {/* Player info */}
      {/* <PlayerInfo 
        player={currentUser}
        isCurrentTurn={game.current_turn === currentUser.id}
        cardCount={playerHand.length}
      /> */}

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
    </div>
  );
};

export default GameState; 