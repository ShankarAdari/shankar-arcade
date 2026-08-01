import { useState, useEffect } from 'react';

export default function Game2048({ onGameOver, isPaused, onScoreUpdate }) {
  const [grid, setGrid] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]);
  const [score, setScore] = useState(0);

  const addTile = (g) => {
    let empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length > 0) {
      const { r, c } = empty[Math.floor(Math.random() * empty.length)];
      g[r][c] = Math.random() > 0.1 ? 2 : 4;
    }
  };

  useEffect(() => {
    let newGrid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    addTile(newGrid);
    addTile(newGrid);
    setGrid(newGrid);
  }, []);

  const slide = (row) => {
    let arr = row.filter(val => val !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        setScore(s => {
          const ns = s + arr[i];
          if (onScoreUpdate) onScoreUpdate(ns);
          return ns;
        });
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(val => val !== 0);
    while (arr.length < 4) arr.push(0);
    return arr;
  };

  const handleKeyDown = (e) => {
    if (isPaused) return;

    let temp = grid.map(r => [...r]);
    let moved = false;

    if (e.key === 'ArrowLeft' || e.key === 'a') {
      for (let r = 0; r < 4; r++) temp[r] = slide(temp[r]);
      moved = true;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
      for (let r = 0; r < 4; r++) temp[r] = slide(temp[r].reverse()).reverse();
      moved = true;
    }

    if (moved) {
      addTile(temp);
      setGrid(temp);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, isPaused]);

  return (
    <div style={{ padding: 16, background: '#1A1C23', border: '1px solid var(--accent-yellow)', borderRadius: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, width: 280, height: 280 }}>
        {grid.flatMap((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                background: val === 0 ? '#0F1015' : val === 2 ? '#252830' : '#FCEE09',
                color: val > 4 ? '#0F1015' : '#E8E8E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontFamily: 'var(--font-hud)',
                fontWeight: 700
              }}
            >
              {val > 0 ? val : ''}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
