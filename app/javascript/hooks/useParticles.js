import React from 'react';

export const useParticles = ({ 
  count = 7,
  isHighTier = false,
  particleColor = 'bg-purple-300',
  glowColor = 'shadow-purple-400',
  active = false,
  customStyles = {},
  spread = false,
  startingHeight = '0.25rem'
}) => {
  const renderParticles = React.useCallback(() => {
    if (!active) return null;
    
    const defaultStyles = {
      left: '50%',
      top: startingHeight,
      transform: 'translateX(-50%)'
    };
    
    const finalStyles = { ...defaultStyles, ...customStyles };
    
    return (
      <>
        {[...Array(count)].map((_, i) => {
          const segmentWidth = spread ? 75 / (count - 1) : 50 / (count - 1);
          const segmentStart = spread ? 12.5 + (segmentWidth * i) : 25 + (segmentWidth * i);
          
          return (
            <div
              key={`particle-${i}`}
              className={`absolute w-[0.2rem] h-[0.2rem] rounded-full ${particleColor} ${glowColor} animate-particle-float z-20 shadow-[0_0_3px_1px_rgba(168,85,247,0.9)]`}
              style={{
                ...finalStyles,
                left: `${segmentStart + (Math.random() * (spread ? segmentWidth : segmentWidth/2))}%`,
                '--x-drift': `${(Math.random() * 20 - 10)}px`,
                animationDelay: `-${Math.random() * 2000}ms`,
                transform: 'none'
              }}
            />
          );
        })}
      </>
    );
  }, [count, isHighTier, particleColor, glowColor, active, customStyles, spread, startingHeight]);

  return renderParticles;
}; 