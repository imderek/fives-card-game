import React, { useState, useEffect } from 'react';

const WinnerDeclaration = ({ 
    game, 
    currentUser, 
    formatPlayerName, 
    createNewGame,
    isPlayer1 
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isBetting, setIsBetting] = useState(false);
    const [betAmount, setBetAmount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasBetCompleted, setHasBetCompleted] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        console.log("Game status changed:", game.status);
        console.log("Game betting enabled:", game.betting_enabled);
        setIsBetting(game.betting_enabled);
    }, [game.status]);

    useEffect(() => {
        if (game.status === 'completed' && hasBetCompleted) {
            setIsTransitioning(true);
            setIsVisible(false);
            const timer = setTimeout(() => {
                setIsVisible(true);
                setIsTransitioning(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [game.status, hasBetCompleted]);

    const handleBetSubmit = async () => {
        // Start transition immediately
        setIsTransitioning(true);
        setIsVisible(false);
        setIsSubmitting(true);

        try {
            const response = await fetch(`/games/${game.id}/submit_bet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content,
                },
                body: JSON.stringify({ bet_amount: betAmount })
            });

            if (!response.ok) {
                throw new Error('Failed to submit bet');
            }
            setHasBetCompleted(true);
        } catch (error) {
            console.error('Error submitting bet:', error);
            // Reset transition state if there's an error
            setIsTransitioning(false);
            setIsVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isVisible && !isTransitioning) {
        return null;
    }

    // console.log("Rendering WinnerDeclaration:", {
    //     status: game.status,
    //     isBetting,
    //     betting_enabled: game.betting_enabled,
    //     isTransitioning,
    //     isVisible,
    //     hasBetCompleted
    // });

    // If in betting state or transitioning, show betting UI
    if (game.status === "betting" || isTransitioning) {
        return (
            <div className="w-full flex flex-col animate-enter-scale">
                <div className="my-1 mx-6 md:mx-0 p-3 pt-6 bg-white rounded-lg relative z-40">
                    <h1 className="mb-1 text-lg font-normal text-black text-center">
                        {isTransitioning ? (
                            <div className="mb-3 flex flex-row items-center justify-center gap-2">
                                <i className="fa fa-spinner fa-spin"></i>
                                <span>Betting...</span>
                            </div>
                        ) : (
                            "Time to bet!"
                        )}
                    </h1>
                    
                    {game.status === "betting" && (
                        <div className="flex flex-col items-center">
                            <div className="px-4 mb-1 flex items-center justify-center gap-2 text-xl">
                                <button 
                                    onClick={() => setBetAmount(prev => Math.max(0, prev - 100))}
                                    className="w-12 h-12 text-slate-500 hover:text-slate-600 bg-slate-200 rounded-lg"
                                    disabled={!isVisible}
                                >
                                    <i className="fa fa-minus"></i>
                                </button>
                                <div className="flex items-center w-1/2">
                                    {/* <span className="text-green-500"><i className="fa fa-money-bill-wave"></i></span> */}
                                    <input
                                        type="text"
                                        value={betAmount}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            setBetAmount(Number(value) || 0);
                                        }}
                                        className="form-input p-0 w-full text-black font-bold text-4xl text-center border-0 rounded-lg focus:ring-slate-200 placeholder-slate-200 focus:ring-slate-500 focus:ring-2"
                                        placeholder="0"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <button 
                                    onClick={() => setBetAmount(prev => prev + 100)}
                                    className="w-12 h-12 text-slate-500 hover:text-slate-600 bg-slate-200 rounded-lg"
                                >
                                    <i className="fa fa-plus"></i>
                                </button>
                            </div>
                            
                            <div className="text-slate-500">
                                Pot size: ${(betAmount * 2).toLocaleString()}
                            </div>

                            <button 
                                onClick={handleBetSubmit}
                                className="mt-6 btn btn-primary px-8"
                                disabled={isSubmitting}
                            >
                                Place Bet
                            </button>
                            <button 
                                onClick={() => {
                                    setBetAmount(0);
                                    handleBetSubmit();
                                }}
                                className="mt-2 btn btn-outline text-slate-400 border-slate-400"
                                disabled={isSubmitting}
                            >
                                Skip Betting
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Determine which scores and names go on which side
    const leftScore = isPlayer1 ? game.player1_total_score : game.player2_total_score;
    const rightScore = isPlayer1 ? game.player2_total_score : game.player1_total_score;
    const leftName = isPlayer1 ? formatPlayerName(game.player1?.email) : formatPlayerName(game.player2?.email);
    const rightName = isPlayer1 ? formatPlayerName(game.player2?.email) : formatPlayerName(game.player1?.email);
    const isLeftWinner = isPlayer1 ? (game.winner_id === game.player1_id) : (game.winner_id === game.player2_id);

    return (
        <div className="w-full flex flex-col animate-enter-scale">
            <div className="my-1 mx-6 md:mx-0 px-3 pt-2 pb-3 bg-white rounded-lg relative z-40">
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
                            {leftScore?.toLocaleString()}
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
                            {rightScore?.toLocaleString()}
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