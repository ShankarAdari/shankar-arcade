import { useEffect, useRef } from 'react';

export default function MissileDefense({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    let missiles = [];
    let explosions = [];

    const cities = [
      { x: 50, alive: true }, { x: 120, alive: true }, { x: 190, alive: true },
      { x: 280, alive: true }, { x: 350, alive: true }, { x: 420, alive: true }
    ];

    const spawnMissile = () => {
      const startX = Math.random() * canvas.width;
      const targetCity = cities.filter(c => c.alive)[Math.floor(Math.random() * cities.filter(c => c.alive).length)];
      if (!targetCity) return;

      missiles.push({
        x: startX,
        y: 0,
        targetX: targetCity.x,
        targetY: canvas.height - 20,
        speed: 1.5 + Math.random()
      });
    };

    const handleClick = (e) => {
      if (isPaused) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      explosions.push({ x: clickX, y: clickY, r: 0, maxR: 30, growing: true });
    };

    canvas.addEventListener('click', handleClick);

    const spawnInterval = setInterval(() => {
      if (!isPaused) spawnMissile();
    }, 1500);

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      // Update Missiles
      missiles.forEach((m, mi) => {
        const dx = m.targetX - m.x;
        const dy = m.targetY - m.y;
        const dist = Math.hypot(dx, dy);

        m.x += (dx / dist) * m.speed;
        m.y += (dy / dist) * m.speed;

        // Check impact with city
        if (m.y >= m.targetY) {
          missiles.splice(mi, 1);
          const city = cities.find(c => Math.abs(c.x - m.targetX) < 10);
          if (city) city.alive = false;

          if (cities.every(c => !c.alive)) {
            onGameOver(score);
          }
        }

        // Check hit by explosion
        explosions.forEach((exp) => {
          if (Math.hypot(m.x - exp.x, m.y - exp.y) < exp.r) {
            missiles.splice(mi, 1);
            score += 100;
            if (onScoreUpdate) onScoreUpdate(score);
          }
        });
      });

      // Update Explosions
      explosions.forEach((exp, ei) => {
        if (exp.growing) {
          exp.r += 1.5;
          if (exp.r >= exp.maxR) exp.growing = false;
        } else {
          exp.r -= 1.5;
          if (exp.r <= 0) explosions.splice(ei, 1);
        }
      });

      // Render
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Cities
      cities.forEach((c) => {
        ctx.fillStyle = c.alive ? '#00FF66' : '#FF003C';
        ctx.fillRect(c.x - 15, canvas.height - 20, 30, 20);
      });

      // Draw Missiles
      ctx.strokeStyle = '#FF003C';
      missiles.forEach((m) => {
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - (m.targetX - m.x) * 0.1, m.y - 10);
        ctx.stroke();
      });

      // Draw Explosions
      ctx.fillStyle = 'rgba(252,238,9,0.5)';
      explosions.forEach((exp) => {
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(spawnInterval);
      canvas.removeEventListener('click', handleClick);
    };
  }, [isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={400}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
