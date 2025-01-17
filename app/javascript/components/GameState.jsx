import React from 'react';
import Card from './Card';
import PlayerHand from './PlayerHand';
import GameBoard from './GameBoard';
import { useGameChannel } from '../hooks/useGameChannel';
import WinnerDeclaration from './WinnerDeclaration';
import { evaluatePokerHand } from '../utils/pokerHandEvaluator';
import Scoreboard from './Scoreboard';

const calculateTotalScore = (columns) => {
    return columns.reduce((total, column) => {
        const { score } = evaluatePokerHand(column);
        return total + score;
    }, 0);
};

const getBotDifficulty = (email) => {
    if (!email?.includes('bot')) return null;
    return email.split(' ')[0]; // Gets 'easy', 'medium', or 'hard'
};

const GameState = ({ game: initialGame, currentUser }) => {
    const [selectedCard, setSelectedCard] = React.useState(null);
    const [optimisticState, setOptimisticState] = React.useState(null);
    
    // Try to get stored game state on mount
    React.useEffect(() => {
        if (initialGame?.id) {
            const storedState = sessionStorage.getItem(`game_${initialGame.id}`);
            if (storedState) {
                try {
                    const parsedState = JSON.parse(storedState);
                    // Only use stored state if it's newer than initial state
                    if (parsedState.updated_at > initialGame.updated_at) {
                        setOptimisticState(parsedState);
                    }
                } catch (e) {
                    console.error('Error parsing stored game state:', e);
                }
            }
        }
        
        return () => {
            setSelectedCard(null);
            setOptimisticState(null);
        };
    }, [initialGame?.id]);

    // Use the WebSocket hook with proper cleanup
    const liveGameState = useGameChannel(initialGame?.id, currentUser);
    
    // Store latest game state whenever it changes
    React.useEffect(() => {
        if (liveGameState && initialGame?.id) {
            sessionStorage.setItem(`game_${initialGame.id}`, JSON.stringify(liveGameState));
        }
    }, [liveGameState, initialGame?.id]);
    
    // Merge initial game state with live updates and optimistic updates, preserving player info
    const game = {
        ...(optimisticState || liveGameState || initialGame),
        player1: initialGame?.player1,
        player2: initialGame?.player2,
        winner_id: (liveGameState?.winner_id || initialGame?.winner_id)
    };
    
    const isPlayer1 = currentUser?.id === game?.player1_id;
    const playerHand = isPlayer1 ? game?.player1_hand || [] : game?.player2_hand || [];
    
    // Create face-down cards for opponent's hand
    const opponentHand = (() => {
        const rawHand = isPlayer1 ? game?.player2_hand : game?.player1_hand;
        
        // If game is over, use actual cards
        if (game.winner_id && Array.isArray(rawHand)) {
            return rawHand;
        }
        
        // During gameplay, create face-down cards based on count
        const count = typeof rawHand === 'number' ? rawHand : (rawHand?.length || 0);
        return Array(count).fill().map(() => ({
            isPlaceholder: false,  // Changed to false so cards are visible
            suit: '★',  // Using a placeholder suit
            value: '?'  // Using a placeholder value
        }));
    })();
    
    // Format the opponent's email (titleize and remove domain if it's an email)
    const formatPlayerName = (email) => {
        if (!email) return 'Opponent';
        
        // Remove email domain if present
        const name = email.split('@')[0];
        
        // Titleize: capitalize each word, replace underscores/dots with spaces
        return name
            .replace(/[._]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const opponentName = formatPlayerName(isPlayer1 ? game?.player2?.email : game?.player1?.email);
    const playerName = formatPlayerName(currentUser?.email);
    const isBot = getBotDifficulty(isPlayer1 ? game?.player2?.email : game?.player1?.email) !== null;
    
    console.log('Game State Debug:', {
        currentUser,
        game,
        isPlayer1,
        opponentName,
        player1: game?.player1,
        player2: game?.player2
    });

    // When we receive a new server state, clear optimistic state if it matches
    React.useEffect(() => {
        if (liveGameState && optimisticState) {
            // Clear optimistic state since server has caught up
            setOptimisticState(null);
        }
    }, [liveGameState]);

    const canDiscard = game?.winner_id === null && 
        game?.current_turn === currentUser?.id && 
        game?.turn_phase === "play_card" && 
        ((currentUser?.id === game?.player1_id && game?.player1_discard_pile?.length === 0) || 
         (currentUser?.id === game?.player2_id && game?.player2_discard_pile?.length === 0));

    const handleDiscard = async () => {
        if (!selectedCard || !game?.id) return;
        
        try {
            const response = await fetch(`/games/${game.id}/discard_card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/vnd.turbo-stream.html',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    card: selectedCard
                })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            setSelectedCard(null);
        } catch (error) {
            console.error('Error discarding:', error);
        }
    };

    const handlePlayCard = (card) => {
        if (selectedCard?.suit === card.suit && selectedCard?.value === card.value) {
            setSelectedCard(null);
        } else {
            setSelectedCard(card);
        }
    };

    const handlePlayCardToColumn = async (columnIndex) => {
        if (!selectedCard || !game?.id) return;

        // Make optimistic update
        setOptimisticState(prevState => {
            const currentState = prevState || game;
            const handKey = isPlayer1 ? 'player1_hand' : 'player2_hand';
            
            // Filter out the played card and add placeholder at the end
            const updatedHand = [
                ...currentState[handKey].filter(card => 
                    !(card.suit === selectedCard.suit && card.value === selectedCard.value)
                ),
                { isPlaceholder: true, suit: '', value: '' }
            ];
            
            return {
                ...currentState,
                [handKey]: updatedHand,
                board_cards: [
                    ...(currentState.board_cards || []),
                    { ...selectedCard, column: columnIndex }
                ]
            };
        });

        setSelectedCard(null);

        try {
            const response = await fetch(`/games/${game.id}/play_card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/vnd.turbo-stream.html',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    card: {
                        ...selectedCard,
                        column: columnIndex
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
                setOptimisticState(null);
            }
        } catch (error) {
            console.error('Error playing card:', error);
            setOptimisticState(null);
        }
    };

    const createNewGame = async (botEmail) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
            const difficulty = botEmail?.split(' ')[0]; // Gets 'easy', 'medium', or 'hard'
            
            const response = await fetch('/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({
                    game: {
                        bot_difficulty: difficulty
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = `/games/${data.id}`;
            }
        } catch (error) {
            console.error('Error creating new game:', error);
        }
    };

    const playerColumns = game.board_cards?.filter(card => 
        isPlayer1 ? card.column < 4 : card.column >= 4
    ).reduce((acc, card) => {
        if (!acc[card.column]) acc[card.column] = [];
        acc[card.column].push(card);
        return acc;
    }, {});

    const opponentColumns = game.board_cards?.filter(card => 
        isPlayer1 ? card.column >= 4 : card.column < 4
    ).reduce((acc, card) => {
        if (!acc[card.column]) acc[card.column] = [];
        acc[card.column].push(card);
        return acc;
    }, {});

    const playerScore = calculateTotalScore(Object.values(playerColumns));
    const opponentScore = calculateTotalScore(Object.values(opponentColumns));

    if (!game || !currentUser) {
        return <div>Loading game...</div>;
    }

    return (
        <div id="react-game-state" className="w-full py-2 flex flex-col md:p-2 md:px-6 md:flex-row md:items-start md:justify-between items-center gap-2 md:gap-12">
            {/* Left Column - Scores and Hands */}
            <div className="w-full md:w-2/5 flex flex-col items-center gap-3">
                {/* Scoreboard */}
                {!game.winner_id && (
                    <Scoreboard
                        playerScore={playerScore}
                        opponentScore={opponentScore}
                        playerName={playerName}
                        opponentName={opponentName}
                        isCurrentPlayerTurn={game.current_turn === currentUser.id}
                        isBot={isBot}
                    />
                )}

                {/* Current player's hand */}
                <PlayerHand 
                    cards={playerHand.map(card => ({
                        ...card,
                        isSelected: selectedCard?.suit === card.suit && selectedCard?.value === card.value
                    }))}
                    isCurrentPlayer={game.current_turn === currentUser.id}
                    canPlay={game.turn_phase === "play_card"}
                    onPlayCard={handlePlayCard}
                    onDiscard={handleDiscard}
                    canDiscard={canDiscard}
                    handScore={game.column_scores[isPlayer1 ? "player1_hand" : "player2_hand"]}
                    winner={game.winner_id}
                    discardPile={isPlayer1 ? game.player1_discard_pile : game.player2_discard_pile}
                    opponentName={opponentName}
                />
            </div>

            {/* Right Column - Game Board and Winner Declaration */}
            <div className="w-full md:w-2/3 flex flex-col items-center gap-3">
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
                <div className="w-full">
                    {/* Opponent's hand */}
                    <div className="md:hidden mb-4">
                        <PlayerHand 
                            cards={opponentHand.map(card => ({
                                ...card,
                                isSelected: selectedCard?.suit === card.suit && selectedCard?.value === card.value
                            }))}
                            isCurrentPlayer={false}
                            canPlay={false}
                            onPlayCard={() => {}}
                            onDiscard={() => {}}
                            canDiscard={false}
                            facedown={!game.winner_id}
                            handScore={game.column_scores[isPlayer1 ? "player2_hand" : "player1_hand"]}
                            winner={game.winner_id}
                        />
                    </div>

                    <div className="w-full px-6 md:p-0">
                        <a href="/" className="block text-center border border-slate-500/50 rounded-lg mb-6 px-4 py-3 text-sm text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-white/70">
                            Back to Lobby
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameState;