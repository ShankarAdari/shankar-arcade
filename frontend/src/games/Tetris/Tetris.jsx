import { useEffect, useRef } from 'react';

export default function Tetris({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const cols = 10;
    const rows = 20;
    const blockSize = 20;

    let grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    let score = 0;

    const shapes = [
      [[1, 1, 1, 1]], // I
      [[1, 1], [1, 1]], // O
      [[0, 1, 0], [1, 1, 1]], // T
      [[1, 0, 0], [1, 1, 1]], // L
      [[0, 0, 1], [1, 1, 1]]  // J
    ];

    let piece = {
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      x: 3,
      y: 0
    };

    let dropCounter = 0;

    const collide = (p, g) => {
      for (let r = 0; r < p.shape.length; r++) {
        for (let c = 0; c < p.shape[r].length; c++) {
          if (p.shape[r][c] && (g[p.y + r] && g[p.y + r][p.x + c]) !== 0) {
            return true;
          }
        }
      }
      return false;
    };

    const merge = (p, g) => {
      p.shape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val) g[p.y + r][p.x + c] = 1;
        });
      });
    };

    const clearLines = () => {
      outer: for (let r = rows - 1; r >= 0; r--) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c] === 0) continue outer;
        }
        grid.splice(r, 1);
        grid.unshift(Array(cols).fill(0));
        score += 100;
        if (onScoreUpdate) onScoreUpdate(score);
      }
    };

    const handleKeyDown = (e) => {
      if (isPaused) return;
      if (e.key === 'ArrowLeft') {
        piece.x--;
        if (collide(piece, grid)) piece.x++;
      } else if (e.key === 'ArrowRight') {
        piece.x++;
        if (collide(piece, grid)) piece.x--;
      } else if (e.key === 'ArrowDown') {
        piece.y++;
        if (collide(piece, grid)) piece.y--;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      dropCounter++;
      if (dropCounter % 30 === 0) {
        piece.y++;
        if (collide(piece, grid)) {
          piece.y--;
          merge(piece, grid);
          clearLines();
          piece = { shape: shapes[Math.floor(Math.random() * shapes.length)], x: 3, y: 0 };
          if (collide(piece, grid)) {
            onGameOver(score);
          }
        }
      }

      // Draw
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c]) {
            ctx.fillStyle = '#00FF66';
            ctx.fillRect(c * blockSize, r * blockSize, blockSize - 1, blockSize - 1);
          }
        }
      }

      // Draw Current Piece
      ctx.fillStyle = '#FCEE09';
      piece.shape.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val) ctx.fillRect((piece.x + c) * blockSize, (piece.y + r) * blockSize, blockSize - 1, blockSize - 1);
        });
      });
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={400}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
