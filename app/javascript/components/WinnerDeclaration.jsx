import React, { useState, useEffect } from 'react';

const WinnerDeclaration = ({ 
    game, 
    currentUser, 
    formatPlayerName, 
    createNewGame,
    isPlayer1 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isBetting, setIsBetting] = useState(false);
    const [betAmount, setBetAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        console.log("Game status changed:", game.status);
        console.log("Game betting enabled:", game.betting_enabled);
        setIsBetting(game.betting_enabled);
    }, [game.status]);

    const handleBetSubmit = async () => {
        try {
            setIsSubmitting(true);
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
        } catch (error) {
            console.error('Error submitting bet:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isVisible) {
        console.log("WinnerDeclaration not visible yet");
        return null;
    }

    console.log("Rendering WinnerDeclaration:", {
        status: game.status,
        isBetting,
        betting_enabled: game.betting_enabled
    });

    // If in betting state, show betting UI
    if (game.status === "betting") {
        console.log("Showing betting UI");
        return (
            <div className="w-full flex flex-col animate-enter-scale">
                <div className="my-1 mx-6 md:mx-0 px-3 pt-2 pb-3 bg-white rounded-lg relative z-40">
                    <h1 className="mt-1 mb-4 text-xl font-bold text-slate-900 text-center">
                        Place Your Bet
                    </h1>
                    
                    <div className="flex flex-col items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={betAmount}
                                onChange={(e) => setBetAmount(Number(e.target.value))}
                                className="form-input bg-slate-200 text-slate-900 border-0 rounded-lg focus:ring-slate-400 block w-full p-2.5 placeholder-slate-400 focus:ring-slate-500 focus:ring-2"
                                placeholder="Bet amount"
                                disabled={isSubmitting}
                            />
                            <span className="text-sm text-gray-500">coins</span>
                        </div>
                        
                        <button 
                            onClick={handleBetSubmit}
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Bet'}
                        </button>
                    </div>
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