import React, { useState, useEffect } from 'react';

const WinnerDeclaration = ({ 
    game, 
    currentUser, 
    formatPlayerName, 
    createNewGame 
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="w-full flex flex-col animate-enter-scale">
            <div className="my-1 mb-2 mx-6 px-3 pt-2 pb-3 bg-white rounded-lg relative z-40">
                {/* Heading */}
                <h1 className="mt-1 mb-4 text-xl font-bold text-slate-900 text-center">
                    {game.winner_id === currentUser.id ? "You Won!" : "You Lost"}
                </h1>
                {/* Scores */}
                <div className="flex items-center justify-center gap-4 mb-3">
                    <div className="relative flex flex-1 flex-col items-center justify-center border border-slate-500/50 rounded-lg py-3 px-6 h-24">
                        {game.player1_total_score >= game.player2_total_score && (
                            <div className="absolute -top-4 bg-white z-1 p-1 px-2">
                                <i className="fa fa-trophy text-amber-500 text-xl animate-bounce relative top-1"></i>
                            </div>
                        )}
                        <div className={`text-2xl font-bold ${game.player1_total_score >= game.player2_total_score ? 'text-slate-900' : 'text-slate-400'}`}>
                            {game.player1_total_score?.toLocaleString()}
                        </div>
                        <div className={`text-sm font-medium ${game.player1_total_score >= game.player2_total_score ? 'text-slate-900' : 'text-slate-400'}`}>
                            {formatPlayerName(game.player1?.email)}
                        </div>
                    </div>
                    <div className="relative flex flex-1 flex-col items-center justify-center border border-slate-500/50 rounded-lg py-3 px-6 h-24">
                        {game.player2_total_score > game.player1_total_score && (
                            <div className="absolute -top-4 bg-white z-1 p-1 px-2">
                                <i className="fa fa-trophy text-amber-500 text-xl"></i>
                            </div>
                        )}
                        <div className={`text-2xl font-bold ${game.player2_total_score > game.player1_total_score ? 'text-slate-900' : 'text-slate-400'}`}>
                            {game.player2_total_score?.toLocaleString()}
                        </div>
                        <div className={`text-sm font-medium ${game.player2_total_score > game.player1_total_score ? 'text-slate-900' : 'text-slate-400'}`}>
                            {formatPlayerName(game.player2?.email)}
                        </div>
                    </div>
                </div>
                
                {/* Back to Lobby Button */}
                <div className="mt-4 flex flex-col items-center justify-center">
                    <button 
                        onClick={() => createNewGame(game.player2?.email)}
                        className="py-4 mb-2 font-medium w-full block text-center bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm"
                    >
                        Rematch
                    </button>
                    <a href="/" className="py-4 w-full block text-center bg-slate-500 hover:bg-slate-400 text-white rounded-lg text-sm">
                        Back to Lobby
                    </a>
                </div>
            </div>
        </div>
    );
};

export default WinnerDeclaration; 