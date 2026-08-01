import { useEffect, useRef } from 'react';

export default function SpaceInvaders({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    let lives = 3;
    let wave = 1;

    // Player
    const player = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 30,
      w: 40,
      h: 15,
      speed: 5,
      dx: 0
    };

    // Bullets
    let bullets = [];
    let enemyBullets = [];

    // Enemies
    const rows = 4;
    const cols = 10;
    let enemies = [];
    let enemyDirection = 1;
    let enemySpeed = 1;

    const initEnemies = () => {
      enemies = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          enemies.push({
            x: 50 + c * 45,
            y: 50 + r * 35,
            w: 30,
            h: 20,
            alive: true,
            pts: (rows - r) * 10
          });
        }
      }
    };

    initEnemies();

    // Controls
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed;
      if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed;
      if (e.key === ' ' || e.key === 'ArrowUp') {
        if (bullets.length < 3) {
          bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 10, speed: 7 });
        }
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'a', 'ArrowRight', 'd'].includes(e.key)) player.dx = 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Loop
    const update = () => {
      if (isPaused) return;

      // Move player
      player.x += player.dx;
      if (player.x < 0) player.x = 0;
      if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

      // Move bullets
      bullets.forEach((b, i) => {
        b.y -= b.speed;
        if (b.y < 0) bullets.splice(i, 1);
      });

      // Move enemy bullets
      enemyBullets.forEach((eb, i) => {
        eb.y += eb.speed;
        if (eb.y > canvas.height) enemyBullets.splice(i, 1);

        // Hit player
        if (
          eb.x < player.x + player.w &&
          eb.x + eb.w > player.x &&
          eb.y < player.y + player.h &&
          eb.y + eb.h > player.y
        ) {
          enemyBullets.splice(i, 1);
          lives--;
          if (lives <= 0) {
            onGameOver(score);
          }
        }
      });

      // Move enemies
      let hitEdge = false;
      const aliveEnemies = enemies.filter(e => e.alive);

      if (aliveEnemies.length === 0) {
        wave++;
        enemySpeed += 0.5;
        initEnemies();
        return;
      }

      aliveEnemies.forEach(e => {
        e.x += enemySpeed * enemyDirection;
        if (e.x + e.w > canvas.width - 20 || e.x < 20) hitEdge = true;

        // Enemy fires bullet
        if (Math.random() < 0.001 * wave) {
          enemyBullets.push({ x: e.x + e.w / 2, y: e.y + e.h, w: 4, h: 8, speed: 3 + wave * 0.5 });
        }

        // Check if enemy reached bottom
        if (e.y + e.h >= player.y) {
          onGameOver(score);
        }
      });

      if (hitEdge) {
        enemyDirection *= -1;
        enemies.forEach(e => { e.y += 10; });
      }

      // Bullet - Enemy Collision
      bullets.forEach((b, bi) => {
        enemies.forEach(e => {
          if (e.alive && b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
            e.alive = false;
            bullets.splice(bi, 1);
            score += e.pts * wave;
            if (onScoreUpdate) onScoreUpdate(score);
          }
        });
      });
    };

    const draw = () => {
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Player
      ctx.fillStyle = '#FCEE09';
      ctx.fillRect(player.x, player.y, player.w, player.h);
      ctx.fillRect(player.x + 15, player.y - 6, 10, 6);

      // Draw Bullets
      ctx.fillStyle = '#00FF66';
      bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

      // Draw Enemy Bullets
      ctx.fillStyle = '#FF003C';
      enemyBullets.forEach(eb => ctx.fillRect(eb.x, eb.y, eb.w, eb.h));

      // Draw Enemies
      enemies.forEach(e => {
        if (e.alive) {
          ctx.fillStyle = e.pts === 40 ? '#FF003C' : e.pts === 30 ? '#FCEE09' : '#00FFFF';
          ctx.fillRect(e.x, e.y, e.w, e.h);
          ctx.fillStyle = '#0F1015';
          ctx.fillRect(e.x + 6, e.y + 6, 4, 4);
          ctx.fillRect(e.x + e.w - 10, e.y + 6, 4, 4);
        }
      });

      // Lives
      ctx.fillStyle = '#00FF66';
      ctx.font = '12px "Share Tech Mono"';
      ctx.fillText(`LIVES: ${lives}`, 10, 20);
      ctx.fillText(`WAVE: ${wave}`, canvas.width - 70, 20);
    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
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
      width={600}
      height={450}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015', maxWidth: '100%' }}
    />
  );
}
