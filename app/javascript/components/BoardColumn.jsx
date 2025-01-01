import React from 'react';
import Card from './Card';
import { evaluatePokerHand } from '../utils/pokerHandEvaluator';

const BoardColumn = ({ cards = [], index, selectedCard, onPlayCardToColumn, isPlayerColumn }) => {
  const [prevScore, setPrevScore] = React.useState(0);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);
  
  const { name: handName, score } = evaluatePokerHand(cards);

  React.useEffect(() => {
    if (isPlayerColumn && score > prevScore && score >= 200) {
      setShouldAnimate(true);
      setTimeout(() => setShouldAnimate(false), 500);
    }
    setPrevScore(score);
  }, [score, isPlayerColumn]);

  const isColumnFull = cards.length >= 5;

  const getColumnStrengthClasses = (score, isPlayerColumn) => {
    const baseClasses = "min-w-[4.5rem] min-h-[14.25rem] p-2 relative column transition-colors duration-150 flex flex-col gap-1 w-full z-0";
    
    let strengthClasses = "";
    // Quads & Straight Flush (700-999) & Royal Flush (1000)
    if (score === 1000 || (score >= 700 && score <= 999)) {
      strengthClasses = "bg-gradient-to-br from-purple-500 via-purple-900 via-30% to-purple-700 ring-1 ring-purple-400/80 bg-[length:200%_100%] shadow-[0_0_15px_3px_rgba(168,85,247,0.9)]";
    } 
    // Full House (600-699)
    else if (score >= 600 && score <= 699) {
      strengthClasses = "bg-gradient-to-br from-red-600 via-red-900 via-35% to-red-700 ring-1 ring-red-400 bg-[length:200%_100%] shadow-[0_0_14px_5px_rgba(220,38,38,0.5)]";
    }
    // Flush (500-599)
    else if (score >= 500 && score <= 599) {
      strengthClasses = "bg-gradient-to-br from-amber-600/80 via-amber-800/30 via-35% to-amber-600/60 ring-1 ring-amber-500 bg-[length:200%_100%]";
    }
    // Straight (400-499)
    else if (score >= 400 && score <= 499) {
      strengthClasses = "bg-gradient-to-br from-lime-600/80 via-lime-800/30 via-35% to-lime-600/60 ring-1 ring-lime-500 bg-[length:200%_100%]";
    }
    // Trips (300-399)
    else if (score >= 300 && score <= 399) {
      strengthClasses = "bg-cyan-600/30 ring-1 ring-cyan-500";
    }
    // Two Pair (101-299), Pair (50-100), High Card
    else {
      strengthClasses = isPlayerColumn ? "bg-slate-700/80" : "bg-slate-800/80";
    }

    if (isColumnFull && isPlayerColumn) {
      strengthClasses += " cursor-not-allowed";
    }

    return `${baseClasses} ${strengthClasses} rounded-lg`;
  };
  const scoreColorClass = (score) => {
    // Royal Flush (1000) & Straight Flush & Quads (700-999)
    if (score === 1000 || (score >= 700 && score <= 999)) return 'font-normal text-purple-400';
    // Full House (600-699)
    if (score >= 600 && score <= 699) return 'text-red-400';
    // Flush (500-599)
    if (score >= 500 && score <= 599) return 'text-amber-400';
    // Straight (400-499)
    if (score >= 400 && score <= 499) return 'text-lime-300';
    // Trips (300-399)
    if (score >= 300 && score <= 399) return 'text-cyan-400';
    // Two Pair (101-299)
    if (score >= 101 && score <= 299) return 'text-cyan-400';
    // Pair (50-100)
    if (score >= 50 && score <= 100) return 'text-slate-200';
    // High Card
    return 'text-slate-400';
  };

  const renderParticles = () => {
    if (score < 700) return null;
    
    const isHighTier = score >= 700;
    const particleColor = isHighTier ? 'bg-purple-300' : 'bg-red-300';
    const glowColor = isHighTier ? 'shadow-purple-400' : 'shadow-red-400';
    
    return (
      <>
        {[...Array(7)].map((_, i) => {
          const segmentWidth = 50 / 6;
          const segmentStart = 25 + (segmentWidth * i);
          
          return (
            <div
              key={`particle-${i}`}
              className={`absolute w-[0.1rem] h-[0.1rem] rounded-full ${particleColor} animate-particle-float z-20 shadow-[0_0_3px_1px_rgba(168,85,247,0.9)] ${glowColor}`}
              style={{
                left: `${segmentStart + (Math.random() * segmentWidth)}%`,
                top: '0.5rem', // this is where the particles start relative to the column
                '--x-drift': `${(Math.random() * 20 - 10)}px`,
                animationDelay: `-${Math.random() * 2000}ms`,
              }}
            />
          );
        })}
      </>
    );
  };

  return (
    <div className="relative">
      {/* Particle container */}
      <div className="particle-container absolute inset-0 z-20">
        {renderParticles()}
      </div>

      {/* Main column content */}
      <div
        key={index}
        className={`${getColumnStrengthClasses(score, isPlayerColumn)} ${selectedCard && isPlayerColumn && !isColumnFull ? 'cursor-pointer hover:bg-slate-500' : ''} ${shouldAnimate ? 'animate-scale-up' : ''} relative z-0`}
        onClick={() => isPlayerColumn && selectedCard && !isColumnFull && onPlayCardToColumn(index)}
        style={{ pointerEvents: isPlayerColumn && !isColumnFull ? 'all' : 'none' }}
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
    </div>
  );
};

export default BoardColumn; 