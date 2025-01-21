import React from 'react';

const Scoreboard = ({ 
    playerScore,
    opponentScore,
    playerName,
    opponentName,
    isCurrentPlayerTurn,
    isBot,
    winner
}) => {
    return (
        <div className="mb-1 px-6 sm:p-0 w-full">
            <div className="px-7 md:px-3 bg-slate-700/80 text-white rounded-lg relative z-40 w-full">
                <div className="h-full relative flex items-center justify-center gap-4 rounded-lg">
                    {/* Turn indicator */}
                    <div className={`${isBot ? 'hidden' : 'absolute'} ${isCurrentPlayerTurn ? 'left-1' : 'right-1'} top-1/2 -translate-y-1/2 flex flex-1 flex-col items-center justify-center`}>
                        <div className="absolute w-3 h-3">
                            <div className="w-full h-full rounded-full bg-amber-500 animate-ping"></div>
                        </div>
                        <div className="absolute w-2 h-2">
                            <div className="w-full h-full rounded-full bg-amber-500 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Current player's score */}
                    <div className={`py-2 ${isCurrentPlayerTurn ? 'border-b-4 border-amber-500' : 'border-b-4 border-transparent'} relative flex flex-1 flex-col items-center justify-center`}>
                        <div className="text-xl font-bold">
                            {playerScore.toLocaleString()}
                        </div>
                        <div className="text-xs font-medium text-slate-200">{playerName}</div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-12 bg-slate-500/50"></div>

                    {/* Opponent's score */}
                    <div className={`py-2 ${!isCurrentPlayerTurn ? 'border-b-4 border-amber-500' : 'border-b-4 border-transparent'} relative flex flex-1 flex-col items-center justify-center`}>
                        <div className="text-xl font-bold text-slate-400">
                            {(!winner && opponentScore > 0) ? '???' : opponentScore.toLocaleString()}
                        </div>
                        <div className="text-xs font-medium text-slate-400">{opponentName}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scoreboard; 