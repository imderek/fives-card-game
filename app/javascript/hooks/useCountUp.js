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
            
            // Strong ease out that really slows down at the end
            const easeOutCubic = 1 - Math.pow(1 - progress, 4);
            const nextCount = Math.round(endValue * easeOutCubic / 10) * 10;
            
            setCount(nextCount);
            
            // Trigger completion at 80% of the animation
            if (!hasCompletedCallback && progress > 0.80 && onComplete) {
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