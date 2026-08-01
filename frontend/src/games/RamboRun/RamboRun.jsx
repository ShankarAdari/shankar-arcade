import { useEffect, useRef } from 'react';

export default function RamboRun({ onGameOver, isPaused, onScoreUpdate, level }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    // --- State ---
    let score = 0;
    let frame = 0;
    let scrollX = 0;
    const diffMulti = 1 + ((level || 1) - 1) * 0.08; // level-based difficulty

    // Player
    const P = {
      x: 80, y: canvas.height - 90,
      w: 28, h: 48,
      vx: 0, vy: 0,
      onGround: false,
      alive: true,
      facing: 1,   // 1 = right, -1 = left
      runFrame: 0,
      shooting: false,
    };

    // Ground
    const groundY = canvas.height - 42;

    // Bullets fired by player
    let bullets = [];
    // Enemies
    let enemies = [];
    // Explosions
    let explosions = [];
    // Platforms (for jumping)
    const platforms = [
      { rx: 350, y: groundY - 70, w: 120 },
      { rx: 700, y: groundY - 100, w: 100 },
      { rx: 1100, y: groundY - 80, w: 130 },
      { rx: 1500, y: groundY - 110, w: 110 },
    ];

    // Spawn enemy pool
    const spawnEnemy = () => {
      enemies.push({
        rx: scrollX + canvas.width + 60 + Math.random() * 200,
        y: groundY - 40,
        w: 28, h: 40,
        vx: -(1.5 + Math.random() * 1.5) * diffMulti,
        alive: true,
        shootCd: Math.floor(Math.random() * 120 + 60),
        bullets: [],
      });
    };

    for (let i = 0; i < 3; i++) spawnEnemy();

    // Controls
    const keys = {};
    const onKeyDown = (e) => {
      keys[e.key] = true;
      if ((e.key === ' ' || e.key === 'z' || e.key === 'Z') && P.alive) {
        // Fire
        bullets.push({ rx: scrollX + P.x + (P.facing > 0 ? P.w : 0), y: P.y + 14, vx: 12 * P.facing, alive: true });
        P.shooting = true;
        setTimeout(() => { P.shooting = false; }, 120);
      }
    };
    const onKeyUp = (e) => { keys[e.key] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const addExplosion = (rx, y) => {
      explosions.push({ rx, y, life: 18, r: 4 });
    };

    const loop = () => {
      animId = requestAnimationFrame(loop);
      if (!P.alive || isPaused) return;

      frame++;

      // --- Player movement ---
      if (keys['ArrowLeft'] || keys['a']) { P.vx = -4; P.facing = -1; }
      else if (keys['ArrowRight'] || keys['d']) { P.vx = 4; P.facing = 1; }
      else P.vx = 0;

      if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && P.onGround) {
        P.vy = -11;
        P.onGround = false;
      }

      P.vy += 0.45;
      P.x += P.vx;
      P.y += P.vy;

      // Scroll with player
      if (P.x > 200) { scrollX += P.vx; P.x = 200; }
      if (P.x < 40) P.x = 40;

      // Ground collision
      if (P.y + P.h >= groundY) { P.y = groundY - P.h; P.vy = 0; P.onGround = true; }

      // Platform collision
      platforms.forEach(pl => {
        const px = pl.rx - scrollX;
        if (P.x + P.w > px && P.x < px + pl.w && P.y + P.h >= pl.y && P.y + P.h <= pl.y + 18 && P.vy >= 0) {
          P.y = pl.y - P.h;
          P.vy = 0;
          P.onGround = true;
        }
      });

      // Score: distance
      score = Math.floor(scrollX / 2) + (enemies.filter(e => !e.alive).length * 200);
      if (frame % 6 === 0 && onScoreUpdate) onScoreUpdate(score);

      // Spawn more enemies
      if (frame % Math.floor(160 / diffMulti) === 0) spawnEnemy();

      // --- Player bullets ---
      bullets.forEach((b, bi) => {
        if (!b.alive) return;
        b.rx += b.vx;
        const bsx = b.rx - scrollX;
        if (bsx < -20 || bsx > canvas.width + 20) { b.alive = false; return; }
        // Hit enemies
        enemies.forEach(e => {
          if (!e.alive) return;
          const ex = e.rx - scrollX;
          if (bsx > ex && bsx < ex + e.w && b.y > e.y && b.y < e.y + e.h) {
            e.alive = false;
            b.alive = false;
            score += 200;
            addExplosion(e.rx, e.y);
          }
        });
      });
      bullets = bullets.filter(b => b.alive);

      // --- Enemies ---
      enemies.forEach((e, ei) => {
        if (!e.alive) return;
        e.rx += e.vx;
        const ex = e.rx - scrollX;
        if (ex < -60) { enemies.splice(ei, 1); return; }

        // Enemy shoot
        e.shootCd--;
        if (e.shootCd <= 0) {
          e.bullets.push({ rx: e.rx - 10, y: e.y + 14, vx: -5 });
          e.shootCd = Math.floor(120 / diffMulti);
        }

        // Enemy bullets
        e.bullets.forEach((eb, ebi) => {
          eb.rx += eb.vx;
          const ebx = eb.rx - scrollX;
          if (ebx < -30) { e.bullets.splice(ebi, 1); return; }
          // Hit player
          if (ebx > P.x && ebx < P.x + P.w && eb.y > P.y && eb.y < P.y + P.h) {
            P.alive = false;
            addExplosion(scrollX + P.x, P.y);
            setTimeout(() => onGameOver(score), 800);
          }
        });

        // Enemy touches player (melee)
        if (ex > P.x - 10 && ex < P.x + P.w && e.y > P.y - 10 && e.y < P.y + P.h + 10) {
          P.alive = false;
          addExplosion(scrollX + P.x, P.y);
          setTimeout(() => onGameOver(score), 800);
        }
      });

      // Explosions
      explosions.forEach((ex2, i) => {
        ex2.life--;
        ex2.r += 1.5;
        if (ex2.life <= 0) explosions.splice(i, 1);
      });

      // --- RENDER ---
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background mountains
      ctx.fillStyle = 'rgba(0,255,102,0.04)';
      [60, 120, 180, 260, 340, 420, 520].forEach((bx, i) => {
        const sx = ((bx - scrollX * 0.2) % (canvas.width + 100) + canvas.width + 100) % (canvas.width + 100) - 50;
        ctx.beginPath();
        ctx.moveTo(sx, groundY);
        ctx.lineTo(sx + 80, groundY - 100 - i * 12);
        ctx.lineTo(sx + 160, groundY);
        ctx.fill();
      });

      // Ground
      ctx.fillStyle = '#1A1C23';
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
      ctx.strokeStyle = '#FCEE09';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(canvas.width, groundY); ctx.stroke();

      // Platforms
      platforms.forEach(pl => {
        const px = pl.rx - scrollX;
        ctx.fillStyle = '#1A1C23';
        ctx.fillRect(px, pl.y, pl.w, 14);
        ctx.strokeStyle = '#00FF66';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, pl.y, pl.w, 14);
      });

      // Bullets
      bullets.forEach(b => {
        const bsx = b.rx - scrollX;
        ctx.fillStyle = '#FCEE09';
        ctx.beginPath();
        ctx.arc(bsx, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Enemies
      enemies.forEach(e => {
        if (!e.alive) return;
        const ex = e.rx - scrollX;
        // Body
        ctx.fillStyle = '#FF003C';
        ctx.fillRect(ex, e.y, e.w, e.h);
        // Head
        ctx.fillStyle = '#FF6666';
        ctx.fillRect(ex + 4, e.y - 16, e.w - 8, 16);
        // Gun
        ctx.fillStyle = '#888';
        ctx.fillRect(ex - 8, e.y + 10, 14, 4);
        // Enemy bullets
        e.bullets.forEach(eb => {
          const ebx = eb.rx - scrollX;
          ctx.fillStyle = '#FF6600';
          ctx.beginPath(); ctx.arc(ebx, eb.y, 3, 0, Math.PI * 2); ctx.fill();
        });
      });

      // Player
      if (P.alive) {
        const px = P.x;
        ctx.save();
        if (P.facing === -1) { ctx.translate(px + P.w / 2, 0); ctx.scale(-1, 1); ctx.translate(-(px + P.w / 2), 0); }
        // Legs (running animation)
        const legOff = Math.sin(frame * 0.3) * 4;
        ctx.fillStyle = '#00FF66';
        ctx.fillRect(px + 2, P.y + P.h - 18 + legOff, 10, 18);
        ctx.fillRect(px + P.w - 12, P.y + P.h - 18 - legOff, 10, 18);
        // Body
        ctx.fillStyle = '#00CC44';
        ctx.fillRect(px, P.y, P.w, P.h - 18);
        // Head
        ctx.fillStyle = '#FCEE09';
        ctx.fillRect(px + 4, P.y - 18, P.w - 8, 18);
        // Bandana
        ctx.fillStyle = '#FF003C';
        ctx.fillRect(px + 4, P.y - 18, P.w - 8, 6);
        // Gun / arm
        ctx.fillStyle = '#888';
        ctx.fillRect(P.shooting ? px + P.w - 2 : px + P.w - 4, P.y + 10, 14, 4);
        ctx.restore();
      }

      // Explosions
      explosions.forEach(ex2 => {
        const esx = ex2.rx - scrollX;
        ctx.globalAlpha = ex2.life / 18;
        ctx.fillStyle = '#FF6600';
        ctx.beginPath(); ctx.arc(esx, ex2.y + 20, ex2.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FCEE09';
        ctx.beginPath(); ctx.arc(esx, ex2.y + 20, ex2.r * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });

      // HUD
      ctx.fillStyle = '#00FF66';
      ctx.font = 'bold 13px "Share Tech Mono"';
      ctx.fillText(`SCORE: ${score.toLocaleString()}`, 14, 24);
      ctx.fillStyle = '#FCEE09';
      ctx.fillText(`LEVEL ${level || 1}  [SPACE/Z = SHOOT] [W/↑ = JUMP]`, 14, 44);
    };

    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isPaused, level]);

  return (
    <canvas ref={canvasRef} width={580} height={340}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015', display: 'block' }} />
  );
}
