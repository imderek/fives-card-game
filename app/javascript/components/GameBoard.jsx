import React from 'react';
import BoardColumn from './BoardColumn';

const GameBoard = ({ cards = [], selectedCard, onPlayCardToColumn, opponentName, playerName, winner, isPlayer1, shouldObscureOpponentDetails }) => {
  // Group cards by column
  const groupedCards = cards.reduce((acc, card) => {
    if (!acc[card.column]) {
      acc[card.column] = [];
    }
    acc[card.column].push(card);
    return acc;
  }, {});

  // Convert object to array of 8 columns (0-7)
  const columnArray = Array.from({ length: 8 }, (_, i) => groupedCards[i] || []);
  
  // Split into player and opponent sections
  const playerCards = columnArray.slice(0, 4);
  const opponentCards = columnArray.slice(4, 8);

  // Determine which columns belong to which player based on the player's perspective
  const isPlayer2 = window.location.pathname.includes(playerName.toLowerCase());
  
  // Each player should see their columns at the top
  const [topColumns, bottomColumns] = isPlayer1 
    ? [playerCards, opponentCards]   // Player 1 sees columns 0-3 at top
    : [opponentCards, playerCards];  // Player 2 sees columns 4-7 at top

  return (
    <div className="board w-full flex flex-col">
      {/* Top board area */}
      <div className="px-6 sm:px-0 player-board grid grid-cols-4 gap-3">
        {topColumns.map((column, index) => (
          <BoardColumn
            key={index}
            cards={column}
            index={isPlayer1 ? index : index + 4}
            selectedCard={selectedCard}
            onPlayCardToColumn={onPlayCardToColumn}
            isPlayerColumn={true}
            winner={winner}
            shouldObscureOpponentDetails={false}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="my-1.5 flex flex-col gap-1 uppercase">
        <div className="sm:hidden text-xs text-slate-500">{playerName}</div>
        <div className="sm:hidden h-px bg-slate-600/60"></div>
        <div className="sm:hidden text-xs text-slate-500">{opponentName}</div>
      </div>

      {/* Bottom board area */}
      <div className="px-6 sm:px-0 opponent-board grid grid-cols-4 gap-3">
        {bottomColumns.map((column, index) => (
          <BoardColumn
            key={index}
            cards={column}
            index={isPlayer1 ? index + 4 : index}
            selectedCard={selectedCard}
            onPlayCardToColumn={onPlayCardToColumn}
            isPlayerColumn={false}
            winner={winner}
            shouldObscureOpponentDetails={shouldObscureOpponentDetails}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard; 