import React from 'react';
import Card from './Card';

const GameBoard = ({ cards = [] }) => {
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
        <div className="px-6 player-board grid grid-cols-4 gap-3">
          {playerCards.map((column, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center pt-2 pb-1 rounded-lg bg-slate-700"
              data-controller="card"
              data-action="click->card#playColumn"
              data-column-index={index}
            >
              {/* Cards vertically stacked */}
              <div className="flex flex-col -space-y-[2.3rem] md:-space-y-16 items-center">
                {column.map((card, cardIndex) => (
                  <Card key={cardIndex} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opponent's board area */}
      <div className="mb-2">
        <div className="px-6 opponent-board grid grid-cols-4 gap-3">
          {opponentCards.map((column, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center pt-2 pb-1 rounded-lg bg-slate-700"
            >
              {/* Cards vertically stacked */}
              <div className="flex flex-col -space-y-[2.3rem] md:-space-y-16 items-center">
                {column.map((card, cardIndex) => (
                  <Card key={cardIndex} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameBoard; 