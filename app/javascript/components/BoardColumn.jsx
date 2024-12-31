import React from 'react';
import Card from './Card';

const BoardColumn = ({ cards = [], index, selectedCard, onPlayCardToColumn, isPlayerColumn }) => {
  return (
    <div
      key={index}
      className={`min-w-[4.5rem] min-h-[14.25rem] p-2 relative column transition-colors duration-150 flex flex-col gap-1 rounded-lg bg-slate-700 
        ${selectedCard && isPlayerColumn ? 'cursor-pointer hover:bg-slate-600' : ''}`}
      onClick={() => isPlayerColumn && selectedCard && onPlayCardToColumn(index)}
      style={{ pointerEvents: isPlayerColumn ? 'all' : 'none' }}
    >
      {/* Hand name and score */}
      <div className="text-xs text-center text-white relative top-[-0.1rem]">
        <div className="line-clamp-1">Two Pair</div>
        <div className="text-cyan-400">+250</div>
      </div>
      {/* Cards vertically stacked */}
      <div 
        className="flex flex-col -space-y-[2.3rem] md:-space-y-16 items-center"
        style={{ pointerEvents: 'none' }}
      >
        {cards.map((card, cardIndex) => (
          <div key={cardIndex} style={{ pointerEvents: 'none' }}>
            <Card card={card} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardColumn; 