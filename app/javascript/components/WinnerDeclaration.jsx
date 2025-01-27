import React, { useState, useEffect } from 'react';

const WinnerDeclaration = ({ 
    game, 
    currentUser, 
    formatPlayerName, 
    createNewGame,
    isPlayer1 
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [hasAnimatedPoints, setHasAnimatedPoints] = useState(false);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setIsVisible(true);
    //     }, 1000);

    //     return () => clearTimeout(timer);
    // }, []);

    useEffect(() => {
        if (isVisible && !hasAnimatedPoints) {
            const pointsValue = game.winner_id === currentUser.id ? 
                (isPlayer1 ? game.player1_total_score : game.player2_total_score) : 0;
            
            if (pointsValue > 0) {
                const headerPoints = document.querySelector('#header .fa-chart-simple').nextElementSibling;
                const headerRect = headerPoints.getBoundingClientRect();
                
                const winnerScoreElement = document.querySelector(`.winner-scores ${game.winner_id === currentUser.id ? '.text-2xl.font-bold' : '.text-2xl'}`);
                const scoreRect = winnerScoreElement.getBoundingClientRect();

                const numberOfChunks = Math.min(7, Math.ceil(pointsValue / 40));
                const chunkSize = Math.ceil(pointsValue / numberOfChunks);
                
                for (let i = 0; i < numberOfChunks; i++) {
                    setTimeout(() => {
                        const floatingPoints = document.createElement('div');
                        floatingPoints.className = 'absolute text-lg font-bold text-green-500 pointer-events-none';
                        
                        const randomOffset = Math.random() * 20 - 10;
                        
                        floatingPoints.style.left = `${scoreRect.left - 40 + randomOffset}px`;
                        floatingPoints.style.top = `${scoreRect.top + 10}px`;
                        floatingPoints.textContent = chunkSize.toString();
                        
                        const xDiff = (headerRect.left + 10) - (scoreRect.left - 40);
                        const yDiff = (headerRect.top - 15) - (scoreRect.top + 10);
                        
                        floatingPoints.style.setProperty('--x-drift', `${xDiff}px`);
                        floatingPoints.style.setProperty('--y-drift', `${yDiff}px`);
                        floatingPoints.classList.add('animate-points-float');
                        
                        document.body.appendChild(floatingPoints);
                        
                        setTimeout(() => {
                            floatingPoints.remove();
                        }, 1500);
                    }, i * 150);
                }
                
                setHasAnimatedPoints(true);
            }
        }
    }, [isVisible, hasAnimatedPoints]);

    if (!isVisible) return null;

    // Determine which scores and names go on which side
    const leftScore = isPlayer1 ? game.player1_total_score : game.player2_total_score;
    const rightScore = isPlayer1 ? game.player2_total_score : game.player1_total_score;
    const leftName = isPlayer1 ? formatPlayerName(game.player1?.email) : formatPlayerName(game.player2?.email);
    const rightName = isPlayer1 ? formatPlayerName(game.player2?.email) : formatPlayerName(game.player1?.email);
    const isLeftWinner = isPlayer1 ? (game.winner_id === game.player1_id) : (game.winner_id === game.player2_id);

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
            </div>
        </div>
    );
};

export default WinnerDeclaration;