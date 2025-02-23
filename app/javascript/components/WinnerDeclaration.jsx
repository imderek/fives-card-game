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
        game.winner_id === (isPlayer1 ? game.player1_id : game.player2_id) ? onComplete : undefined
    );
    const animatedRightScore = useCountUp(
        isPlayer1 ? game.player2_total_score : game.player1_total_score,
        20,
        game.winner_id === (isPlayer1 ? game.player2_id : game.player1_id) ? onComplete : undefined
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
                <h1 className={`mt-1 ${countUpComplete ? 'mb-4' : 'mb-1'} text-lg leading-7 font-medium text-slate-900 text-center flex items-center justify-center gap-2 ${countUpComplete && game.winner_id === currentUser.id ? 'animate-scale-up-win !text-xl !leading-none !font-bold' : ''}`}>
                    {countUpComplete && game.winner_id === currentUser.id && (
                        <i className="fa fa-trophy text-amber-500 text-xl"></i>
                    )}
                    {countUpComplete ? 
                        (game.winner_id === currentUser.id ? "You Won!" : "You Lost") : 
                        <div className="font-bold">
                            <div role="status">
                                <svg aria-hidden="true" className="inline mr-2 w-10 h-10 animate-spin text-slate-300 fill-amber-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                </svg>
                                <span className="sr-only">Loading...</span>
                                <span className="block mt-2">Calculating scores</span>
                            </div>
                        </div>
                    }
                </h1>

                {/* Score boxes - removed trophy icons */}
                <div className="flex items-center justify-center gap-4">
                    {/* Left Score */}
                    <div className={`relative flex flex-1 flex-col items-center justify-center ${countUpComplete ? 'border border-slate-300 h-[5.5rem]' : 'h-[5rem]'} rounded-lg px-6  ${countUpComplete && isLeftWinner ? 'animate-winner-box' : ''}`}>
                        <div className={`mb-0.5 text-2xl ${countUpComplete && isLeftWinner ? 'font-bold' : ''} text-slate-900`}>
                            {formatNumberWithMixedFonts(animatedLeftScore)}
                        </div>
                        <div className={`text-sm font-normal text-slate-500`}>
                            {leftName}
                        </div>
                    </div>
                    {/* Right Score */}
                    <div className={`relative flex flex-1 flex-col items-center justify-center ${countUpComplete ? 'border border-slate-300 h-[5.5rem]' : 'h-[5rem]'} rounded-lg px-6  ${countUpComplete && !isLeftWinner ? 'animate-winner-box' : ''}`}>
                        <div className={`mb-0.5 text-2xl ${countUpComplete && !isLeftWinner ? 'font-bold' : ''} text-slate-900`}>
                            {formatNumberWithMixedFonts(animatedRightScore)}
                        </div>
                        <div className={`text-sm font-normal text-slate-500`}>
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