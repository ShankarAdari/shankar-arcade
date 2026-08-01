import { useEffect, useRef } from 'react';

export default function LaserPong({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    const paddleWidth = 12;
    const paddleHeight = 70;

    let playerY = canvas.height / 2 - paddleHeight / 2;
    let aiY = canvas.height / 2 - paddleHeight / 2;
    let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 5, dy: 3, r: 6 };

    const handleMouseMove = (e) => {
      if (isPaused) return;
      const rect = canvas.getBoundingClientRect();
      playerY = e.clientY - rect.top - paddleHeight / 2;
      playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));
    };

    const handleTouchMove = (e) => {
      if (isPaused) return;
      const rect = canvas.getBoundingClientRect();
      playerY = e.touches[0].clientY - rect.top - paddleHeight / 2;
      playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      // Ball Movement
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Top / Bottom Bounce
      if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) ball.dy *= -1;

      // AI Movement
      const aiTarget = ball.y - paddleHeight / 2;
      aiY += (aiTarget - aiY) * 0.08;
      aiY = Math.max(0, Math.min(canvas.height - paddleHeight, aiY));

      // Player Paddle Collision
      if (
        ball.x - ball.r < 20 + paddleWidth &&
        ball.y > playerY &&
        ball.y < playerY + paddleHeight
      ) {
        ball.dx = Math.abs(ball.dx) * 1.05;
        score += 10;
        if (onScoreUpdate) onScoreUpdate(score);
      }

      // AI Paddle Collision
      if (
        ball.x + ball.r > canvas.width - 20 - paddleWidth &&
        ball.y > aiY &&
        ball.y < aiY + paddleHeight
      ) {
        ball.dx = -Math.abs(ball.dx) * 1.05;
      }

      // Miss / Game Over
      if (ball.x < 0) {
        onGameOver(score);
      }

      // AI Miss (Reset ball)
      if (ball.x > canvas.width) {
        score += 50;
        if (onScoreUpdate) onScoreUpdate(score);
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = -5;
      }

      // Render
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center Line
      ctx.strokeStyle = 'rgba(252,238,9,0.2)';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Player Paddle
      ctx.fillStyle = '#FCEE09';
      ctx.fillRect(20, playerY, paddleWidth, paddleHeight);

      // AI Paddle
      ctx.fillStyle = '#FF003C';
      ctx.fillRect(canvas.width - 20 - paddleWidth, aiY, paddleWidth, paddleHeight);

      // Ball
      ctx.fillStyle = '#00FF66';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={360}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
