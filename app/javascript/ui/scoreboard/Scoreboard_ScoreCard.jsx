import React from "react";

export const Scoreboard_ScoreCard = ({ playerName, playerScore, isCurrentPlayerTurn }) => {
  return (
    <div
      className={`py-2 border-b-4 ${
        isCurrentPlayerTurn ? "border-amber-500" : "border-transparent"
      } relative flex flex-1 flex-col items-center justify-center`}
    >
      <div className="text-xl font-bold">
        {playerScore.toLocaleString()}
      </div>
      <div className="text-xs font-medium text-slate-200">
        {playerName}
      </div>
    </div>
  );
};
