import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export const useWinnerConfetti = () => {
    const triggerConfetti = useCallback((selector) => {
        // Get the position of the element
        const element = document.querySelector(selector);
        const boxRect = element.getBoundingClientRect();
        const originY = (boxRect.top + 45) / window.innerHeight;
        
        const defaults = { 
            startVelocity: 15,
            spread: 100,
            ticks: 130,
            zIndex: 100,
            gravity: 1.2,
            scalar: 0.9,
            drift: 0,
            origin: { y: originY }
        };
        
        // Single burst from two positions with 40 particles each
        confetti({
            ...defaults,
            particleCount: 40,
            origin: { x: 0.3, y: originY }
        });
        confetti({
            ...defaults,
            particleCount: 40,
            origin: { x: 0.7, y: originY }
        });
    }, []);

    return triggerConfetti;
}; 