import React from 'react';
import Card from './Card';
import { evaluatePokerHand } from '../utils/pokerHandEvaluator';

const BoardColumn = ({ cards = [], index, selectedCard, onPlayCardToColumn, isPlayerColumn }) => {
  const { name: handName, score } = evaluatePokerHand(cards);
  
  const getColumnStrengthClasses = (score) => {
    const baseClasses = "min-w-[4.5rem] min-h-[14.25rem] p-2 relative column transition-colors duration-150 flex flex-col gap-1 w-full";
    
    let strengthClasses = "";
    if (score >= 1000 || (score >= 700 && score <= 999)) {
      strengthClasses = "bg-gradient-to-br from-purple-600 via-purple-800/30 via-35% to-purple-600/60 ring-1 ring-purple-500 bg-[length:200%_100%] shadow-[0_0_14px_10px_rgba(168,85,247,0.5)]";
    } else if (score >= 600 && score <= 699) {
      strengthClasses = "bg-gradient-to-br from-red-600/80 via-red-800/30 via-35% to-red-600/60 ring-1 ring-red-500 bg-[length:200%_100%] shadow-[0_0_14px_5px_rgba(220,38,38,0.5)]";
    } else if (score >= 500 && score <= 599) {
      strengthClasses = "bg-gradient-to-br from-amber-600/80 via-amber-800/30 via-35% to-amber-600/60 ring-1 ring-amber-500 bg-[length:200%_100%]";
    } else if (score >= 400 && score <= 499) {
      strengthClasses = "bg-gradient-to-br from-lime-600/80 via-lime-800/30 via-35% to-lime-600/60 ring-1 ring-lime-500 bg-[length:200%_100%]";
    } else if (score >= 300 && score <= 399) {
      strengthClasses = "bg-cyan-600/40 ring-1 ring-cyan-500";
    } else {
      strengthClasses = "bg-slate-700"; // Default styling
    }

    return `${baseClasses} ${strengthClasses} rounded-lg`;
  };

  const scoreColorClass = (score) => {
    if (score >= 1000 || (score >= 700 && score <= 999)) return 'text-purple-400';
    if (score >= 600 && score <= 699) return 'text-red-400';
    if (score >= 500 && score <= 599) return 'text-amber-400';
    if (score >= 400 && score <= 499) return 'text-lime-300';
    if (score >= 300 && score <= 399) return 'text-cyan-400';
    if (score >= 101 && score <= 299) return 'text-cyan-400';
    if (score >= 50 && score <= 100) return 'text-slate-200';
    return 'text-slate-400';
  };

  return (
    <div
      key={index}
      className={`${getColumnStrengthClasses(score)} ${selectedCard && isPlayerColumn ? 'cursor-pointer hover:bg-slate-600' : ''}`}
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