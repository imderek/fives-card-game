import React, { useEffect } from "react";

export function useGameSessionStorage(gameId, initialState) {
  const [storedState, setStoredState] = React.useState(() => {
    if (!gameId) return null;
    const saved = sessionStorage.getItem(`game_${gameId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Parsing error:", error);
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (storedState && gameId) {
      sessionStorage.setItem(`game_${gameId}`, JSON.stringify(storedState));
    }
  }, [storedState, gameId]);

  return [storedState, setStoredState];
}
