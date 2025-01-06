import React from 'react';
import BoardColumn from './BoardColumn';
import { evaluatePokerHand } from '../utils/pokerHandEvaluator';

const GameBoard = ({ cards = [], selectedCard, onPlayCardToColumn, opponentName, playerName, winner, isPlayer1 }) => {
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

  // Determine which columns belong to which player based on the player's perspective
  const isPlayer2 = window.location.pathname.includes(playerName.toLowerCase());
  
  // Each player should see their columns at the top
  const [topColumns, bottomColumns] = isPlayer1 
    ? [playerCards, opponentCards]   // Player 1 sees columns 0-3 at top
    : [opponentCards, playerCards];  // Player 2 sees columns 4-7 at top

  return (
    <div className="board w-full flex flex-col">
      {/* Top board area */}
      <div className="mb-4 px-6 player-board grid grid-cols-4 gap-3">
        {topColumns.map((column, index) => (
          <BoardColumn
            key={index}
            cards={column}
            index={isPlayer1 ? index : index + 4}  // Player 1: 0-3, Player 2: 4-7
            selectedCard={selectedCard}
            onPlayCardToColumn={onPlayCardToColumn}
            isPlayerColumn={true}  // Top columns are always player's columns
          />
        ))}
      </div>

      {/* Scoreboard */}
      {winner ? (
        <div className="mt-1 mb-5 h-px bg-slate-600/60"></div>
      ) : (
        <div className="mb-4 mx-6 px-7 pt-2 pb-3 bg-white rounded-lg relative z-40">
            <div className="flex items-center justify-center gap-4 rounded-lg">
            <div className="relative flex flex-1 flex-col items-center justify-center">
                <div className="text-xl font-bold text-slate-900">
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
      )}

      {/* Bottom board area */}
      <div className="mb-2 px-6 opponent-board grid grid-cols-4 gap-3">
        {bottomColumns.map((column, index) => (
          <BoardColumn
            key={index}
            cards={column}
            index={isPlayer1 ? index + 4 : index}  // Player 1: 4-7, Player 2: 0-3
            selectedCard={selectedCard}
            onPlayCardToColumn={onPlayCardToColumn}
            isPlayerColumn={false}  // Bottom columns are always opponent's columns
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard; 