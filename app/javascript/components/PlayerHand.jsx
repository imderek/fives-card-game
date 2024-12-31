import React from 'react';
import Card from './Card';

const PlayerHand = ({ cards, isCurrentPlayer, canPlay, onPlayCard }) => {
  return (
    <div className="player-hand mb-0 relative top-[1.8rem] flex items-end justify-center space-x-[-1.5rem]">
      {cards.map((card, index) => {
        const totalCards = cards.length;
        const angle = -15 + (30.0 / Math.max(1, totalCards - 1)) * index;
        const normalizedAngle = angle / 25.0;
        const yOffset = -30 * (1 - normalizedAngle * normalizedAngle);
        const xOffset = -angle * 0.15;

        const isLastCard = index === cards.length - 1;

        return (
          <div
            key={`${card.suit}-${card.value}-${index}`}
            style={{
              transformOrigin: 'bottom center',
              transform: `rotate(${angle}deg) translate(${xOffset}px, ${yOffset}px)`,
              zIndex: index,
              opacity: card.isPlaceholder ? '0.0' : '1',
              pointerEvents: card.isPlaceholder ? 'none' : 'auto'
            }}
          >
            <div className={isLastCard ? 'duration-500 ease-out opacity-0 translate-y-[-20px] animate-card-enter' : ''}>
              <Card
                card={card}
                playable={isCurrentPlayer && canPlay && !card.isPlaceholder}
                playersHand={true}
                onPlay={onPlayCard}
                isSelected={card.isSelected}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerHand; 