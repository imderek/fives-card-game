import React from 'react';

const Card = ({ card, playable = false, onPlay, isSelected = false }) => {
  const cardStyles = `
    relative 
    w-[3.7rem] h-[4.7rem] md:w-20 md:h-28
    ${isSelected ? 'ring-4 ring-blue-500 -translate-y-6' : ''}
    rounded-lg shadow-[0_0_5px_rgba(0,0,0,0.2)]
    border border-white 
    bg-gradient-to-br from-slate-200 from-10% via-white via-30% to-slate-400
    transition-all duration-200
  `.trim();

  const handleClick = (e) => {
    e.stopPropagation();
    if (playable && onPlay) {
      onPlay(card);
    }
  };

  return (
    <div 
      className={cardStyles} 
      onClick={handleClick}
      style={{ 
        position: 'relative',
        zIndex: isSelected ? 50 : 'auto'
      }}
    >
      <div className="w-full h-full flex flex-col items-start p-0.5 px-1.5 md:p-2">
        <div className={`${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'} text-md md:text-xl`}>
          {card.value}{card.suit}
        </div>
      </div>
    </div>
  );
};

export default Card; 