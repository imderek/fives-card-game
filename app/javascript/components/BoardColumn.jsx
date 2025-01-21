import React from 'react';
import ReactDOM from 'react-dom';
import Card from './Card';
import { evaluatePokerHand } from '../utils/pokerHandEvaluator';

const BoardColumn = ({ cards = [], index, selectedCard, onPlayCardToColumn, isPlayerColumn, winner }) => {
  const [prevScore, setPrevScore] = React.useState(0);
  const [delayedScore, setDelayedScore] = React.useState(0);
  const [delayedHandName, setDelayedHandName] = React.useState('');
  const [shouldAnimate, setShouldAnimate] = React.useState(false);
  const [animatingCard, setAnimatingCard] = React.useState(null);
  const columnRef = React.useRef(null);

  const { name: handName, score } = evaluatePokerHand(cards);

  // Delayed score and hand name update, plus scale-up effect for significant hands
  React.useEffect(() => {
    if (score > prevScore) {
      // Delay both the score update and scale-up until after the card lands
      const timer = setTimeout(() => {
        setDelayedScore(score);
        setDelayedHandName(handName);
        if ((isPlayerColumn && score >= 200) || (!isPlayerColumn && !winner)) {
          setShouldAnimate(true);
          setTimeout(() => setShouldAnimate(false), 500);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else if (score <= prevScore) {
      // Update immediately for non-increasing scores
      setDelayedScore(score);
      setDelayedHandName(handName);
    }
    setPrevScore(score);
  }, [score, handName]);

  const isColumnFull = cards.length >= 5;

  const getColumnStrengthClasses = (score, isPlayerColumn) => {
    const baseClasses = "min-w-[4.5rem] min-h-[14.25rem] sm:min-h-[11.5rem] p-2 sm:p-1 relative column transition-colors duration-150 flex flex-col gap-1 w-full z-0";
    
    // Only show special styles for player columns or when there's a winner
    if (!isPlayerColumn && !winner) {
      return `${baseClasses} bg-slate-800/80 rounded-lg`;
    }

    let strengthClasses = "";
    // Straight Flush (800) & Royal Flush (1000)
    if (score >= 800) {
      strengthClasses = "bg-gradient-to-br from-slate-200 via-slate-900 via-40% to-slate-200 ring-1 ring-white bg-[length:200%_100%] shadow-[0_0_16px_3px_rgba(255,255,255,0.9)]";
    } 
    // Quads (700-799)
    else if (score >= 700 && score <= 799) {
      strengthClasses = "bg-gradient-to-br from-purple-500 via-[#2A0F40] via-40% to-purple-700 ring-1 ring-purple-400/80 bg-[length:200%_100%] shadow-[0_0_16px_3px_rgba(168,85,247,0.9)]";
    }
    // Full House (600-699)
    else if (score >= 600 && score <= 699) {
      strengthClasses = "bg-gradient-to-br from-red-600 via-red-900/60 via-35% to-red-700 ring-1 ring-red-500 bg-[length:200%_100%] shadow-[0_0_14px_5px_rgba(220,38,38,0.5)]";
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
    // Only show special colors for player columns or when there's a winner
    if (!isPlayerColumn && !winner) return 'text-slate-400';

    // Royal Flush (1000) & Straight Flush (800-999)
    if (score >= 800) return 'animate-pulse text-white';
    // Quads (700-799)
    if (score >= 700 && score <= 799) return 'text-purple-400';
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
    // Only show particles for player columns or when there's a winner
    if (score < 700 || (!isPlayerColumn && !winner)) return null;
    
    const isHighTier = score >= 800;
    const particleColor = isHighTier ? 'bg-white' : 'bg-purple-300';
    const glowColor = isHighTier ? 'shadow-white' : 'shadow-purple-400';
    
    return (
      <>
        {[...Array(7)].map((_, i) => {
          const segmentWidth = 50 / 6;
          const segmentStart = 25 + (segmentWidth * i);
          
          return (
            <div
              key={`particle-${i}`}
              className={`absolute w-[0.2rem] h-[0.2rem] rounded-full ${particleColor} ${glowColor} animate-particle-float z-20 shadow-[0_0_3px_1px_rgba(168,85,247,0.9)]`}
              style={{
                left: `${segmentStart + (Math.random() * segmentWidth)}%`,
                top: '0.25rem', // this is where the particles start relative to the column
                '--x-drift': `${(Math.random() * 20 - 10)}px`,
                animationDelay: `-${Math.random() * 2000}ms`,
              }}
            />
          );
        })}
      </>
    );
  };

  const handlePlayCard = (columnIndex) => {
    if (!selectedCard || !columnRef.current || !selectedCard.initialPosition) return;

    // Immediately remove card from hand
    onPlayCardToColumn(columnIndex);

    // Get the column's position
    const columnRect = columnRef.current.getBoundingClientRect();
    
    setAnimatingCard({
      ...selectedCard,
      style: {
        position: 'fixed',
        left: `${selectedCard.initialPosition.x}px`,
        top: `${selectedCard.initialPosition.y}px`,
        width: '3.7rem',
        height: '4.7rem',
        zIndex: 1000,
      }
    });

    requestAnimationFrame(() => {
      const targetX = columnRect.left + (columnRect.width / 2) - 29 + window.scrollX;
      const targetY = columnRect.top + (cards.length * 20) + window.scrollY;

      setAnimatingCard(prev => ({
        ...prev,
        style: {
          ...prev.style,
          transform: `translate(${targetX - selectedCard.initialPosition.x}px, ${targetY - selectedCard.initialPosition.y}px)`,
          transition: 'transform 300ms ease-out'
        }
      }));

      setTimeout(() => {
        setAnimatingCard(null);
      }, 300);
    });
  };

  const renderAnimatingCard = () => {
    if (!animatingCard) return null;

    return ReactDOM.createPortal(
      <Card
        card={animatingCard}
        isAnimating={true}
        style={animatingCard.style}
      />,
      document.body
    );
  };

  return (
    <div className="relative">
      {renderParticles()}

      <div
        ref={columnRef}
        className={`${getColumnStrengthClasses(delayedScore, isPlayerColumn)} ${selectedCard && isPlayerColumn && !isColumnFull ? 'cursor-pointer' : ''} ${shouldAnimate ? 'animate-scale-up' : ''}`}
        onClick={() => isPlayerColumn && selectedCard && !isColumnFull && handlePlayCard(index)}
        style={{ pointerEvents: isPlayerColumn && !isColumnFull ? 'all' : 'none' }}
      >
        {/* Hand name and score */}
        {delayedHandName && (
          <div className="text-xs text-center text-white relative top-[-0.1rem] sm:top-0 sm:leading-[.85rem]">
            <div className="line-clamp-1">
              {isPlayerColumn || winner ? delayedHandName : 'TBD'}
            </div>
            {delayedScore > 0 && (
              <div className={scoreColorClass(delayedScore)}>
                {isPlayerColumn || winner ? `+${delayedScore}` : '???'}
              </div>
            )}
          </div>
        )}
        
        {/* Cards vertically stacked */}
        <div 
          className="flex flex-col -space-y-[2.3rem] sm:-space-y-[1.5rem] items-center"
          style={{ pointerEvents: 'none' }}
        >
          {cards.map((card, cardIndex) => (
            <div 
              key={cardIndex} 
              className="opacity-0 animate-fade-in [animation-delay:300ms]"
              style={{ pointerEvents: 'none' }}
            >
              <Card 
                card={card} 
                facedown={!isPlayerColumn && !winner && cardIndex === 4}
              />
            </div>
          ))}
        </div>
      </div>

      {renderAnimatingCard()}
    </div>
  );
};

export default BoardColumn; 