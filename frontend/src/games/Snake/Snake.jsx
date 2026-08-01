import { useEffect, useRef } from 'react';

export default function Snake({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [{ x: 10, y: 10 }];
    let dx = 1;
    let dy = 0;
    let food = { x: 15, y: 15 };
    let score = 0;
    let speed = 100;
    let lastTime = 0;

    const handleKeyDown = (e) => {
      if ((e.key === 'ArrowUp' || e.key === 'w') && dy === 0) { dx = 0; dy = -1; }
      if ((e.key === 'ArrowDown' || e.key === 's') && dy === 0) { dx = 0; dy = 1; }
      if ((e.key === 'ArrowLeft' || e.key === 'a') && dx === 0) { dx = -1; dy = 0; }
      if ((e.key === 'ArrowRight' || e.key === 'd') && dx === 0) { dx = 1; dy = 0; }
    };

    window.addEventListener('keydown', handleKeyDown);

    const placeFood = () => {
      food.x = Math.floor(Math.random() * tileCount);
      food.y = Math.floor(Math.random() * tileCount);
    };

    const loop = (currentTime) => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      if (currentTime - lastTime < speed) return;
      lastTime = currentTime;

      // Move Snake
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };

      // Wall collision
      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        onGameOver(score);
        return;
      }

      // Self collision
      for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
          onGameOver(score);
          return;
        }
      }

      snake.unshift(head);

      // Eat Food
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        if (onScoreUpdate) onScoreUpdate(score);
        placeFood();
        if (speed > 50) speed -= 2;
      } else {
        snake.pop();
      }

      // Render
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Food
      ctx.fillStyle = '#FF003C';
      ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

      // Draw Snake
      snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#FCEE09' : '#00FF66';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
      });
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
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
