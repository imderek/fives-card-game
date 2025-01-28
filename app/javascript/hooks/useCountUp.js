import { useState, useEffect } from 'react';

export const useCountUp = (endValue, incrementsPerSecond = 20, onComplete) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        let intervalId;
        const interval = 250 / incrementsPerSecond;
        let progress = 0;
        
        intervalId = setInterval(() => {
            progress = Math.min(progress + (interval / 3000), 1);
            
            // Strong ease out that really slows down at the end
            const easeOutCubic = 1 - Math.pow(1 - progress, 4); // Increased power for stronger end slowdown
            const nextCount = Math.round(endValue * easeOutCubic / 10) * 10;
            
            setCount(nextCount);
            
            if (progress === 1) {
                clearInterval(intervalId);
                if (onComplete) onComplete();
            }
        }, interval);
        
        return () => clearInterval(intervalId);
    }, [endValue, incrementsPerSecond, onComplete]);
    
    return count;
}; 