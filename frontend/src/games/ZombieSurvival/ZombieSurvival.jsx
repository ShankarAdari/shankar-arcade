import { useEffect, useRef } from 'react';

export default function ZombieSurvival({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    let hp = 100;
    const player = { x: canvas.width / 2, y: canvas.height / 2, r: 10, speed: 3 };
    let keys = {};
    let bullets = [];
    let zombies = [];

    const handleKeyDown = (e) => { keys[e.key] = true; };
    const handleKeyUp = (e) => { keys[e.key] = false; };

    const handleMouseMove = (e) => {
      if (isPaused) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    };

    const handleClick = () => {
      if (isPaused) return;
      bullets.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(player.angle || 0) * 8,
        vy: Math.sin(player.angle || 0) * 8
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    const spawnInterval = setInterval(() => {
      if (!isPaused) {
        const side = Math.floor(Math.random() * 4);
        let zx = 0, zy = 0;
        if (side === 0) { zx = Math.random() * canvas.width; zy = 0; }
        else if (side === 1) { zx = canvas.width; zy = Math.random() * canvas.height; }
        else if (side === 2) { zx = Math.random() * canvas.width; zy = canvas.height; }
        else { zx = 0; zy = Math.random() * canvas.height; }

        zombies.push({ x: zx, y: zy, r: 12, speed: 1 + Math.random() });
      }
    }, 1000);

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      // Player Movement
      if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
      if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
      if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
      if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

      player.x = Math.max(player.r, Math.min(canvas.width - player.r, player.x));
      player.y = Math.max(player.r, Math.min(canvas.height - player.r, player.y));

      // Move Bullets
      bullets.forEach((b, bi) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) bullets.splice(bi, 1);
      });

      // Move Zombies & Collisions
      zombies.forEach((z, zi) => {
        const angle = Math.atan2(player.y - z.y, player.x - z.x);
        z.x += Math.cos(angle) * z.speed;
        z.y += Math.sin(angle) * z.speed;

        // Zombie hits player
        if (Math.hypot(player.x - z.x, player.y - z.y) < player.r + z.r) {
          hp -= 5;
          zombies.splice(zi, 1);
          if (hp <= 0) {
            onGameOver(score);
          }
        }

        // Bullet hits zombie
        bullets.forEach((b, bi) => {
          if (Math.hypot(b.x - z.x, b.y - z.y) < z.r) {
            zombies.splice(zi, 1);
            bullets.splice(bi, 1);
            score += 20;
            if (onScoreUpdate) onScoreUpdate(score);
          }
        });
      });

      // Render
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Player
      ctx.fillStyle = '#FCEE09';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
      ctx.fill();

      // Draw Bullets
      ctx.fillStyle = '#00FF66';
      bullets.forEach(b => ctx.fillRect(b.x - 2, b.y - 2, 4, 4));

      // Draw Zombies
      ctx.fillStyle = '#FF003C';
      zombies.forEach(z => {
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#00FF66';
      ctx.font = '12px "Share Tech Mono"';
      ctx.fillText(`HP: ${hp}%`, 10, 20);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(spawnInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
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
