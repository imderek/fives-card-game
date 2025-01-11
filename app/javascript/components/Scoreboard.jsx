import React from "react";
import { Scoreboard_Wrapper } from "../ui/scoreboard/Scoreboard_Wrapper";
import { Scoreboard_TurnIndicator } from "../ui/scoreboard/Scoreboard_TurnIndicator";
import { Scoreboard_ScoreCard } from "../ui/scoreboard/Scoreboard_ScoreCard";

export const Scoreboard = ({
  playerScore,
  opponentScore,
  playerName,
  opponentName,
  isCurrentPlayerTurn,
}) => {
  return (
    <Scoreboard_Wrapper>
        <Scoreboard_TurnIndicator isCurrentPlayerTurn={isCurrentPlayerTurn} />
        <Scoreboard_ScoreCard playerName={playerName} playerScore={playerScore}/>
        <div className="w-px h-12 bg-slate-500/50"></div>
        <Scoreboard_ScoreCard playerName={opponentName} playerScore={opponentScore} />
    </Scoreboard_Wrapper>
  );
};
