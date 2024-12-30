import React from 'react';

const Card = ({ card, playable, onPlay, isSelected }) => {
  return (
    <div 
      className={`card ${playable ? 'cursor-pointer' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={() => playable && onPlay(card)}
    >
      {/* card content */}
    </div>
  );
};

export default Card; 