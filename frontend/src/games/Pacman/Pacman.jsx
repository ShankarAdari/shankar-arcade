import { useEffect, useRef } from 'react';

export default function Pacman({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    let lives = 3;

    const tileSize = 20;
    const map = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
      [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 2, 1, 1, 1, 1],
      [0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0],
      [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
      [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
      [1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
      [1, 2, 2, 1, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 1, 2, 2, 1],
      [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
      [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    let pacman = { x: 9, y: 10, dx: 0, dy: 0 };
    let ghosts = [
      { x: 9, y: 8, color: '#FF003C' },
      { x: 10, y: 8, color: '#00FFFF' }
    ];

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') { pacman.dx = 0; pacman.dy = -1; }
      if (e.key === 'ArrowDown' || e.key === 's') { pacman.dx = 0; pacman.dy = 1; }
      if (e.key === 'ArrowLeft' || e.key === 'a') { pacman.dx = -1; pacman.dy = 0; }
      if (e.key === 'ArrowRight' || e.key === 'd') { pacman.dx = 1; pacman.dy = 0; }
    };

    window.addEventListener('keydown', handleKeyDown);

    let frame = 0;

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      frame++;
      if (frame % 10 === 0) {
        // Move Pacman
        const nextX = pacman.x + pacman.dx;
        const nextY = pacman.y + pacman.dy;

        if (map[nextY] && map[nextY][nextX] !== 1) {
          pacman.x = nextX;
          pacman.y = nextY;

          // Eat Dot
          if (map[pacman.y][pacman.x] === 2) {
            map[pacman.y][pacman.x] = 0;
            score += 10;
            if (onScoreUpdate) onScoreUpdate(score);
          }
        }

        // Move Ghosts (random simple AI)
        ghosts.forEach(g => {
          const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
          const valid = dirs.filter(d => map[g.y + d.dy] && map[g.y + d.dy][g.x + d.dx] !== 1);
          if (valid.length > 0) {
            const move = valid[Math.floor(Math.random() * valid.length)];
            g.x += move.dx;
            g.y += move.dy;
          }

          // Hit ghost
          if (g.x === pacman.x && g.y === pacman.y) {
            lives--;
            pacman.x = 9;
            pacman.y = 10;
            if (lives <= 0) {
              onGameOver(score);
            }
          }
        });
      }

      // Render
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Map
      for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
          if (map[r][c] === 1) {
            ctx.fillStyle = 'rgba(252,238,9,0.3)';
            ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
          } else if (map[r][c] === 2) {
            ctx.fillStyle = '#00FF66';
            ctx.beginPath();
            ctx.arc(c * tileSize + tileSize / 2, r * tileSize + tileSize / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw Pacman
      ctx.fillStyle = '#FCEE09';
      ctx.beginPath();
      ctx.arc(pacman.x * tileSize + tileSize / 2, pacman.y * tileSize + tileSize / 2, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw Ghosts
      ghosts.forEach(g => {
        ctx.fillStyle = g.color;
        ctx.fillRect(g.x * tileSize + 2, g.y * tileSize + 2, tileSize - 4, tileSize - 4);
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
      width={400}
      height={400}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
