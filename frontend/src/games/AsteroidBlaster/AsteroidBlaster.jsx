import { useEffect, useRef } from 'react';

export default function AsteroidBlaster({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    const ship = { x: canvas.width / 2, y: canvas.height / 2, r: 12, a: 0, rot: 0, thrust: false, vx: 0, vy: 0 };
    let bullets = [];
    let asteroids = [];

    for (let i = 0; i < 5; i++) {
      asteroids.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 30,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      });
    }

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') ship.rot = -0.05;
      if (e.key === 'ArrowRight') ship.rot = 0.05;
      if (e.key === 'ArrowUp') ship.thrust = true;
      if (e.key === ' ') {
        bullets.push({
          x: ship.x + Math.cos(ship.a) * ship.r,
          y: ship.y + Math.sin(ship.a) * ship.r,
          vx: Math.cos(ship.a) * 6,
          vy: Math.sin(ship.a) * 6
        });
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) ship.rot = 0;
      if (e.key === 'ArrowUp') ship.thrust = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      // Rotate Ship
      ship.a += ship.rot;

      // Thrust Ship
      if (ship.thrust) {
        ship.vx += Math.cos(ship.a) * 0.1;
        ship.vy += Math.sin(ship.a) * 0.1;
      }

      ship.x += ship.vx;
      ship.y += ship.vy;

      // Wrap Ship
      if (ship.x < 0) ship.x = canvas.width;
      if (ship.x > canvas.width) ship.x = 0;
      if (ship.y < 0) ship.y = canvas.height;
      if (ship.y > canvas.height) ship.y = 0;

      // Move Bullets
      bullets.forEach((b, i) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) bullets.splice(i, 1);
      });

      // Move Asteroids & Collisions
      asteroids.forEach((ast, ai) => {
        ast.x += ast.vx;
        ast.y += ast.vy;

        if (ast.x < 0) ast.x = canvas.width;
        if (ast.x > canvas.width) ast.x = 0;
        if (ast.y < 0) ast.y = canvas.height;
        if (ast.y > canvas.height) ast.y = 0;

        // Bullet hit Asteroid
        bullets.forEach((b, bi) => {
          if (Math.hypot(b.x - ast.x, b.y - ast.y) < ast.r) {
            bullets.splice(bi, 1);
            score += 50;
            if (onScoreUpdate) onScoreUpdate(score);

            if (ast.r > 15) {
              asteroids.push(
                { x: ast.x, y: ast.y, r: ast.r / 2, vx: Math.random() * 2 - 1, vy: Math.random() * 2 - 1 },
                { x: ast.x, y: ast.y, r: ast.r / 2, vx: Math.random() * 2 - 1, vy: Math.random() * 2 - 1 }
              );
            }
            asteroids.splice(ai, 1);
          }
        });

        // Ship hit Asteroid
        if (Math.hypot(ship.x - ast.x, ship.y - ast.y) < ship.r + ast.r) {
          onGameOver(score);
        }
      });

      // Render
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Ship
      ctx.strokeStyle = '#FCEE09';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ship.x + Math.cos(ship.a) * ship.r, ship.y + Math.sin(ship.a) * ship.r);
      ctx.lineTo(ship.x - Math.cos(ship.a - 0.5) * ship.r, ship.y - Math.sin(ship.a - 0.5) * ship.r);
      ctx.lineTo(ship.x - Math.cos(ship.a + 0.5) * ship.r, ship.y - Math.sin(ship.a + 0.5) * ship.r);
      ctx.closePath();
      ctx.stroke();

      // Draw Bullets
      ctx.fillStyle = '#00FF66';
      bullets.forEach(b => ctx.fillRect(b.x - 2, b.y - 2, 4, 4));

      // Draw Asteroids
      ctx.strokeStyle = '#FF003C';
      asteroids.forEach(ast => {
        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.r, 0, Math.PI * 2);
        ctx.stroke();
      });
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
      width={500}
      height={400}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
