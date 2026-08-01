import { useState, useEffect } from 'react';

const SYMBOLS = ['☢', '⚡', '🎯', '💀', '🔫', '🛸', '⚔️', '🔥'];

export default function MemoryMatch({ onGameOver, isPaused, onScoreUpdate }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const deck = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((sym, idx) => ({ id: idx, symbol: sym }));
    setCards(deck);
  }, []);

  const handleCardClick = (idx) => {
    if (isPaused || flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].symbol === cards[second].symbol) {
        const newMatched = [...matched, first, second];
        setMatched(newMatched);
        setFlipped([]);
        const newScore = score + 100;
        setScore(newScore);
        if (onScoreUpdate) onScoreUpdate(newScore);

        if (newMatched.length === cards.length) {
          const finalScore = Math.max(100, 1000 - moves * 20);
          onGameOver(finalScore);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div style={{ padding: 24, textAlign: 'center', maxWidth: 400 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx);
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              style={{
                height: 70,
                fontSize: 28,
                background: isFlipped ? '#1A1C23' : 'rgba(252,238,9,0.1)',
                border: `1px solid ${isFlipped ? 'var(--accent-yellow)' : 'rgba(252,238,9,0.3)'}`,
                color: 'var(--accent-yellow)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isFlipped ? card.symbol : '?'}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 16, fontFamily: 'var(--font-hud)', color: 'var(--accent-green)', fontSize: 12 }}>
        MOVES: {moves}
      </div>
    </div>
  );
}
