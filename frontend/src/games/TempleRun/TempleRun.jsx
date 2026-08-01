import { useEffect, useRef } from 'react';

export default function TempleRun({ onGameOver, isPaused, onScoreUpdate, level }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const LANE_COUNT = 3;
    const LANE_W = canvas.width / LANE_COUNT;
    const diffMulti = 1 + ((level || 1) - 1) * 0.07;

    let speed = 5 * diffMulti;
    let score = 0;
    let frame = 0;
    let alive = true;

    // Player
    let playerLane = 1; // 0=left, 1=mid, 2=right
    let playerY = canvas.height - 100;
    let playerVY = 0;
    let isGrounded = true;
    let isDucking = false;
    let transitioning = false; // lane switch animation
    let playerVisualX = LANE_W * 1 + LANE_W / 2;

    // Obstacles
    let obstacles = [];
    // Coins
    let coins = [];
    // Particles
    let particles = [];
    // Tiles scrolling
    let tileOffset = 0;

    const laneX = (lane) => LANE_W * lane + LANE_W / 2;

    const spawnObstacle = () => {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const type = Math.random() < 0.35 ? 'hurdle' : Math.random() < 0.5 ? 'barrier' : 'gap';
      obstacles.push({ lane, y: -60, type });
    };

    const spawnCoins = () => {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      for (let i = 0; i < 4; i++) {
        coins.push({ lane, y: -60 - i * 40, collected: false });
      }
    };

    // Controls
    let lastLane = playerLane;
    const onKeyDown = (e) => {
      if (!alive || isPaused) return;
      if ((e.key === 'ArrowLeft' || e.key === 'a') && playerLane > 0) {
        playerLane--;
      } else if ((e.key === 'ArrowRight' || e.key === 'd') && playerLane < 2) {
        playerLane++;
      } else if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') && isGrounded) {
        playerVY = -12;
        isGrounded = false;
        isDucking = false;
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        if (!isGrounded) {
          playerVY += 6; // Fast fall
        } else {
          isDucking = true;
        }
      }
    };

    const onKeyUp = (e) => {
      if (e.key === 'ArrowDown' || e.key === 's') isDucking = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const spawnParticle = (x, y) => {
      for (let i = 0; i < 6; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 3,
          life: 20,
          color: Math.random() < 0.5 ? '#FCEE09' : '#00FF66'
        });
      }
    };

    const loop = () => {
      animId = requestAnimationFrame(loop);
      if (!alive || isPaused) return;

      frame++;
      speed = Math.min(16, 5 * diffMulti + frame * 0.003);
      tileOffset = (tileOffset + speed) % 60;

      // Smooth lane transition
      const targetX = laneX(playerLane);
      playerVisualX += (targetX - playerVisualX) * 0.18;

      // Gravity
      playerVY += 0.55;
      playerY += playerVY;
      if (playerY >= canvas.height - 100) {
        playerY = canvas.height - 100;
        playerVY = 0;
        isGrounded = true;
      }

      // Score
      score = Math.floor(frame * 0.5 * diffMulti);
      if (frame % 5 === 0 && onScoreUpdate) onScoreUpdate(score);

      // Spawn
      if (frame % Math.floor(80 / diffMulti) === 0) spawnObstacle();
      if (frame % Math.floor(110 / diffMulti) === 0) spawnCoins();

      const pW = isDucking ? 40 : 28;
      const pH = isDucking ? 22 : 44;
      const pX = playerVisualX - pW / 2;
      const pY = isDucking ? playerY + 22 : playerY;

      // Obstacles
      obstacles.forEach((obs, oi) => {
        obs.y += speed;
        if (obs.y > canvas.height + 80) { obstacles.splice(oi, 1); return; }

        const ox = laneX(obs.lane) - 22;
        const isHurdle = obs.type === 'hurdle';
        const oH = isHurdle ? 26 : 50;
        const oY = isHurdle ? canvas.height - 100 - oH : canvas.height - 100 - oH;

        if (obs.lane === playerLane) {
          const colliding =
            pX < ox + 44 && pX + pW > ox &&
            pY < oY + oH && pY + pH > oY;
          if (colliding) {
            alive = false;
            for (let i = 0; i < 12; i++) spawnParticle(pX + pW / 2, pY);
            setTimeout(() => onGameOver(score), 900);
          }
        }
      });

      // Coins
      coins.forEach((c, ci) => {
        c.y += speed;
        if (c.y > canvas.height + 20) { coins.splice(ci, 1); return; }
        if (!c.collected && c.lane === playerLane) {
          const cx = laneX(c.lane);
          if (Math.abs(cx - playerVisualX) < 30 && Math.abs(c.y - (pY + pH / 2)) < 40) {
            c.collected = true;
            score += 50;
            spawnParticle(cx, c.y);
          }
        }
      });

      // Particles
      particles.forEach((p, pi) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life--;
        if (p.life <= 0) particles.splice(pi, 1);
      });

      // ===== RENDER =====
      ctx.fillStyle = '#0A0C10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scrolling temple floor tiles
      for (let lane = 0; lane < LANE_COUNT; lane++) {
        const lx = lane * LANE_W;
        ctx.fillStyle = lane % 2 === 0 ? '#14161C' : '#111318';
        ctx.fillRect(lx, 0, LANE_W, canvas.height);
        // Lane dividers
        ctx.strokeStyle = 'rgba(252,238,9,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, canvas.height); ctx.stroke();
      }

      // Horizontal scroll lines
      for (let ty = -tileOffset; ty < canvas.height; ty += 60) {
        ctx.strokeStyle = 'rgba(0,255,102,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(canvas.width, ty); ctx.stroke();
      }

      // Depth fog at top
      const fog = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.35);
      fog.addColorStop(0, 'rgba(10,12,16,1)');
      fog.addColorStop(1, 'rgba(10,12,16,0)');
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.35);

      // Coins
      coins.forEach(c => {
        if (c.collected) return;
        const cx = laneX(c.lane);
        ctx.fillStyle = '#FCEE09';
        ctx.shadowColor = '#FCEE09';
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(cx, c.y, 9, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0F1015';
        ctx.font = '9px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('$', cx, c.y + 3);
        ctx.textAlign = 'left';
      });

      // Obstacles
      obstacles.forEach(obs => {
        const ox = laneX(obs.lane) - 22;
        if (obs.type === 'hurdle') {
          ctx.fillStyle = '#FF6600';
          ctx.fillRect(ox, canvas.height - 100 - 26, 44, 26);
          ctx.fillStyle = '#0F1015';
          ctx.font = '10px "Share Tech Mono"';
          ctx.textAlign = 'center';
          ctx.fillText('╤', laneX(obs.lane), canvas.height - 87);
          ctx.textAlign = 'left';
        } else if (obs.type === 'barrier') {
          ctx.fillStyle = '#FF003C';
          ctx.fillRect(ox, canvas.height - 100 - 50, 44, 50);
          ctx.fillStyle = '#0F1015';
          ctx.font = '10px "Share Tech Mono"';
          ctx.textAlign = 'center';
          ctx.fillText('⛔', laneX(obs.lane), canvas.height - 78);
          ctx.textAlign = 'left';
        }
      });

      // Ground line
      ctx.strokeStyle = 'rgba(252,238,9,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 100);
      ctx.lineTo(canvas.width, canvas.height - 100);
      ctx.stroke();

      // Player
      if (alive) {
        const px = pX, py = pY;
        const runBob = Math.sin(frame * 0.25) * (isGrounded ? 3 : 0);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(px + pW / 2, canvas.height - 98, pW / 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        if (!isDucking) {
          const l1 = Math.sin(frame * 0.28) * 10;
          ctx.fillStyle = '#00CC44';
          ctx.fillRect(px + 2, py + 28 + l1, 10, 16);
          ctx.fillRect(px + pW - 12, py + 28 - l1, 10, 16);
        }

        // Body
        ctx.fillStyle = '#00FF66';
        ctx.fillRect(px, py + runBob, pW, isDucking ? pH : 28);

        if (!isDucking) {
          // Head
          ctx.fillStyle = '#FCEE09';
          ctx.fillRect(px + 4, py - 14 + runBob, pW - 8, 14);
          // Headband
          ctx.fillStyle = '#FF003C';
          ctx.fillRect(px + 4, py - 14 + runBob, pW - 8, 4);
          // Eyes
          ctx.fillStyle = '#0F1015';
          ctx.fillRect(px + 8, py - 9 + runBob, 4, 4);
          ctx.fillRect(px + pW - 12, py - 9 + runBob, 4, 4);
        }
      }

      // Particles
      particles.forEach(p => {
        ctx.globalAlpha = p.life / 20;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
        ctx.globalAlpha = 1;
      });

      // HUD Overlay
      ctx.fillStyle = 'rgba(15,16,21,0.7)';
      ctx.fillRect(0, 0, canvas.width, 54);
      ctx.fillStyle = '#FCEE09';
      ctx.font = 'bold 14px "Share Tech Mono"';
      ctx.fillText(`SCORE: ${score.toLocaleString()}`, 14, 22);
      ctx.fillStyle = '#00FF66';
      ctx.font = '11px "Share Tech Mono"';
      ctx.fillText(`[←/→] LANE  [↑/SPACE] JUMP  [↓] DUCK`, 14, 42);
      ctx.fillStyle = '#FCEE09';
      ctx.textAlign = 'right';
      ctx.font = 'bold 14px "Share Tech Mono"';
      ctx.fillText(`LVL ${level || 1}  SPEED: ${speed.toFixed(1)}`, canvas.width - 14, 22);
      ctx.textAlign = 'left';
    };

    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isPaused, level]);

  return (
    <canvas ref={canvasRef} width={540} height={400}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0A0C10', display: 'block' }} />
  );
}
