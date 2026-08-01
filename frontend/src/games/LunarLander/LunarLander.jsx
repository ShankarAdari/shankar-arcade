import { useEffect, useRef } from 'react';

export default function LunarLander({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let lander = { x: canvas.width / 2, y: 40, vx: 0, vy: 0, fuel: 100, angle: 0 };
    const gravity = 0.03;
    let score = 0;

    const pad = { x: canvas.width / 2 - 30, y: canvas.height - 20, w: 60, h: 8 };

    let keys = {};
    const handleKeyDown = (e) => { keys[e.key] = true; };
    const handleKeyUp = (e) => { keys[e.key] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      // Apply Gravity
      lander.vy += gravity;

      // Controls
      if ((keys['ArrowUp'] || keys['w']) && lander.fuel > 0) {
        lander.vy -= 0.08;
        lander.fuel -= 0.4;
      }
      if (keys['ArrowLeft'] || keys['a']) lander.vx -= 0.03;
      if (keys['ArrowRight'] || keys['d']) lander.vx += 0.03;

      lander.x += lander.vx;
      lander.y += lander.vy;

      // Check Landing / Crash
      if (lander.y + 10 >= pad.y) {
        if (
          lander.x >= pad.x &&
          lander.x <= pad.x + pad.w &&
          Math.abs(lander.vy) < 1.2 &&
          Math.abs(lander.vx) < 0.8
        ) {
          score = Math.floor(1000 + lander.fuel * 10);
          if (onScoreUpdate) onScoreUpdate(score);
          onGameOver(score);
        } else {
          onGameOver(0);
        }
      }

      // Out of Bounds
      if (lander.x < 0 || lander.x > canvas.width || lander.y > canvas.height) {
        onGameOver(0);
      }

      // Render
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Pad
      ctx.fillStyle = '#00FF66';
      ctx.fillRect(pad.x, pad.y, pad.w, pad.h);

      // Draw Lander
      ctx.fillStyle = '#FCEE09';
      ctx.beginPath();
      ctx.arc(lander.x, lander.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Thrust flame
      if ((keys['ArrowUp'] || keys['w']) && lander.fuel > 0) {
        ctx.fillStyle = '#FF003C';
        ctx.fillRect(lander.x - 3, lander.y + 8, 6, 8);
      }

      // Telemetry HUD
      ctx.fillStyle = '#00FF66';
      ctx.font = '11px "Share Tech Mono"';
      ctx.fillText(`FUEL: ${Math.floor(lander.fuel)}%`, 10, 20);
      ctx.fillText(`VERTICAL SPEED: ${lander.vy.toFixed(2)}`, 10, 35);
      ctx.fillText(`HORIZONTAL SPEED: ${lander.vx.toFixed(2)}`, 10, 50);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={440}
      height={400}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
