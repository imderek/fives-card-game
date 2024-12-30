import React from 'react';
import Card from './Card';

const GameBoard = ({ centerPile = [], lastPlayedCard }) => {
  return (
    <div className="game-board relative w-full max-w-2xl mx-auto">
      <div className="center-pile flex justify-center items-center">
        {(centerPile?.length > 0) && (
          <div className="played-cards-stack relative">
            {lastPlayedCard && (
              <div className="absolute top-0 left-0">
                <Card card={lastPlayedCard} />
              </div>
            )}
            <div className="pile-count absolute -bottom-6 text-sm text-slate-500">
              {centerPile.length} cards
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard; 