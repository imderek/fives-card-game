import { useState, useEffect, useCallback } from 'react';

export const useAnimatedPoints = (game, currentUser, isPlayer1, shouldAnimate = false) => {
    const [hasAnimatedPoints, setHasAnimatedPoints] = useState(false);

    const animatePoints = useCallback(() => {
        if (!hasAnimatedPoints && shouldAnimate) {
            const pointsValue = game.winner_id === currentUser.id ? 
                (isPlayer1 ? game.player1_total_score : game.player2_total_score) : 0;
            
            if (pointsValue > 0) {
                const headerPoints = document.querySelector('#header .fa-chart-simple').nextElementSibling;
                const headerRect = headerPoints.getBoundingClientRect();
                
                const winnerScoreElement = document.querySelector(`.winner-scores ${game.winner_id === currentUser.id ? '.text-2xl.font-bold' : '.text-2xl'}`);
                const scoreRect = winnerScoreElement.getBoundingClientRect();

                // Calculate chunks of 1000s with remainder
                const baseChunkSize = 1000;
                const remainder = pointsValue % baseChunkSize;
                const numberOfFullChunks = Math.floor(pointsValue / baseChunkSize);
                const chunks = remainder > 0 ? [remainder, ...Array(numberOfFullChunks).fill(baseChunkSize)] : Array(numberOfFullChunks).fill(baseChunkSize);
                
                chunks.forEach((chunkSize, i) => {
                    setTimeout(() => {
                        const floatingPoints = document.createElement('div');
                        floatingPoints.className = 'absolute text-base font-bold text-green-500 pointer-events-none';
                        
                        const randomOffset = Math.random() * 20 - 10;
                        
                        floatingPoints.style.left = `${scoreRect.left - 35 + randomOffset}px`;
                        floatingPoints.style.top = `${scoreRect.top + 30}px`;
                        floatingPoints.textContent = `+${chunkSize}`;
                        
                        const xDiff = (headerRect.left + 10) - (scoreRect.left - 35);
                        const yDiff = (headerRect.top - 15) - (scoreRect.top + 30);
                        
                        floatingPoints.style.setProperty('--x-drift', `${xDiff}px`);
                        floatingPoints.style.setProperty('--y-drift', `${yDiff}px`);
                        floatingPoints.classList.add('animate-points-float');
                        
                        document.body.appendChild(floatingPoints);
                        
                        setTimeout(() => {
                            floatingPoints.remove();
                        }, 1500);
                    }, i * 150);
                });
                
                setHasAnimatedPoints(true);
            }
        }
    }, [game, currentUser.id, isPlayer1, hasAnimatedPoints, shouldAnimate]);

    useEffect(() => {
        if (shouldAnimate) {
            animatePoints();
        }
    }, [shouldAnimate, animatePoints]);

    return hasAnimatedPoints;
}; 