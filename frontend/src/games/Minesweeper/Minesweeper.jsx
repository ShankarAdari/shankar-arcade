import { useState, useEffect } from 'react';

export default function Minesweeper({ onGameOver, isPaused, onScoreUpdate }) {
  const rows = 8;
  const cols = 8;
  const minesCount = 10;

  const [grid, setGrid] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    // Initialize Grid
    let arr = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        isMine: false,
        revealed: false,
        count: 0
      }))
    );

    // Place Mines
    let placed = 0;
    while (placed < minesCount) {
      let r = Math.floor(Math.random() * rows);
      let c = Math.floor(Math.random() * cols);
      if (!arr[r][c].isMine) {
        arr[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate numbers
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!arr[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (arr[r + dr] && arr[r + dr][c + dc]?.isMine) count++;
            }
          }
          arr[r][c].count = count;
        }
      }
    }

    setGrid(arr);
  }, []);

  const handleClick = (r, c) => {
    if (isPaused || grid[r][c].revealed) return;

    let temp = grid.map(row => row.map(cell => ({ ...cell })));

    if (temp[r][c].isMine) {
      // Hit mine -> Game Over
      onGameOver(revealedCount * 50);
      return;
    }

    // Reveal cell
    const reveal = (row, col) => {
      if (!temp[row] || !temp[row][col] || temp[row][col].revealed) return;
      temp[row][col].revealed = true;
      if (temp[row][col].count === 0 && !temp[row][col].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(row + dr, col + dc);
          }
        }
      }
    };

    reveal(r, c);
    setGrid(temp);

    let count = 0;
    temp.forEach(row => row.forEach(cell => { if (cell.revealed) count++; }));
    setRevealedCount(count);

    const score = count * 50;
    if (onScoreUpdate) onScoreUpdate(score);

    // Win check
    if (count === rows * cols - minesCount) {
      onGameOver(score + 500);
    }
  };

  return (
    <div style={{ padding: 16, background: '#1A1C23', border: '1px solid var(--accent-yellow)', borderRadius: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6, width: 320, height: 320 }}>
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleClick(r, c)}
              style={{
                background: cell.revealed ? (cell.isMine ? '#FF003C' : '#0F1015') : 'rgba(252,238,9,0.1)',
                border: `1px solid ${cell.revealed ? 'rgba(252,238,9,0.2)' : 'var(--accent-yellow)'}`,
                color: cell.count === 1 ? '#00FFFF' : cell.count === 2 ? '#00FF66' : '#FF003C',
                fontFamily: 'var(--font-hud)',
                fontSize: 16,
                fontWeight: 700,
                cursor: cell.revealed ? 'default' : 'pointer'
              }}
            >
              {cell.revealed ? (cell.isMine ? '💣' : cell.count > 0 ? cell.count : '') : ''}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
