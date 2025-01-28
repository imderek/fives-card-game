import React, { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useCountUp } from '../hooks/useCountUp';
import { useAnimatedPoints } from '../hooks/useAnimatedPoints'; // Temp disabled
import { formatNumberWithMixedFonts } from '../utils/formatters';
import { useWinnerConfetti } from '../hooks/useWinnerConfetti';

const WinnerDeclaration = ({ 
    game, 
    currentUser, 
    formatPlayerName, 
    createNewGame,
    isPlayer1 
}) => {
    const [countUpComplete, setCountUpComplete] = useState(false);
    const triggerConfetti = useWinnerConfetti();
    
    const onComplete = useCallback(() => {
        setCountUpComplete(true);
        if (game.winner_id === currentUser.id) {
            triggerConfetti('.winner-scores .flex');
        }
    }, [game.winner_id, currentUser.id, triggerConfetti]);

    const animatedLeftScore = useCountUp(
        isPlayer1 ? game.player1_total_score : game.player2_total_score,
        20,
        onComplete
    );
    const animatedRightScore = useCountUp(
        isPlayer1 ? game.player2_total_score : game.player1_total_score,
        20
    );

    // Move these calculations before the callback
    const leftScore = isPlayer1 ? game.player1_total_score : game.player2_total_score;
    const rightScore = isPlayer1 ? game.player2_total_score : game.player1_total_score;
    const leftName = isPlayer1 ? formatPlayerName(game.player1?.email) : formatPlayerName(game.player2?.email);
    const rightName = isPlayer1 ? formatPlayerName(game.player2?.email) : formatPlayerName(game.player1?.email);
    const isLeftWinner = isPlayer1 ? (game.winner_id === game.player1_id) : (game.winner_id === game.player2_id);

    // useAnimatedPoints(game, currentUser, isPlayer1, countUpComplete);

    return (
        <div className="w-full flex flex-col animate-enter-scale">
            <div className="winner-scores my-1 mx-4 md:mx-0 px-3 pt-3 pb-3 bg-white rounded-lg relative z-40">
                {/* Heading - Now includes trophy */}
                <h1 className={`mt-1 mb-4 text-lg leading-7 font-medium text-slate-900 text-center flex items-center justify-center gap-2 ${countUpComplete && game.winner_id === currentUser.id ? 'animate-scale-up-win !text-xl !leading-none !font-bold' : ''}`}>
                    {countUpComplete && game.winner_id === currentUser.id && (
                        <i className="fa fa-trophy text-amber-500 text-xl"></i>
                    )}
                    {countUpComplete ? 
                        (game.winner_id === currentUser.id ? "You Won!" : "You Lost") : 
                        "Calculating scores..."
                    }
                </h1>

                {/* Score boxes - removed trophy icons */}
                <div className="flex items-center justify-center gap-4">
                    {/* Left Score */}
                    <div className={`relative flex flex-1 flex-col items-center justify-center border rounded-lg py-3 px-6 h-24 border-slate-300 ${countUpComplete && isLeftWinner ? 'animate-winner-box' : ''}`}>
                        <div className={`text-2xl ${countUpComplete && isLeftWinner ? 'font-bold' : ''} text-slate-900`}>
                            {formatNumberWithMixedFonts(animatedLeftScore)}
                        </div>
                        <div className={`text-sm font-medium text-slate-500`}>
                            {leftName}
                        </div>
                    </div>
                    {/* Right Score */}
                    <div className={`relative flex flex-1 flex-col items-center justify-center border rounded-lg py-3 px-6 h-24 border-slate-300 ${countUpComplete && !isLeftWinner ? 'animate-winner-box' : ''}`}>
                        <div className={`text-2xl ${countUpComplete && !isLeftWinner ? 'font-bold' : ''} text-slate-900`}>
                            {formatNumberWithMixedFonts(animatedRightScore)}
                        </div>
                        <div className={`text-sm font-medium text-slate-500`}>
                            {rightName}
                        </div>
                    </div>
                </div>

                {/* Back to Lobby Button */}
                {countUpComplete && (
                    <div className="mt-5 flex flex-col items-center justify-center animate-enter-scale">
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
                )}
            </div>
        </div>
    );
};

export default WinnerDeclaration;