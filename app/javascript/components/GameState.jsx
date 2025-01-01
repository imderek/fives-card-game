import React from 'react';
import Card from './Card';
import PlayerHand from './PlayerHand';
import GameBoard from './GameBoard';
import PlayerInfo from './PlayerInfo';
import { useGameChannel } from '../hooks/useGameChannel';

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
        player2: initialGame?.player2
    };
    
    const isPlayer1 = currentUser?.id === game?.player1_id;
    const playerHand = isPlayer1 ? game?.player1_hand || [] : game?.player2_hand || [];
    const opponentHand = isPlayer1 ? game?.player2_hand || [] : game?.player1_hand || [];
    
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
    
    // console.log('Game State Debug:', {
    //     currentUser,
    //     game,
    //     isPlayer1,
    //     opponentName,
    //     player1: game?.player1,
    //     player2: game?.player2
    // });

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

    if (!game || !currentUser) {
        return <div>Loading game...</div>;
    }

    return (
        <div id="react-game-state" className="w-full py-3 flex flex-col items-center gap-4">
            {/* Player's hand and discard action */}
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
            />

            {/* Winner Declaration */}
            {game.winner_id && (
                <div className="w-full flex flex-col animate-enter-scale">
                    <div className="my-1 mb-2 mx-6 px-3 pt-2 pb-3 bg-white rounded-lg relative z-40">
                        {/* Heading */}
                        <h1 className="mt-1 mb-4 text-xl font-bold text-slate-900 text-center">
                            {game.winner_id === currentUser.id ? "You Won!" : "You Lost"}
                        </h1>
                        {/* Scores */}
                        <div className="flex items-center justify-center gap-4 mb-3">
                            <div className="relative flex flex-1 flex-col items-center justify-center border border-slate-500/50 rounded-lg py-3 px-6 h-24">
                                {game.player1_total_score >= game.player2_total_score && (
                                    <div className="absolute -top-4 bg-white z-1 p-1 px-2">
                                        <i className="fa fa-trophy text-amber-500 text-xl animate-bounce relative top-1"></i>
                                    </div>
                                )}
                                <div className={`text-2xl font-bold ${game.player1_total_score >= game.player2_total_score ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {game.player1_total_score?.toLocaleString()}
                                </div>
                                <div className={`text-sm font-medium ${game.player1_total_score >= game.player2_total_score ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {formatPlayerName(game.player1?.email)}
                                </div>
                            </div>
                            <div className="relative flex flex-1 flex-col items-center justify-center border border-slate-500/50 rounded-lg py-3 px-6 h-24">
                                {game.player2_total_score > game.player1_total_score && (
                                    <div className="absolute -top-4 bg-white z-1 p-1 px-2">
                                        <i className="fa fa-trophy text-amber-500 text-xl"></i>
                                    </div>
                                )}
                                <div className={`text-2xl font-bold ${game.player2_total_score > game.player1_total_score ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {game.player2_total_score?.toLocaleString()}
                                </div>
                                <div className={`text-sm font-medium ${game.player2_total_score > game.player1_total_score ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {formatPlayerName(game.player2?.email)}
                                </div>
                            </div>
                        </div>
                        
                        {/* Back to Lobby Button */}
                        <div className="mt-4 flex flex-col items-center justify-center">
                            <a href="/" className="py-4 w-full block text-center bg-slate-500 text-white rounded-lg text-sm">
                                Back to Lobby
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* GameBoard with formatted names */}
            <GameBoard
                cards={game.board_cards || []}
                selectedCard={selectedCard}
                onPlayCardToColumn={handlePlayCardToColumn}
                opponentName={opponentName}
                playerName={playerName}
                winner={game.winner_id}
            />

            {/* Opponent's hand */}
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
            />
            <div className="w-full px-6">
                <a href="/" className="block text-center border border-slate-500/50 rounded-lg mb-10 px-4 py-3 text-sm text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-white/70">
                    Back to Lobby
                </a>
            </div>
        </div>
    );
};

export default GameState;