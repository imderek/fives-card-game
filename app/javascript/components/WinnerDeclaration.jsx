import React, { useState, useCallback } from 'react';
import { useCountUp } from '../hooks/useCountUp';
import { useAnimatedPoints } from '../hooks/useAnimatedPoints';
import { formatNumberWithMixedFonts } from '../utils/formatters';

const WinnerDeclaration = ({ 
    game, 
    currentUser, 
    formatPlayerName, 
    createNewGame,
    isPlayer1 
}) => {
    const [countUpComplete, setCountUpComplete] = useState(false);
    
    const onCountUpComplete = useCallback(() => {
        setCountUpComplete(true);
    }, []);

    // Determine which scores and names go on which side
    const leftScore = isPlayer1 ? game.player1_total_score : game.player2_total_score;
    const rightScore = isPlayer1 ? game.player2_total_score : game.player1_total_score;
    const leftName = isPlayer1 ? formatPlayerName(game.player1?.email) : formatPlayerName(game.player2?.email);
    const rightName = isPlayer1 ? formatPlayerName(game.player2?.email) : formatPlayerName(game.player1?.email);
    const isLeftWinner = isPlayer1 ? (game.winner_id === game.player1_id) : (game.winner_id === game.player2_id);

    const animatedLeftScore = useCountUp(leftScore || 0, 1875, onCountUpComplete);
    const animatedRightScore = useCountUp(rightScore || 0, 1875);
    
    useAnimatedPoints(game, currentUser, isPlayer1, countUpComplete);

    return (
        <div className="w-full flex flex-col animate-enter-scale">
            <div className="winner-scores my-1 mx-4 md:mx-0 px-3 pt-2 pb-3 bg-white rounded-lg relative z-40">
                {/* Heading */}
                <h1 className="mt-1 mb-4 text-xl font-bold text-slate-900 text-center">
                    {game.winner_id === currentUser.id ? "You Won!" : "You Lost"}
                </h1>

                {/* Scores */}
                <div className="flex items-center justify-center gap-4 mb-3">
                    {/* Left Score */}
                    <div className={`relative flex flex-1 flex-col items-center justify-center ${isLeftWinner ? 'border-amber-500 shadow-2xl' : 'border-slate-300'} border rounded-lg py-3 px-6 h-24`}>
                        {isLeftWinner && (
                            <div className="absolute -top-4 bg-white z-1 p-1 px-2">
                                <i className="fa fa-trophy text-amber-500 text-xl animate-bounce relative top-1"></i>
                            </div>
                        )}
                        <div className={`text-2xl ${isLeftWinner ? 'font-bold text-slate-900' : 'text-slate-900'}`}>
                            {formatNumberWithMixedFonts(animatedLeftScore)}
                        </div>
                        <div className={`text-sm font-medium ${isLeftWinner ? 'text-slate-900' : 'text-slate-900'}`}>
                            {leftName}
                        </div>
                    </div>
                    {/* Right Score */}
                    <div className={`relative flex flex-1 flex-col items-center justify-center ${!isLeftWinner ? 'border-amber-500 shadow-2xl' : 'border-slate-300'} border rounded-lg py-3 px-6 h-24`}>
                        {!isLeftWinner && (
                            <div className="absolute -top-4 bg-white z-1 p-1 px-2">
                                <i className="fa fa-trophy text-amber-500 text-xl"></i>
                            </div>
                        )}
                        <div className={`text-2xl ${!isLeftWinner ? 'font-bold text-slate-900' : 'text-slate-900'}`}>
                            {formatNumberWithMixedFonts(animatedRightScore)}
                        </div>
                        <div className={`text-sm font-medium ${!isLeftWinner ? 'text-slate-900' : 'text-slate-900'}`}>
                            {rightName}
                        </div>
                    </div>
                </div>

                {/* Back to Lobby Button */}
                <div className="mt-4 flex flex-col items-center justify-center">
                    {game.game_type === 'bot' && (
                        <button 
                            onClick={() => createNewGame(isPlayer1 ? game.player2?.email : game.player1?.email)}
                            className="mb-2 btn btn-primary"
                        >
                            Rematch
                        </button>
                    )}
                    <a href="/" className="btn btn-secondary">
                        Back to Lobby
                    </a>
                </div>
            </div>
        </div>
    );
};

export default WinnerDeclaration;