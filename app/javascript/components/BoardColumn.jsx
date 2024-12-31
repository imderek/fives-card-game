import React from 'react';
import Card from './Card';
import { evaluatePokerHand } from '../utils/pokerHandEvaluator';

const BoardColumn = ({ cards = [], index, selectedCard, onPlayCardToColumn, isPlayerColumn }) => {
  const { name: handName, score } = evaluatePokerHand(cards);
  
  const scoreColorClass = (score) => {
    if (score >= 1000) return 'text-yellow-400';
    if (score >= 500) return 'text-purple-400';
    return 'text-cyan-400';
  };

  return (
    <div
      key={index}
      className={`min-w-[4.5rem] min-h-[14.25rem] p-2 relative column transition-colors duration-150 flex flex-col gap-1 w-full rounded-lg bg-slate-700 
        ${selectedCard && isPlayerColumn ? 'cursor-pointer hover:bg-slate-600' : ''}`}
      onClick={() => isPlayerColumn && selectedCard && onPlayCardToColumn(index)}
      style={{ pointerEvents: isPlayerColumn ? 'all' : 'none' }}
    >
      {/* Hand name and score */}
      {handName && (
        <div className="text-xs text-center text-white relative top-[-0.1rem]">
          <div className="line-clamp-1">{handName}</div>
          {score > 0 && (
            <div className={scoreColorClass(score)}>+{score}</div>
          )}
        </div>
      )}
      
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