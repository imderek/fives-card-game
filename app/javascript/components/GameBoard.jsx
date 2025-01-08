import React from 'react';
import BoardColumn from './BoardColumn';
import { evaluatePokerHand } from '../utils/pokerHandEvaluator';

const GameBoard = ({ cards = [], selectedCard, onPlayCardToColumn, opponentName, playerName, winner, isPlayer1 }) => {
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
      <div className="mb-4 px-6 player-board grid grid-cols-4 gap-3">
        {topColumns.map((column, index) => (
          <BoardColumn
            key={index}
            cards={column}
            index={isPlayer1 ? index : index + 4}
            selectedCard={selectedCard}
            onPlayCardToColumn={onPlayCardToColumn}
            isPlayerColumn={true}
          />
        ))}
      </div>

      <div className="mt-0 mb-4 h-px bg-slate-600/60"></div>

      {/* Bottom board area */}
      <div className="mb-2 px-6 opponent-board grid grid-cols-4 gap-3">
        {bottomColumns.map((column, index) => (
          <BoardColumn
            key={index}
            cards={column}
            index={isPlayer1 ? index + 4 : index}
            selectedCard={selectedCard}
            onPlayCardToColumn={onPlayCardToColumn}
            isPlayerColumn={false}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard; 