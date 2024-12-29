import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'

const Card = ({ card, isSelected, onClick }) => {
  const isRed = card.suit === '♥' || card.suit === '♦'
  
  return (
    <div 
      onClick={onClick}
      className={`
        w-12 h-16 rounded-lg cursor-pointer transition-all
        ${isSelected ? 'transform -translate-y-4' : ''}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        flex flex-col items-start p-2
        border border-white
        bg-gradient-to-br from-slate-200 from-10% via-white via-30% to-slate-400
        shadow-[0_0_10px_rgba(0,0,0,0.4)]
      `}
    >
      <div className={isRed ? 'text-red-500' : 'text-black'}>
        {card.value}{card.suit}
      </div>
    </div>
  )
}

const Column = ({ cards, onSelect }) => {
  // Calculate glow intensity based on number of cards
  const glowClasses = [
    'shadow-none',
    'bg-cyan-600/40 ring-1 ring-cyan-500',
    'bg-gradient-to-br from-lime-600/80 via-lime-800/30 via-35% to-lime-600/60 ring-1 ring-lime-500 bg-[length:200%_100%]',
    'bg-gradient-to-br from-amber-600/80 via-amber-800/30 via-35% to-amber-600/60 ring-1 ring-amber-500 bg-[length:200%_100%]',
    'bg-gradient-to-br from-red-600/80 via-red-800/30 via-35% to-red-600/60 ring-1 ring-red-500 bg-[length:200%_100%] shadow-[0_0_14px_5px_rgba(220,38,38,0.5)] animate-shimmer',
    'bg-gradient-to-br from-purple-600 via-purple-800/30 via-35% to-purple-600/60 ring-1 ring-purple-500 bg-[length:200%_100%] shadow-[0_0_14px_10px_rgba(168,85,247,0.5)] animate-scale-up'
  ]

  return (
    <div 
      onClick={onSelect}
      className={`
        w-20 min-h-32 bg-slate-600/60 
        rounded-lg flex flex-col -space-y-8 items-center p-2 gap-1
        transition-all duration-150
        ${glowClasses[Math.min(cards.length, 5)]}
      `}
    >
      {cards.map((card, i) => (
        <Card key={i} card={card} />
      ))}
    </div>
  )
}

const GameState = ({ game, currentUser }) => {
  const [selectedCard, setSelectedCard] = useState(null)
  const [columns, setColumns] = useState([[], [], [], []])
  const [hand, setHand] = useState([
    { suit: '♥', value: 'A' },
    { suit: '♦', value: 'K' },
    { suit: '♣', value: 'Q' },
    { suit: '♠', value: 'J' },
    { suit: '♥', value: '10' },
  ])

  const handleCardSelect = (card) => {
    setSelectedCard(card)
  }

  const handleColumnSelect = (columnIndex) => {
    if (!selectedCard) return

    // Add card to column
    setColumns(prevColumns => {
      const newColumns = [...prevColumns]
      newColumns[columnIndex] = [...newColumns[columnIndex], selectedCard]
      return newColumns
    })

    // Remove card from hand
    setHand(prevHand => prevHand.filter(c => 
      c.suit !== selectedCard.suit || c.value !== selectedCard.value
    ))

    setSelectedCard(null)
  }

  return (
    <div className="w-full flex flex-col items-center gap-8 p-4 py-8 mb-8 bg-slate-800 text-white">
      <h2 className="text-xl font-bold">Game State React Test</h2>
      {/* Columns */}
      <div className="flex gap-4">
        {columns.map((columnCards, i) => (
          <Column 
            key={i} 
            cards={columnCards}
            onSelect={() => handleColumnSelect(i)}
          />
        ))}
      </div>
      {/* Hand */}
      <div className="flex gap-4">
        {hand.map((card, i) => (
          <Card 
            key={i}
            card={card}
            isSelected={selectedCard && selectedCard.suit === card.suit && selectedCard.value === card.value}
            onClick={() => handleCardSelect(card)}
          />
        ))}
      </div>
    </div>
  )
}

document.addEventListener('turbo:load', () => {
  const container = document.getElementById('react-game-root')
  
  if (container) {
    const gameData = JSON.parse(container.dataset.game)
    const currentUser = parseInt(container.dataset.currentUser)
    
    const root = createRoot(container)
    root.render(<GameState game={gameData} currentUser={currentUser} />)
  }
})

export default GameState
