import { useEffect, useRef } from 'react';

export default function CyberFrogger({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const grid = 30;
    let frog = { x: canvas.width / 2 - grid / 2, y: canvas.height - grid };
    let score = 0;

    let cars = [
      { y: canvas.height - grid * 3, speed: 2, w: 40 },
      { y: canvas.height - grid * 4, speed: -3, w: 50 },
      { y: canvas.height - grid * 5, speed: 4, w: 40 },
      { y: canvas.height - grid * 7, speed: -2, w: 60 },
      { y: canvas.height - grid * 8, speed: 3.5, w: 45 }
    ].map(c => ({ ...c, x: Math.random() * canvas.width }));

    const handleKeyDown = (e) => {
      if (isPaused) return;
      if (e.key === 'ArrowUp' || e.key === 'w') {
        frog.y -= grid;
        score += 10;
        if (onScoreUpdate) onScoreUpdate(score);
      }
      if (e.key === 'ArrowDown' || e.key === 's') frog.y += grid;
      if (e.key === 'ArrowLeft' || e.key === 'a') frog.x -= grid;
      if (e.key === 'ArrowRight' || e.key === 'd') frog.x += grid;

      frog.x = Math.max(0, Math.min(canvas.width - grid, frog.x));
      frog.y = Math.max(0, Math.min(canvas.height - grid, frog.y));

      // Reached Goal (Top)
      if (frog.y <= 0) {
        score += 200;
        if (onScoreUpdate) onScoreUpdate(score);
        frog.y = canvas.height - grid;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      // Update Cars
      cars.forEach(c => {
        c.x += c.speed;
        if (c.speed > 0 && c.x > canvas.width) c.x = -c.w;
        if (c.speed < 0 && c.x < -c.w) c.x = canvas.width;

        // Collision
        if (
          frog.x < c.x + c.w &&
          frog.x + grid > c.x &&
          frog.y < c.y + grid &&
          frog.y + grid > c.y
        ) {
          onGameOver(score);
        }
      });

      // Render
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Safe Zones
      ctx.fillStyle = 'rgba(0, 255, 102, 0.15)';
      ctx.fillRect(0, canvas.height - grid, canvas.width, grid);
      ctx.fillRect(0, canvas.height - grid * 6, canvas.width, grid);
      ctx.fillRect(0, 0, canvas.width, grid);

      // Cars
      cars.forEach(c => {
        ctx.fillStyle = '#FF003C';
        ctx.fillRect(c.x, c.y, c.w, grid - 4);
      });

      // Frog
      ctx.fillStyle = '#FCEE09';
      ctx.fillRect(frog.x + 2, frog.y + 2, grid - 4, grid - 4);
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
      width={390}
      height={390}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
