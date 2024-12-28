import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'

const Card = ({ card, isSelected, onClick }) => {
  const isRed = card.suit === '♥' || card.suit === '♦'
  
  return (
    <div 
      onClick={onClick}
      className={`
        w-16 h-24 rounded-lg cursor-pointer transition-all
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
    'shadow-none',                                          // 0 cards
    'shadow-[0_0_15px_10px_rgba(59,130,246,0.4)]',             // 1 card
    'shadow-[0_0_30px_10px_rgba(59,130,246,0.6)]',             // 2 cards
    'shadow-[0_0_45px_10px_rgba(59,130,246,0.8)]',             // 3 cards
    'shadow-[0_0_60px_10px_rgba(59,130,246,1)]',             // 4 cards
    'shadow-[0_0_75px_10px_rgba(59,130,246,1)]'              // 5 cards
  ]

  return (
    <div 
      onClick={onSelect}
      className={`
        w-16 min-h-32 border-2 border-dashed border-slate-600 
        rounded-lg flex flex-col -space-y-12 items-center p-2 gap-1
        transition-shadow duration-300
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
    <div className="w-full flex flex-col items-center gap-8 p-4 bg-slate-800 text-white">
      <h2 className="text-xl font-bold">Game State React Test</h2>
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
