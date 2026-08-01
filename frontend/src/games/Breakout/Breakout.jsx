import { useEffect, useRef } from 'react';

export default function Breakout({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    let lives = 3;

    const paddle = { x: canvas.width / 2 - 40, y: canvas.height - 20, w: 80, h: 12, dx: 0, speed: 7 };
    const ball = { x: canvas.width / 2, y: canvas.height - 40, dx: 4, dy: -4, radius: 6 };

    const brickRows = 5;
    const brickCols = 8;
    const brickWidth = 55;
    const brickHeight = 15;
    const brickPadding = 8;
    const brickOffsetTop = 40;
    const brickOffsetLeft = 35;

    let bricks = [];
    for (let r = 0; r < brickRows; r++) {
      bricks[r] = [];
      for (let c = 0; c < brickCols; c++) {
        bricks[r][c] = { x: 0, y: 0, status: 1 };
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') paddle.dx = -paddle.speed;
      if (e.key === 'ArrowRight' || e.key === 'd') paddle.dx = paddle.speed;
    };

    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'a', 'ArrowRight', 'd'].includes(e.key)) paddle.dx = 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      // Move Paddle
      paddle.x += paddle.dx;
      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;

      // Move Ball
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall Bounce
      if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.dx *= -1;
      if (ball.y - ball.radius < 0) ball.dy *= -1;

      // Paddle Bounce
      if (
        ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.w
      ) {
        ball.dy = -Math.abs(ball.dy);
      }

      // Bottom Loss
      if (ball.y + ball.radius > canvas.height) {
        lives--;
        if (lives <= 0) {
          onGameOver(score);
          return;
        }
        ball.x = canvas.width / 2;
        ball.y = canvas.height - 40;
        ball.dx = 4;
        ball.dy = -4;
      }

      // Brick Collision
      for (let r = 0; r < brickRows; r++) {
        for (let c = 0; c < brickCols; c++) {
          const b = bricks[r][c];
          if (b.status === 1) {
            const bx = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const by = r * (brickHeight + brickPadding) + brickOffsetTop;
            b.x = bx;
            b.y = by;

            if (
              ball.x > bx &&
              ball.x < bx + brickWidth &&
              ball.y > by &&
              ball.y < by + brickHeight
            ) {
              ball.dy *= -1;
              b.status = 0;
              score += 20;
              if (onScoreUpdate) onScoreUpdate(score);
            }
          }
        }
      }

      // Draw
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Paddle
      ctx.fillStyle = '#FCEE09';
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

      // Draw Ball
      ctx.fillStyle = '#00FF66';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw Bricks
      const colors = ['#FF003C', '#FF6600', '#FCEE09', '#00FF66', '#00FFFF'];
      for (let r = 0; r < brickRows; r++) {
        for (let c = 0; c < brickCols; c++) {
          if (bricks[r][c].status === 1) {
            ctx.fillStyle = colors[r % colors.length];
            ctx.fillRect(bricks[r][c].x, bricks[r][c].y, brickWidth, brickHeight);
          }
        }
      }

      ctx.fillStyle = '#00FF66';
      ctx.font = '12px "Share Tech Mono"';
      ctx.fillText(`LIVES: ${lives}`, 10, 20);
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
      width={550}
      height={400}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
