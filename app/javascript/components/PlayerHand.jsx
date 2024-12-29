import React from 'react';
import Card from './Card';

const PlayerHand = ({ cards, isCurrentPlayer, canPlay, onPlayCard }) => {
  return (
    <div className="player-hand relative flex items-end justify-center space-x-[-1.5rem] h-48">
      {cards.map((card, index) => {
        const totalCards = cards.length;
        const angle = -15 + (30.0 / Math.max(1, totalCards - 1)) * index;
        const normalizedAngle = angle / 25.0;
        const yOffset = -30 * (1 - normalizedAngle * normalizedAngle);
        const xOffset = -angle * 0.15;

        return (
          <div
            key={`card-${index}`}
            style={{
              transformOrigin: 'bottom center',
              transform: `rotate(${angle}deg) translate(${xOffset}px, ${yOffset}px)`,
              zIndex: index
            }}
          >
            <Card
              card={card}
              playable={isCurrentPlayer && canPlay}
              onPlay={onPlayCard}
              isSelected={card.isSelected}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PlayerHand; 