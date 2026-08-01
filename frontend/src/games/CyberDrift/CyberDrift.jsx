import { useEffect, useRef } from 'react';

export default function CyberDrift({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    let distance = 0;
    let speed = 5;

    const carWidth = 40;
    const carHeight = 60;
    let carX = canvas.width / 2 - carWidth / 2;
    const carY = canvas.height - carHeight - 20;

    let dx = 0;
    let enemies = [];
    let frame = 0;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') dx = -7;
      if (e.key === 'ArrowRight' || e.key === 'd') dx = 7;
      if (e.key === 'ArrowUp' || e.key === 'w') speed = 9; // Nitro Boost
    };

    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'a', 'ArrowRight', 'd'].includes(e.key)) dx = 0;
      if (e.key === 'ArrowUp' || e.key === 'w') speed = 5;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const spawnEnemy = () => {
      enemies.push({
        x: Math.random() * (canvas.width - 120) + 60,
        y: -carHeight,
        w: carWidth,
        h: carHeight,
        vx: (Math.random() - 0.5) * 2,
        color: ['#FF003C', '#00FFFF', '#FF6600'][Math.floor(Math.random() * 3)]
      });
    };

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      frame++;
      distance += speed;
      score = Math.floor(distance);
      if (onScoreUpdate && frame % 4 === 0) onScoreUpdate(score);

      if (frame % 40 === 0) spawnEnemy();

      // Move player
      carX += dx;
      carX = Math.max(50, Math.min(canvas.width - 50 - carWidth, carX));

      // Move enemies & Check collision
      enemies.forEach((e, i) => {
        e.y += speed * 0.8;
        e.x += e.vx;

        if (
          carX < e.x + e.w &&
          carX + carWidth > e.x &&
          carY < e.y + e.h &&
          carY + carHeight > e.y
        ) {
          onGameOver(score);
        }

        if (e.y > canvas.height) enemies.splice(i, 1);
      });

      // RENDER
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pseudo 3D Road Perspective
      const horizonY = 80;
      ctx.fillStyle = 'rgba(252, 238, 9, 0.05)';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 30, horizonY);
      ctx.lineTo(canvas.width / 2 + 30, horizonY);
      ctx.lineTo(canvas.width - 40, canvas.height);
      ctx.lineTo(40, canvas.height);
      ctx.fill();

      // Road Lines
      ctx.strokeStyle = '#FCEE09';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 30, horizonY); ctx.lineTo(40, canvas.height);
      ctx.moveTo(canvas.width / 2 + 30, horizonY); ctx.lineTo(canvas.width - 40, canvas.height);
      ctx.stroke();

      // Animated Road Markings
      ctx.strokeStyle = 'rgba(252,238,9,0.4)';
      ctx.setLineDash([15, 15]);
      ctx.lineDashOffset = -frame * speed;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, horizonY); ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Player Car
      ctx.fillStyle = '#00FF66';
      ctx.fillRect(carX, carY, carWidth, carHeight);
      ctx.fillStyle = '#FCEE09';
      ctx.fillRect(carX + 4, carY + 6, carWidth - 8, 10);

      // Draw Enemy Cars
      enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.fillStyle = '#0F1015';
        ctx.fillRect(e.x + 4, e.y + 6, e.w - 8, 10);
      });

      // Telemetry HUD
      ctx.fillStyle = '#00FF66';
      ctx.font = '12px "Share Tech Mono"';
      ctx.fillText(`SPEED: ${Math.floor(speed * 20)} KM/H`, 15, 25);
      ctx.fillText(`DISTANCE: ${score} M`, 15, 42);
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
      width={400}
      height={450}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
