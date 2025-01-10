import React from "react";

export const Scoreboard_TurnIndicator = ({ isCurrentPlayerTurn }) => {
  return (
    <div
      className={`hidden absolute ${
        isCurrentPlayerTurn ? "left-2" : "right-2"
      } top-1/2 -translate-y-1/2 flex flex-1 flex-col items-center justify-center`}
    >
      <div className="absolute w-3 h-3">
        <div className="w-full h-full rounded-full bg-amber-500 animate-ping"></div>
      </div>
      <div className="absolute w-2 h-2">
        <div className="w-full h-full rounded-full bg-amber-500 animate-pulse"></div>
      </div>
    </div>
  );
};
