import React from 'react';
import { useParticles } from '../hooks/useParticles';

const Card = React.forwardRef(({ card, playable = false, playersHand = false, onPlay, isSelected = false, facedown = false, isAnimating = false, style }, ref) => {
  if (!card) {
    console.warn('Card component received null or undefined card prop');
    return null;
  }

  const isWild = card.value?.startsWith('W') && card.suit === '★';
  
  const getWildDisplay = () => {
    if (!isWild) return null;
    return (
      <span className={`text-purple-100 -top-0.5 relative text-sm font-semibold`}>J</span>
      // <svg 
      //   width="12"
      //   height="12"
      //   fill="currentColor" 
      //   viewBox="0 0 512 512" 
      //   id="icons" 
      //   xmlns="http://www.w3.org/2000/svg"
      //   className={`text-white ${isSelected ? '' : 'relative top-1'} left-0.5`}
      // >
      //   <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      //   <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      //   <g id="SVGRepo_iconCarrier">
      //     <path d="M208,512a24.84,24.84,0,0,1-23.34-16l-39.84-103.6a16.06,16.06,0,0,0-9.19-9.19L32,343.34a25,25,0,0,1,0-46.68l103.6-39.84a16.06,16.06,0,0,0,9.19-9.19L184.66,144a25,25,0,0,1,46.68,0l39.84,103.6a16.06,16.06,0,0,0,9.19,9.19l103,39.63A25.49,25.49,0,0,1,400,320.52a24.82,24.82,0,0,1-16,22.82l-103.6,39.84a16.06,16.06,0,0,0-9.19,9.19L231.34,496A24.84,24.84,0,0,1,208,512Zm66.85-254.84h0Z"></path>
      //     <path d="M88,176a14.67,14.67,0,0,1-13.69-9.4L57.45,122.76a7.28,7.28,0,0,0-4.21-4.21L9.4,101.69a14.67,14.67,0,0,1,0-27.38L53.24,57.45a7.31,7.31,0,0,0,4.21-4.21L74.16,9.79A15,15,0,0,1,86.23.11,14.67,14.67,0,0,1,101.69,9.4l16.86,43.84a7.31,7.31,0,0,0,4.21,4.21L166.6,74.31a14.67,14.67,0,0,1,0,27.38l-43.84,16.86a7.28,7.28,0,0,0-4.21,4.21L101.69,166.6A14.67,14.67,0,0,1,88,176Z"></path>
      //     <path d="M400,256a16,16,0,0,1-14.93-10.26l-22.84-59.37a8,8,0,0,0-4.6-4.6l-59.37-22.84a16,16,0,0,1,0-29.86l59.37-22.84a8,8,0,0,0,4.6-4.6L384.9,42.68a16.45,16.45,0,0,1,13.17-10.57,16,16,0,0,1,16.86,10.15l22.84,59.37a8,8,0,0,0,4.6,4.6l59.37,22.84a16,16,0,0,1,0,29.86l-59.37,22.84a8,8,0,0,0-4.6,4.6l-22.84,59.37A16,16,0,0,1,400,256Z"></path>
      //   </g>
      // </svg>
    );
  };

  const cardStyles = `
    relative transition-all duration-150 ease-out rounded-lg shadow-[0_0_5px_rgba(0,0,0,0.2)]
    ${card.isPlaceholder ? 'w-[3.7rem] h-[4.7rem]' :
      playable || playersHand ? 'w-[3.7rem] h-[4.7rem]' : 'w-12 h-[4rem] sm:h-[3rem] sm:text-sm'}
    ${isSelected ? isWild ? 'selected-card ring-0 !border-none translate-y-[-7px] !shadow-[-8px_3px_10px_rgba(0,0,0,0.2)]' : 'selected-card ring ring-amber-500 border border-amber-600/80 translate-y-[-7px] !shadow-[-8px_3px_10px_rgba(0,0,0,0.2)]' : ''}
    border
    ${isWild && !facedown ? 'wild-card !border-none !bg-purple-800' : 'border-white bg-gradient-to-br from-slate-200 from-10% via-white via-30% to-slate-400'}
    ${isAnimating ? 'fixed transition-all duration-300 ease-out z-[100]' : ''}
  `.trim();

  const handleClick = (e) => {
    e.stopPropagation();
    if (playable && onPlay && !card.isPlaceholder) {
      onPlay(card);
    }
  };

  const renderParticles = useParticles({
    count: 7,
    particleColor: 'bg-white',
    glowColor: 'shadow-fuchsia-200',
    active: isWild && !facedown,
    spread: true,
    customStyles: {
      top: '0.5rem',
      opacity: '0.9'
    }
  });

  return (
    <div 
      ref={ref}
      data-card-id={`${card.suit}-${card.value}`}
      className={cardStyles} 
      onClick={handleClick}
      style={{ 
        position: 'relative',
        zIndex: isSelected ? 50 : 30,
        ...style
      }}
    >
      {playable && isSelected && renderParticles()}
      
      {facedown ? (
        <div className="w-full h-full flex items-center justify-center">
          <svg width="30" height="30" viewBox="0 0 30 30" className="text-slate-500/70">
            <circle cx="5" cy="9" r="3" fill="currentColor"/>
            <circle cx="15" cy="9" r="3" fill="currentColor"/>
            <circle cx="25" cy="9" r="3" fill="currentColor"/>
            <circle cx="5" cy="21" r="3" fill="currentColor"/>
            <circle cx="15" cy="21" r="3" fill="currentColor"/>
            <circle cx="25" cy="21" r="3" fill="currentColor"/>
          </svg>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-start p-0.5 px-1.5">
          <div className={`${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'} text-md`}>
            {isWild ? getWildDisplay() : `${card.value}${card.suit}`}
          </div>
        </div>
      )}
    </div>
  );
});

export default Card; 