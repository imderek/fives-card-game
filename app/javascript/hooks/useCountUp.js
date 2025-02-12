import { useState, useEffect } from 'react';

export const useCountUp = (endValue, incrementsPerSecond = 20, onComplete) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        let intervalId;
        const interval = 250 / incrementsPerSecond;
        let progress = 0;
        let hasCompletedCallback = false;
        
        // Scale the speed based on the size of endValue
        const durationScale = Math.max(1, endValue / 1000); // Adjust this ratio as needed
        
        intervalId = setInterval(() => {
            progress = Math.min(progress + (interval / (2000 * durationScale)), 1);
            
            // Less aggressive ease out for smoother transition
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const nextCount = progress === 1 
                ? endValue 
                : Math.min(Math.round(endValue * easeOutCubic / 10) * 10, endValue);
            
            setCount(nextCount);
            
            // Only trigger completion when we've reached the final value
            if (!hasCompletedCallback && nextCount === endValue && onComplete) {
                hasCompletedCallback = true;
                onComplete();
            }
            
            if (progress === 1) {
                clearInterval(intervalId);
            }
        }, interval);
        
        return () => clearInterval(intervalId);
    }, [endValue, incrementsPerSecond, onComplete]);
    
    return count;
}; 