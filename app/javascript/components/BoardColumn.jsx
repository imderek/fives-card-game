import React from 'react';
import ReactDOM from 'react-dom';
import Card from './Card';
import { evaluatePokerHand } from '../utils/pokerHandEvaluator';

const BoardColumn = ({ cards = [], index, selectedCard, onPlayCardToColumn, isPlayerColumn }) => {
  const { name: handName, score } = evaluatePokerHand(cards);
  
  const [prevScore, setPrevScore] = React.useState(score);
  const [delayedScore, setDelayedScore] = React.useState(score);
  const [delayedHandName, setDelayedHandName] = React.useState(handName);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);
  const [animatingCard, setAnimatingCard] = React.useState(null);
  const columnRef = React.useRef(null);

  // Handle initial state and score decreases
  React.useEffect(() => {
    if (score <= prevScore) {
      setDelayedScore(score);
      setDelayedHandName(handName);
      setPrevScore(score);
    }
  }, [score, handName]);

  const isColumnFull = cards.length >= 5;

  const getColumnStrengthClasses = (score, isPlayerColumn) => {
    const baseClasses = "min-w-[4.5rem] min-h-[14.25rem] p-2 relative column transition-colors duration-150 flex flex-col gap-1 w-full z-0";
    
    let strengthClasses = "";
    // Quads & Straight Flush (700-999) & Royal Flush (1000)
    if (score === 1000 || (score >= 700 && score <= 999)) {
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

    // Get the column's position
    const columnRect = columnRef.current.getBoundingClientRect();
    
    // Pre-calculate the new score with the incoming card
    const newCards = [...cards, selectedCard];
    const { name: newHandName, score: newScore } = evaluatePokerHand(newCards);
    
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

      // All updates happen at exactly 300ms
      setTimeout(() => {
        onPlayCardToColumn(columnIndex);
        setAnimatingCard(null);
        setDelayedScore(newScore);
        setDelayedHandName(newHandName);
        if (newScore >= 200 && newScore > prevScore) {
          setShouldAnimate(true);
          setTimeout(() => setShouldAnimate(false), 500);
        }
        setPrevScore(newScore);
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
          <div className="text-xs text-center text-white relative top-[-0.1rem]">
            <div className="line-clamp-1">{delayedHandName}</div>
            {delayedScore > 0 && (
              <div className={scoreColorClass(delayedScore)}>+{delayedScore}</div>
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

      {renderAnimatingCard()}
    </div>
  );
};

export default BoardColumn; 