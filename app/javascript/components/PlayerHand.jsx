import React from 'react';
import Card from './Card';

const PlayerHand = ({ cards, isCurrentPlayer, canPlay, onPlayCard, onDiscard, canDiscard }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${canDiscard ? 'mb-3' : 'mb-4'} relative top-[1.8rem] flex items-end justify-center space-x-[-1.5rem]`}>
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

      {/* Discard button */}
      {canDiscard && (
        <div className="discard-area w-full px-5">
          <div className="flex flex-row items-center justify-center gap-2">
            <div className="block text-xs font-normal text-slate-400">You can opt to</div>
            <button
              onClick={onDiscard}
              className={`w-28 px-2 py-2 mb-0.5 text-xs font-medium border rounded-lg transition-colors ${
                cards.some(card => card.isSelected)
                  ? 'bg-red-500 hover:bg-red-400 !border-red-500 text-white'
                  : 'border-slate-600 text-slate-400'
              }`}
            >
              Discard & Draw
            </button>
            <div className="block text-xs font-normal text-slate-400 mr-[0.3rem]">but only once</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerHand; 