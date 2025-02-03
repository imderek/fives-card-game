import React from 'react';

const Card = React.forwardRef(({ card, playable = false, playersHand = false, onPlay, isSelected = false, facedown = false, isAnimating = false, style }, ref) => {
  if (!card) {
    console.warn('Card component received null or undefined card prop');
    return null;
  }

  const isWild = card.value?.startsWith('W') && card.suit === '★';
  
  const getWildDisplay = () => {
    if (!isWild) return null;
    return '★';  // Just show the star symbol
  };

  const cardStyles = `
    relative transition-all duration-150 ease-out rounded-lg shadow-[0_0_5px_rgba(0,0,0,0.2)]
    ${card.isPlaceholder ? 'w-[3.7rem] h-[4.7rem]' :
      playable || playersHand ? 'w-[3.7rem] h-[4.7rem]' : 'w-12 h-[4rem] sm:h-[3rem] sm:text-sm'}
    ${isSelected ? 'selected-card ring ring-amber-500 border border-amber-600/80 translate-y-[-7px] !shadow-[-8px_3px_10px_rgba(0,0,0,0.2)]' : ''}
    border
    ${isWild && !facedown ? '!border-none bg-gradient-to-tl from-green-300 via-blue-500 to-80% to-purple-500' : 'border-white bg-gradient-to-br from-slate-200 from-10% via-white via-30% to-slate-400'}
    ${isAnimating ? 'fixed transition-all duration-300 ease-out z-[100]' : ''}
  `.trim();

  const handleClick = (e) => {
    e.stopPropagation();
    if (playable && onPlay && !card.isPlaceholder) {
      onPlay(card);
    }
  };

  return (
    <div 
      ref={ref}
      data-card-id={`${card.suit}-${card.value}`}
      className={cardStyles} 
      onClick={handleClick}
      style={{ 
        position: 'relative',
        zIndex: isSelected ? 50 : 30,
        ...style
      }}
    >
      {facedown ? (
        <div className="w-full h-full flex items-center justify-center">
          <svg width="30" height="30" viewBox="0 0 30 30" className="text-slate-500/70">
            <circle cx="5" cy="9" r="3" fill="currentColor"/>
            <circle cx="15" cy="9" r="3" fill="currentColor"/>
            <circle cx="25" cy="9" r="3" fill="currentColor"/>
            <circle cx="5" cy="21" r="3" fill="currentColor"/>
            <circle cx="15" cy="21" r="3" fill="currentColor"/>
            <circle cx="25" cy="21" r="3" fill="currentColor"/>
          </svg>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-start p-0.5 px-1.5">
          <div className={`${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : isWild ? 'text-white' : 'text-black'} text-md`}>
            {isWild ? getWildDisplay() : `${card.value}${card.suit}`}
          </div>
        </div>
      )}
    </div>
  );
});

export default Card; 