import React from 'react';
import BoardColumn from './BoardColumn';
import { evaluatePokerHand } from '../utils/pokerHandEvaluator';

const GameBoard = ({ cards = [], selectedCard, onPlayCardToColumn, opponentName, playerName }) => {
  // Group cards by column
  const groupedCards = cards.reduce((acc, card) => {
    if (!acc[card.column]) {
      acc[card.column] = [];
    }
    acc[card.column].push(card);
    return acc;
  }, {});

  // Convert object to array of 8 columns (0-7)
  const columnArray = Array.from({ length: 8 }, (_, i) => groupedCards[i] || []);
  
  // Split into player and opponent sections
  const playerCards = columnArray.slice(0, 4);
  const opponentCards = columnArray.slice(4, 8);

  // Calculate total scores
  const calculateTotalScore = (columns) => {
    return columns.reduce((total, column) => {
      const { score } = evaluatePokerHand(column);
      return total + score;
    }, 0);
  };

  const playerScore = calculateTotalScore(playerCards);
  const opponentScore = calculateTotalScore(opponentCards);

  return (
    <div className="board w-full flex flex-col">
      {/* Player's board area */}
      <div className="mb-4 px-6 player-board grid grid-cols-4 gap-3">
        {playerCards.map((column, index) => (
          <BoardColumn
            key={index}
            cards={column}
            index={index}
            selectedCard={selectedCard}
            onPlayCardToColumn={onPlayCardToColumn}
            isPlayerColumn={true}
          />
        ))}
      </div>

      {/* Scoreboard */}
      <div className="my-3 mx-6 px-7 pt-2 pb-3 bg-white rounded-lg relative z-40">
        <div className="flex items-center justify-center gap-4 rounded-lg">
          <div className="relative flex flex-1 flex-col items-center justify-center">
            <div className="text-xl font-bold text-slate-900 animate-enter-scale">
              {playerScore.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-slate-900">{playerName}</div>
          </div>
          <div className="w-px h-10 bg-slate-300"></div>
          <div className="relative flex flex-1 flex-col items-center justify-center">
            <div className="text-xl font-bold text-slate-500">{opponentScore.toLocaleString()}</div>
            <div className="text-xs font-medium text-slate-500">{opponentName}</div>
          </div>
        </div>
      </div>

      {/* Opponent's board area */}
      <div className="mb-2 px-6 opponent-board grid grid-cols-4 gap-3">
        {opponentCards.map((column, index) => (
          <BoardColumn
            key={index}
            cards={column}
            index={index + 4}
            selectedCard={selectedCard}
            onPlayCardToColumn={onPlayCardToColumn}
            isPlayerColumn={false}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard; 