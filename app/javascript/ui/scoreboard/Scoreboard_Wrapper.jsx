import React from 'react';

export const Scoreboard_Wrapper = (props) => {
    return (
        <div className="mb-1 px-6 w-full">
            <div className="px-7 bg-slate-700/80 text-white rounded-lg relative z-40 w-full max-w-md">
                <div className="h-full relative flex items-center justify-center gap-4 rounded-lg">
                    {props.children}
                </div>
            </div>
        </div>
    );
};