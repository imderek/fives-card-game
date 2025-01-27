import { useState, useEffect } from 'react';

export const useCountUp = (endValue, incrementsPerSecond = 20, onComplete) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        let intervalId;
        const INCREMENT = 10;
        const interval = 250 / incrementsPerSecond; // Time between each increment
        
        intervalId = setInterval(() => {
            setCount(currentCount => {
                const nextCount = Math.min(currentCount + INCREMENT, endValue);
                if (nextCount === endValue && onComplete) {
                    clearInterval(intervalId);
                    onComplete();
                }
                return nextCount;
            });
        }, interval);
        
        return () => clearInterval(intervalId);
    }, [endValue, incrementsPerSecond, onComplete]);
    
    return count;
}; 