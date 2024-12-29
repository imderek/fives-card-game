import React from 'react';

const PlayerInfo = ({ player, isCurrentTurn, cardCount }) => {
  const playerName = player?.name || 'Unknown Player';
  
  return (
    <div className={`player-info flex items-center gap-2 p-2 rounded-lg ${
      isCurrentTurn ? 'bg-blue-100' : 'bg-slate-100'
    }`}>
      <div className="player-avatar w-8 h-8 rounded-full bg-slate-300">
        {/* Avatar placeholder */}
      </div>
      <div className="player-details">
        <div className="player-name font-medium">{playerName}</div>
        <div className="card-count text-sm text-slate-600">
          {cardCount || 0} cards
        </div>
      </div>
      {isCurrentTurn && (
        <div className="current-turn-indicator text-xs text-blue-600">
          Current Turn
        </div>
      )}
    </div>
  );
};

export default PlayerInfo; 