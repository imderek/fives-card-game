import React from 'react'
import { createRoot } from 'react-dom/client'

const GameState = ({ game, currentUser }) => {
  console.log('GameState rendering with:', { game, currentUser })
  
  return (
    <div className="w-full flex flex-col items-center gap-2 p-4 bg-slate-800 text-white">
      <h2 className="text-xl font-bold">Game State</h2>
      <div>Current Turn: {game.current_turn}</div>
      <div>Current User: {currentUser}</div>
      <div>Turn Phase: {game.turn_phase}</div>
      <pre className="mt-4 text-xs">
        {JSON.stringify(game, null, 2)}
      </pre>
    </div>
  )
}

document.addEventListener('turbo:load', () => {
  console.log('turbo:load fired')
  const container = document.getElementById('react-game-root')
  console.log('Found container:', container)
  
  if (container) {
    console.log('Container data:', {
      game: container.dataset.game,
      currentUser: container.dataset.currentUser
    })
    
    const gameData = JSON.parse(container.dataset.game)
    const currentUser = parseInt(container.dataset.currentUser)
    
    const root = createRoot(container)
    root.render(<GameState game={gameData} currentUser={currentUser} />)
  }
})

export default GameState
