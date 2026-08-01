import { useEffect, useRef } from 'react';

export default function WhackAMole({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    let timer = 30; // 30 seconds
    let activeHole = -1;
    let moleTimer = 0;

    const holes = [
      { x: 80, y: 80 }, { x: 200, y: 80 }, { x: 320, y: 80 },
      { x: 80, y: 200 }, { x: 200, y: 200 }, { x: 320, y: 200 },
      { x: 80, y: 320 }, { x: 200, y: 320 }, { x: 320, y: 320 }
    ];

    const handleClick = (e) => {
      if (isPaused || activeHole === -1) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const mole = holes[activeHole];
      const dist = Math.hypot(clickX - mole.x, clickY - mole.y);

      if (dist < 30) {
        score += 50;
        if (onScoreUpdate) onScoreUpdate(score);
        activeHole = -1; // Reset mole hit
      }
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

      moleTimer++;
      if (moleTimer % 40 === 0) {
        activeHole = Math.floor(Math.random() * holes.length);
      }

      // Draw
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Holes
      holes.forEach((h, idx) => {
        ctx.fillStyle = '#1A1C23';
        ctx.beginPath();
        ctx.arc(h.x, h.y, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(252,238,9,0.3)';
        ctx.stroke();

        // Draw Mole if active
        if (idx === activeHole) {
          ctx.fillStyle = '#FCEE09';
          ctx.beginPath();
          ctx.arc(h.x, h.y, 25, 0, Math.PI * 2);
          ctx.fill();

          // Target reticle icon
          ctx.strokeStyle = '#FF003C';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(h.x, h.y, 15, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      ctx.fillStyle = '#00FF66';
      ctx.font = '14px "Share Tech Mono"';
      ctx.fillText(`TIME LEFT: ${timer}s`, 15, 25);
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
      width={400}
      height={400}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
