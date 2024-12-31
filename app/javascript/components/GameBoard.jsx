import React from 'react';
import BoardColumn from './BoardColumn';

const GameBoard = ({ cards = [], selectedCard, onPlayCardToColumn }) => {
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

  return (
    <div className="board w-full flex flex-col">
      <div>
        {/* Player's board area */}
        <div className="mb-4 px-6 player-board grid grid-cols-4 gap-3">
          {playerCards.map((column, index) => (
            <BoardColumn
              key={index}
              cards={column}
              index={index}
              selectedCard={selectedCard}
              onPlayCardToColumn={onPlayCardToColumn}
              isPlayerColumn={true}
            />
          ))}
        </div>
      </div>

      {/* Opponent's board area */}
      <div className="mb-2">
        <div className="px-6 opponent-board grid grid-cols-4 gap-3">
          {opponentCards.map((column, index) => (
            <BoardColumn
              key={index}
              cards={column}
              index={index}
              selectedCard={selectedCard}
              onPlayCardToColumn={onPlayCardToColumn}
              isPlayerColumn={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard; 