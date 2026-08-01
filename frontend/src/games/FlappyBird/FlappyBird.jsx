import { useEffect, useRef } from 'react';

export default function FlappyBird({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let birdY = 200;
    let velocity = 0;
    const gravity = 0.4;
    const jump = -7;
    let score = 0;

    let pipes = [];
    const pipeWidth = 50;
    const gap = 120;
    let frame = 0;

    const handleJump = () => {
      velocity = jump;
    };

    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') handleJump();
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleJump);

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      frame++;
      velocity += gravity;
      birdY += velocity;

      // Spawn pipes
      if (frame % 90 === 0) {
        const pipeTopHeight = Math.floor(Math.random() * (canvas.height - gap - 100)) + 50;
        pipes.push({
          x: canvas.width,
          top: pipeTopHeight,
          bottom: canvas.height - pipeTopHeight - gap,
          passed: false
        });
      }

      // Move pipes
      pipes.forEach((pipe, i) => {
        pipe.x -= 3;

        // Score
        if (!pipe.passed && pipe.x < 100) {
          pipe.passed = true;
          score += 1;
          if (onScoreUpdate) onScoreUpdate(score);
        }

        // Collision
        if (
          100 + 20 > pipe.x &&
          100 < pipe.x + pipeWidth &&
          (birdY < pipe.top || birdY + 20 > canvas.height - pipe.bottom)
        ) {
          onGameOver(score);
        }

        // Remove offscreen
        if (pipe.x + pipeWidth < 0) pipes.splice(i, 1);
      });

      // Ceiling / Floor Collision
      if (birdY < 0 || birdY + 20 > canvas.height) {
        onGameOver(score);
      }

      // Render
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Bird
      ctx.fillStyle = '#FCEE09';
      ctx.fillRect(100, birdY, 20, 20);

      // Draw Pipes
      ctx.fillStyle = '#FF003C';
      pipes.forEach((pipe) => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
      });
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('click', handleJump);
    };
  }, [isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={500}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
