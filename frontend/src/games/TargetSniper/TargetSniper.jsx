import { useEffect, useRef } from 'react';

export default function TargetSniper({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    let timer = 30;
    let targets = [];

    const spawnTarget = () => {
      targets.push({
        x: Math.random() * (canvas.width - 80) + 40,
        y: Math.random() * (canvas.height - 80) + 40,
        r: 25,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 180
      });
    };

    for (let i = 0; i < 3; i++) spawnTarget();

    const handleClick = (e) => {
      if (isPaused) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      targets.forEach((t, i) => {
        if (Math.hypot(clickX - t.x, clickY - t.y) < t.r) {
          targets.splice(i, 1);
          score += 100;
          if (onScoreUpdate) onScoreUpdate(score);
          spawnTarget();
        }
      });
    };

    canvas.addEventListener('click', handleClick);

    const interval = setInterval(() => {
      if (!isPaused) {
        timer--;
        if (timer <= 0) {
          clearInterval(interval);
          onGameOver(score);
        }
      }
    }, 1000);

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      // Update Targets
      targets.forEach((t, i) => {
        t.x += t.vx;
        t.y += t.vy;
        t.life--;

        if (t.x - t.r < 0 || t.x + t.r > canvas.width) t.vx *= -1;
        if (t.y - t.r < 0 || t.y + t.r > canvas.height) t.vy *= -1;

        if (t.life <= 0) {
          targets.splice(i, 1);
          spawnTarget();
        }
      });

      // Render
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Targets
      targets.forEach(t => {
        ctx.strokeStyle = '#FCEE09';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#FF003C';
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(t.x - t.r - 4, t.y); ctx.lineTo(t.x + t.r + 4, t.y);
        ctx.moveTo(t.x, t.y - t.r - 4); ctx.lineTo(t.x, t.y + t.r + 4);
        ctx.stroke();
      });

      ctx.fillStyle = '#00FF66';
      ctx.font = '14px "Share Tech Mono"';
      ctx.fillText(`TIME: ${timer}s`, 15, 25);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
      canvas.removeEventListener('click', handleClick);
    };
  }, [isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={360}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
