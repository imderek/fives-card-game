import React from 'react';

export const formatNumberWithMixedFonts = (number) => {
    return number.toLocaleString().split('').map((char, i) => (
        /\d/.test(char) ? 
            <span key={i} className="font-mono">{char}</span> : 
            <span key={i}>{char}</span>
    ));
}; 