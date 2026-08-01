import { useEffect, useRef } from 'react';

export default function CyberRacer({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    const carWidth = 36;
    const carHeight = 60;
    let carX = canvas.width / 2 - carWidth / 2;
    const carY = canvas.height - carHeight - 20;

    let speed = 4;
    let dx = 0;
    let obstacles = [];
    let frame = 0;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') dx = -6;
      if (e.key === 'ArrowRight' || e.key === 'd') dx = 6;
    };
    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'a', 'ArrowRight', 'd'].includes(e.key)) dx = 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const spawnObstacle = () => {
      const laneWidth = (canvas.width - 60) / 3;
      const lane = Math.floor(Math.random() * 3);
      obstacles.push({
        x: 35 + lane * laneWidth + (laneWidth - carWidth) / 2,
        y: -carHeight,
        w: carWidth,
        h: carHeight,
        color: ['#FF003C', '#00FFFF', '#FF6600'][Math.floor(Math.random() * 3)]
      });
    };

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      frame++;
      score += 1;
      if (onScoreUpdate && frame % 5 === 0) onScoreUpdate(score);

      if (frame % 50 === 0) {
        spawnObstacle();
        if (speed < 12) speed += 0.1;
      }

      // Move player
      carX += dx;
      carX = Math.max(30, Math.min(canvas.width - 30 - carWidth, carX));

      // Move obstacles & collision
      obstacles.forEach((obs, i) => {
        obs.y += speed;

        if (
          carX < obs.x + obs.w &&
          carX + carWidth > obs.x &&
          carY < obs.y + obs.h &&
          carY + carHeight > obs.y
        ) {
          onGameOver(score);
        }

        if (obs.y > canvas.height) obstacles.splice(i, 1);
      });

      // Render
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road borders & lines
      ctx.strokeStyle = '#FCEE09';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(30, 0); ctx.lineTo(30, canvas.height);
      ctx.moveTo(canvas.width - 30, 0); ctx.lineTo(canvas.width - 30, canvas.height);
      ctx.stroke();

      // Dashed lane dividers
      ctx.strokeStyle = 'rgba(252,238,9,0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -frame * speed;
      const laneWidth = (canvas.width - 60) / 3;
      ctx.beginPath();
      ctx.moveTo(30 + laneWidth, 0); ctx.lineTo(30 + laneWidth, canvas.height);
      ctx.moveTo(30 + laneWidth * 2, 0); ctx.lineTo(30 + laneWidth * 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Player Car
      ctx.fillStyle = '#FCEE09';
      ctx.fillRect(carX, carY, carWidth, carHeight);
      ctx.fillStyle = '#00FF66';
      ctx.fillRect(carX + 4, carY + 8, carWidth - 8, 12);

      // Draw Obstacles
      obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.fillStyle = '#0F1015';
        ctx.fillRect(obs.x + 4, obs.y + 8, obs.w - 8, 12);
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
      width={360}
      height={480}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
