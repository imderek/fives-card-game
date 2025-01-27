import { useState, useEffect } from 'react';

export const useCountUp = (endValue, duration = 1875) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        let startTime;
        let animationFrame;
        
        const easeOut = t => 1 - Math.pow(1 - t, 3); // Cubic ease out function
        
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = (currentTime - startTime) / duration;
            
            if (progress < 1) {
                const easedProgress = easeOut(progress);
                setCount(Math.floor(endValue * easedProgress / 10) * 10);
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(endValue);
            }
        };
        
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [endValue, duration]);
    
    return count;
}; 