import React, { useEffect, useState } from "react";
import PlayerHand from "../PlayerHand";
import GameBoard from "../GameBoard";
import { useGameChannel } from "../../hooks/useGameChannel";
import WinnerDeclaration from "../WinnerDeclaration";
import Scoreboard from "../Scoreboard";
import { calculateTotalScore } from "./GameState_calculateTotalScore";
import { formatPlayerName } from "./GameState_formatPlayerName";
import { createNewGame } from "./GameState_createNewGame";
import { calculateColumns } from "./GameState_calculateColumns";
import { TableTop } from "../../ui/tabletop/tabletop";

import { useGameSessionStorage } from "../../hooks/useGameSessionStorage";

const GameState = ({ game: initialGame, currentUser }) => {
  // Local component state
  const [selectedCard, setSelectedCard] = useState(null);
  const [optimisticState, setOptimisticState] = useState(null);

  // Use the custom hook to get & set the session storage data
  const [storedState, setStoredState] = useGameSessionStorage(initialGame?.id);

  // Pulling in live state from a WebSocket channel
  const liveGameState = useGameChannel(initialGame?.id, currentUser);

  // On mount, decide if we should use the storedState in place of initialGame
  useEffect(() => {
    if (initialGame?.id && storedState) {
      if (storedState.updated_at > initialGame.updated_at) {
        setOptimisticState(storedState);
      }
    }
  }, [initialGame?.id, storedState, initialGame?.updated_at]);

  // Whenever we get a new liveGameState, persist it to session storage
  useEffect(() => {
    if (liveGameState && initialGame?.id) {
      setStoredState(liveGameState);
    }
  }, [liveGameState, initialGame?.id, setStoredState]);

  // Derive the final game state
  const game = {
    ...(optimisticState || liveGameState || initialGame),
    player1: initialGame?.player1,
    player2: initialGame?.player2,
    winner_id: liveGameState?.winner_id || initialGame?.winner_id,
  };

  const isPlayer1 = currentUser?.id === game?.player1_id;
  const playerHand = isPlayer1
    ? game?.player1_hand || []
    : game?.player2_hand || [];
  const opponentHand = isPlayer1
    ? game?.player2_hand || []
    : game?.player1_hand || [];

  const opponentName = formatPlayerName(
    isPlayer1 ? game?.player2?.email : game?.player1?.email
  );
  const playerName = formatPlayerName(currentUser?.email);

  console.group("Debug: Game State");
  console.log("currentUser:", currentUser);
  console.log("game:", game);
  console.log("isPlayer1:", isPlayer1);
  console.log("player1:", game?.player1);
  console.log("player2:", game?.player2);
  console.groupEnd();

  // When we receive a new server state, clear optimistic state if it matches
  useEffect(() => {
    if (liveGameState && optimisticState) {
      // Clear optimistic state since server has caught up
      setOptimisticState(null);
    }
  }, [liveGameState]);

  const canDiscard =
    game?.winner_id === null &&
    game?.current_turn === currentUser?.id &&
    game?.turn_phase === "play_card" &&
    ((currentUser?.id === game?.player1_id &&
      game?.player1_discard_pile?.length === 0) ||
      (currentUser?.id === game?.player2_id &&
        game?.player2_discard_pile?.length === 0));

  const handleDiscard = async () => {
    if (!selectedCard || !game?.id) return;

    try {
      const response = await fetch(`/games/${game.id}/discard_card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/vnd.turbo-stream.html",
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')
            .content,
        },
        body: JSON.stringify({
          card: selectedCard,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setSelectedCard(null);
    } catch (error) {
      console.error("Error discarding:", error);
    }
  };

  const handlePlayCard = (card) => {
    if (
      selectedCard?.suit === card.suit &&
      selectedCard?.value === card.value
    ) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const handlePlayCardToColumn = async (columnIndex) => {
    if (!selectedCard || !game?.id) return;

    // Make optimistic update
    setOptimisticState((prevState) => {
      const currentState = prevState || game;
      const handKey = isPlayer1 ? "player1_hand" : "player2_hand";

      // Filter out the played card and add placeholder at the end
      const updatedHand = [
        ...currentState[handKey].filter(
          (card) =>
            !(
              card.suit === selectedCard.suit &&
              card.value === selectedCard.value
            )
        ),
        { isPlaceholder: true, suit: "", value: "" },
      ];

      return {
        ...currentState,
        [handKey]: updatedHand,
        board_cards: [
          ...(currentState.board_cards || []),
          { ...selectedCard, column: columnIndex },
        ],
      };
    });

    setSelectedCard(null);

    try {
      const response = await fetch(`/games/${game.id}/play_card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/vnd.turbo-stream.html",
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')
            .content,
        },
        body: JSON.stringify({
          card: {
            ...selectedCard,
            column: columnIndex,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        setOptimisticState(null);
      }
    } catch (error) {
      console.error("Error playing card:", error);
      setOptimisticState(null);
    }
  };

  const playerColumns = calculateColumns(game.board_cards, (card) =>
    isPlayer1 ? card.column < 4 : card.column >= 4
  );

  const opponentColumns = calculateColumns(game.board_cards, (card) =>
    isPlayer1 ? card.column >= 4 : card.column < 4
  );

  const playerScore = calculateTotalScore(Object.values(playerColumns));
  const opponentScore = calculateTotalScore(Object.values(opponentColumns));

  if (!game || !currentUser) {
    return (
      <TableTop>
        <div>Loading game...</div>
      </TableTop>
    );
  }

  return (
    <TableTop>
      {/* Scoreboard */}
      {!game.winner_id && (
        <Scoreboard
          playerScore={playerScore}
          opponentScore={opponentScore}
          playerName={playerName}
          opponentName={opponentName}
          isCurrentPlayerTurn={game.current_turn === currentUser.id}
        />
      )}

      {/* Current player's hand */}
      <PlayerHand
        cards={playerHand.map((card) => ({
          ...card,
          isSelected:
            selectedCard?.suit === card.suit &&
            selectedCard?.value === card.value,
        }))}
        isCurrentPlayer={game.current_turn === currentUser.id}
        canPlay={game.turn_phase === "play_card"}
        onPlayCard={handlePlayCard}
        onDiscard={handleDiscard}
        canDiscard={canDiscard}
        handScore={
          game.column_scores[isPlayer1 ? "player1_hand" : "player2_hand"]
        }
        winner={game.winner_id}
        discardPile={
          isPlayer1 ? game.player1_discard_pile : game.player2_discard_pile
        }
        opponentName={opponentName}
      />

      {/* Winner Declaration */}
      {(game.winner_id || liveGameState?.winner_id) && (
        <WinnerDeclaration
          game={game}
          currentUser={currentUser}
          formatPlayerName={formatPlayerName}
          createNewGame={createNewGame}
          isPlayer1={isPlayer1}
        />
      )}

      {/* GameBoard */}
      <GameBoard
        cards={game.board_cards || []}
        selectedCard={selectedCard}
        onPlayCardToColumn={handlePlayCardToColumn}
        opponentName={opponentName}
        playerName={playerName}
        winner={game.winner_id}
        isPlayer1={isPlayer1}
      />

      {/* Opponent's hand */}
      <PlayerHand
        cards={opponentHand.map((card) => ({
          ...card,
          isSelected:
            selectedCard?.suit === card.suit &&
            selectedCard?.value === card.value,
        }))}
        isCurrentPlayer={false}
        canPlay={false}
        onPlayCard={() => {}}
        onDiscard={() => {}}
        canDiscard={false}
        facedown={!game.winner_id}
        handScore={
          game.column_scores[isPlayer1 ? "player2_hand" : "player1_hand"]
        }
        winner={game.winner_id}
      />
    </TableTop>
  );
};

export default GameState;
