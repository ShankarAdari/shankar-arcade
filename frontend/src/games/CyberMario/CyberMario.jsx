import { useEffect, useRef } from 'react';

export default function CyberMario({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    let cameraX = 0;

    // Mario Player
    const player = {
      x: 50,
      y: 200,
      w: 24,
      h: 32,
      vx: 0,
      vy: 0,
      speed: 3.5,
      jumpPower: -8.5,
      isGrounded: false
    };

    const gravity = 0.4;

    // Level Elements (Platforms, Blocks, Coins, Enemies, Flag)
    const levelWidth = 1800;

    const platforms = [
      { x: 0, y: canvas.height - 30, w: levelWidth, h: 30 }, // Ground
      { x: 200, y: 220, w: 120, h: 16 },
      { x: 400, y: 170, w: 140, h: 16 },
      { x: 650, y: 210, w: 100, h: 16 },
      { x: 900, y: 160, w: 160, h: 16 },
      { x: 1200, y: 200, w: 140, h: 16 },
      { x: 1450, y: 150, w: 120, h: 16 }
    ];

    let blocks = [
      { x: 250, y: 140, w: 24, h: 24, hit: false, type: 'coin' },
      { x: 450, y: 90, w: 24, h: 24, hit: false, type: 'coin' },
      { x: 950, y: 80, w: 24, h: 24, hit: false, type: 'coin' },
      { x: 1250, y: 120, w: 24, h: 24, hit: false, type: 'coin' }
    ];

    let coins = [
      { x: 210, y: 190, collected: false },
      { x: 250, y: 190, collected: false },
      { x: 420, y: 140, collected: false },
      { x: 460, y: 140, collected: false },
      { x: 700, y: 180, collected: false },
      { x: 920, y: 130, collected: false },
      { x: 1220, y: 170, collected: false }
    ];

    let enemies = [
      { x: 350, y: canvas.height - 50, w: 20, h: 20, vx: -1.2, alive: true },
      { x: 600, y: canvas.height - 50, w: 20, h: 20, vx: -1.5, alive: true },
      { x: 950, y: canvas.height - 50, w: 20, h: 20, vx: -1.2, alive: true },
      { x: 1300, y: canvas.height - 50, w: 20, h: 20, vx: -1.8, alive: true }
    ];

    const flag = { x: 1680, y: canvas.height - 180, w: 10, h: 150 };

    let keys = {};
    const handleKeyDown = (e) => { keys[e.key] = true; };
    const handleKeyUp = (e) => { keys[e.key] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      // Controls
      if (keys['ArrowLeft'] || keys['a']) player.vx = -player.speed;
      else if (keys['ArrowRight'] || keys['d']) player.vx = player.speed;
      else player.vx = 0;

      if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.isGrounded) {
        player.vy = player.jumpPower;
        player.isGrounded = false;
      }

      // Physics Gravity
      player.vy += gravity;
      player.x += player.vx;
      player.y += player.vy;

      // Bound X
      player.x = Math.max(0, player.x);

      // Camera Follow
      cameraX = player.x - 150;
      cameraX = Math.max(0, Math.min(levelWidth - canvas.width, cameraX));

      // Platform Collisions
      player.isGrounded = false;
      platforms.forEach(plat => {
        if (
          player.x + player.w > plat.x &&
          player.x < plat.x + plat.w &&
          player.y + player.h >= plat.y &&
          player.y + player.h <= plat.y + plat.h + 10 &&
          player.vy >= 0
        ) {
          player.y = plat.y - player.h;
          player.vy = 0;
          player.isGrounded = true;
        }
      });

      // Block Collisions (Hitting from below)
      blocks.forEach(b => {
        if (
          player.x + player.w > b.x &&
          player.x < b.x + b.w &&
          player.y <= b.y + b.h &&
          player.y >= b.y &&
          player.vy < 0
        ) {
          player.vy = 1;
          if (!b.hit) {
            b.hit = true;
            score += 100;
            if (onScoreUpdate) onScoreUpdate(score);
          }
        }
      });

      // Coin Collection
      coins.forEach(c => {
        if (!c.collected && Math.hypot(player.x + player.w / 2 - c.x, player.y + player.h / 2 - c.y) < 18) {
          c.collected = true;
          score += 50;
          if (onScoreUpdate) onScoreUpdate(score);
        }
      });

      // Enemies AI & Collision
      enemies.forEach(e => {
        if (!e.alive) return;
        e.x += e.vx;
        if (e.x < 100 || e.x > levelWidth - 100) e.vx *= -1;

        // Player vs Enemy
        if (
          player.x + player.w > e.x &&
          player.x < e.x + e.w &&
          player.y + player.h > e.y &&
          player.y < e.y + e.h
        ) {
          // Jumped on top of enemy -> Stomp!
          if (player.vy > 0 && player.y + player.h - player.vy <= e.y + 6) {
            e.alive = false;
            player.vy = -5; // Bounce
            score += 200;
            if (onScoreUpdate) onScoreUpdate(score);
          } else {
            // Hit enemy from side -> Dead!
            onGameOver(score);
          }
        }
      });

      // Bottom pit death
      if (player.y > canvas.height + 50) {
        onGameOver(score);
      }

      // Reached Flag -> Level Complete Victory!
      if (player.x + player.w >= flag.x) {
        score += 1000;
        if (onScoreUpdate) onScoreUpdate(score);
        onGameOver(score);
      }

      // RENDER
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-cameraX, 0);

      // Draw Platforms
      ctx.fillStyle = '#1A1C23';
      ctx.strokeStyle = '#FCEE09';
      platforms.forEach(plat => {
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
      });

      // Draw Question Blocks
      blocks.forEach(b => {
        ctx.fillStyle = b.hit ? '#333' : '#FCEE09';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = '#0F1015';
        ctx.font = '14px "Share Tech Mono"';
        ctx.fillText(b.hit ? '✓' : '?', b.x + 6, b.y + 17);
      });

      // Draw Coins
      ctx.fillStyle = '#FCEE09';
      coins.forEach(c => {
        if (!c.collected) {
          ctx.beginPath();
          ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Goomba Enemies
      enemies.forEach(e => {
        if (e.alive) {
          ctx.fillStyle = '#FF003C';
          ctx.fillRect(e.x, e.y, e.w, e.h);
          ctx.fillStyle = '#0F1015';
          ctx.fillRect(e.x + 3, e.y + 4, 4, 4);
          ctx.fillRect(e.x + 13, e.y + 4, 4, 4);
        }
      });

      // Draw Flag Pole
      ctx.fillStyle = '#00FF66';
      ctx.fillRect(flag.x, flag.y, flag.w, flag.h);
      ctx.fillStyle = '#FCEE09';
      ctx.beginPath();
      ctx.arc(flag.x + 5, flag.y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Draw Mario Player
      ctx.fillStyle = '#00FF66';
      ctx.fillRect(player.x, player.y, player.w, player.h);
      // Overall cap / overalls detailing
      ctx.fillStyle = '#FCEE09';
      ctx.fillRect(player.x + 4, player.y + 4, player.w - 8, 8);

      ctx.restore();
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
      width={540}
      height={360}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015' }}
    />
  );
}
