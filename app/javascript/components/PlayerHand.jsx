import React from 'react';
import Card from './Card';

const PlayerHand = ({ cards, isCurrentPlayer, canPlay, onPlayCard, onDiscard, canDiscard, facedown = false }) => {
  const handlePlayCard = (card, cardElement) => {
    if (!cardElement) return;
    
    // Get the card's current position in the hand
    const cardRect = cardElement.getBoundingClientRect();
    
    // Debug logs
    console.log('Card Element Debug:', {
      element: cardElement,
      tagName: cardElement.tagName,
      classList: cardElement.className,
      rect: cardRect
    });
    
    // Convert to fixed position coordinates
    const initialPosition = {
      x: cardRect.left + window.scrollX,
      y: cardRect.top + window.scrollY
    };

    // Debug log
    console.log('Initial Position:', initialPosition);
    
    onPlayCard({
      ...card,
      initialPosition
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${canDiscard ? 'mb-3' : 'mb-4'} relative flex items-end justify-center ${facedown ? '-space-x-4' : 'top-[1.8rem] space-x-[-1.5rem]'}`}>
        {cards.map((card, index) => {
          // Only calculate angles and offsets if not stacked
          const style = facedown ? {
            zIndex: index,
            opacity: card.isPlaceholder ? '0.0' : '1',
            pointerEvents: card.isPlaceholder ? 'none' : 'auto'
          } : {
            transformOrigin: 'bottom center',
            transform: `rotate(${-15 + (30.0 / Math.max(1, cards.length - 1)) * index}deg) translate(${-(-15 + (30.0 / Math.max(1, cards.length - 1)) * index) * 0.15}px, ${-30 * (1 - ((-15 + (30.0 / Math.max(1, cards.length - 1)) * index) / 25.0) ** 2)}px)`,
            zIndex: index,
            opacity: card.isPlaceholder ? '0.0' : '1',
            pointerEvents: card.isPlaceholder ? 'none' : 'auto'
          };

          const isLastCard = index === cards.length - 1;

          return (
            <div
              key={`${card.suit}-${card.value}-${index}`}
              style={style}
            >
              <div className={isLastCard && !facedown ? 'duration-500 ease-out opacity-0 translate-y-[-20px] animate-card-enter' : ''}>
                <Card
                  card={card}
                  playable={isCurrentPlayer && canPlay && !card.isPlaceholder}
                  playersHand={true}
                  onPlay={(card) => handlePlayCard(card, document.querySelector(`[data-card-id="${card.suit}-${card.value}"]`))}
                  isSelected={card.isSelected}
                  facedown={facedown}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Discard button */}
      {canDiscard && !facedown && (
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