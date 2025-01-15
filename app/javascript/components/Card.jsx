import React from 'react';

const Card = React.forwardRef(({ card, playable = false, playersHand = false, onPlay, isSelected = false, facedown = false, isAnimating = false, style }, ref) => {
  const cardStyles = `
    relative 
    ${card.isPlaceholder ? 'w-[3.7rem] h-[4.7rem]' :
      playable || playersHand ? 'w-[3.7rem] h-[4.7rem]' : 'w-12 h-[4rem] md:h-[3rem] md:text-sm'}
    ${isSelected ? 'selected-card ring ring-yellow-500 top-[-5px] shadow-xl' : ''}
    rounded-lg shadow-[0_0_5px_rgba(0,0,0,0.2)]
    ${facedown ? 'bg-gradient-to-br from-slate-600 to-slate-800' : 'border border-white bg-gradient-to-br from-slate-200 from-10% via-white via-30% to-slate-400'}
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
          <svg width="30" height="30" viewBox="0 0 30 30" className="text-slate-500">
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
          <div className={`${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'} text-md`}>
            {card.value}{card.suit}
          </div>
        </div>
      )}
    </div>
  );
});

export default Card; 