import React from 'react';
import Card from './Card';
import PlayerHand from './PlayerHand';
import GameBoard from './GameBoard';
import PlayerInfo from './PlayerInfo';

const GameState = ({ game, currentUser }) => {
  const [selectedCard, setSelectedCard] = React.useState(null);
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
    <div id="game-state" className="w-full flex flex-col items-center gap-4">
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
        centerPile={game.center_pile || []}
        lastPlayedCard={game.last_played_card}
      />

      {/* Player info */}
      <PlayerInfo 
        player={currentUser}
        isCurrentTurn={game.current_turn === currentUser.id}
        cardCount={playerHand.length}
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
    </div>
  );
};

export default GameState; 