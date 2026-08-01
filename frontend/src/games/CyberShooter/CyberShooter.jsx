import { useEffect, useRef } from 'react';

export default function CyberShooter({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    let ammo = 6;
    let timer = 40;

    let targets = [];

    const spawnTarget = () => {
      targets.push({
        x: Math.random() < 0.5 ? -30 : canvas.width + 30,
        y: Math.random() * (canvas.height - 150) + 40,
        w: 32,
        h: 24,
        vx: (Math.random() * 2 + 2) * (Math.random() < 0.5 ? 1 : -1),
        vy: (Math.random() - 0.5) * 2,
        alive: true,
        type: Math.random() < 0.2 ? 'gold' : 'normal'
      });
    };

    for (let i = 0; i < 4; i++) spawnTarget();

    const handleClick = (e) => {
      if (isPaused) return;

      if (ammo <= 0) return; // Need reload
      ammo--;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      targets.forEach((t) => {
        if (t.alive && clickX >= t.x && clickX <= t.x + t.w && clickY >= t.y && clickY <= t.y + t.h) {
          t.alive = false;
          const pts = t.type === 'gold' ? 250 : 100;
          score += pts;
          if (onScoreUpdate) onScoreUpdate(score);
        }
      });
    };

    const handleKeyDown = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        ammo = 6; // Reload
      }
    };

    canvas.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

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
        if (!t.alive) {
          t.y += 6; // Fall down when shot
          if (t.y > canvas.height) {
            targets.splice(i, 1);
            spawnTarget();
          }
          return;
        }

        t.x += t.vx;
        t.y += t.vy;

        if (t.x < -40 || t.x > canvas.width + 40) t.vx *= -1;
        if (t.y < 20 || t.y > canvas.height - 120) t.vy *= -1;
      });

      // RENDER
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Environment Horizon
      ctx.fillStyle = 'rgba(0, 255, 102, 0.05)';
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

      // Draw Drones / Ducks
      targets.forEach(t => {
        ctx.fillStyle = t.type === 'gold' ? '#FCEE09' : '#00FFFF';
        ctx.fillRect(t.x, t.y, t.w, t.h);

        // Propellers
        ctx.fillStyle = '#FF003C';
        ctx.fillRect(t.x - 4, t.y - 4, 10, 4);
        ctx.fillRect(t.x + t.w - 6, t.y - 4, 10, 4);
      });

      // HUD Telemetry
      ctx.fillStyle = '#00FF66';
      ctx.font = '14px "Share Tech Mono"';
      ctx.fillText(`TIME: ${timer}s`, 15, 25);
      ctx.fillText(`AMMO: ${'▮'.repeat(ammo)}${'▯'.repeat(6 - ammo)} [PRESS 'R' TO RELOAD]`, 15, 45);

      if (ammo === 0) {
        ctx.fillStyle = '#FF003C';
        ctx.fillText('OUT OF AMMO! PRESS R TO RELOAD', canvas.width / 2 - 110, canvas.height / 2);
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={380}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015', cursor: 'crosshair' }}
    />
  );
}
