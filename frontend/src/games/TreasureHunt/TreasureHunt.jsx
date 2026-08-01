import { useEffect, useRef } from 'react';

export default function TreasureHunt({ onGameOver, isPaused, onScoreUpdate, level }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const TILE = 32;
    const COLS = Math.floor(canvas.width / TILE);
    const ROWS = Math.floor(canvas.height / TILE);
    const diffMulti = 1 + ((level || 1) - 1) * 0.1;

    // Generate maze-like dungeon map
    // 0=floor, 1=wall, 2=treasure, 3=trap, 4=exit
    const map = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => {
        if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) return 1; // border walls
        if (r % 3 === 0 && c % 4 === 0) return 1; // interior pillars
        const rand = Math.random();
        if (rand < 0.12) return 1; // random walls
        if (rand < 0.18) return 2; // treasure
        if (rand < 0.23 * diffMulti) return 3; // trap
        return 0;
      })
    );

    // Place player start
    map[1][1] = 0;
    map[1][2] = 0;
    // Place exit
    map[ROWS - 2][COLS - 2] = 4;

    // Count treasures
    const totalTreasures = map.flat().filter(t => t === 2).length;
    let collected = 0;

    // Player
    const P = { tx: 1, ty: 1 }; // tile coords
    let px = 1 * TILE + TILE / 2; // pixel coords (centre)
    let py = 1 * TILE + TILE / 2;
    let moving = false;
    let targetPx = px, targetPy = py;
    let score = 0;
    let frame = 0;
    let alive = true;
    let won = false;

    // Enemies
    const numEnemies = Math.floor(3 + (level || 1) * 0.8);
    let enemies = [];
    for (let i = 0; i < numEnemies; i++) {
      let ex, ey;
      do {
        ex = 2 + Math.floor(Math.random() * (COLS - 4));
        ey = 2 + Math.floor(Math.random() * (ROWS - 4));
      } while (map[ey][ex] !== 0 || (ex < 4 && ey < 4));
      enemies.push({ tx: ex, ty: ey, px: ex * TILE + TILE / 2, py: ey * TILE + TILE / 2, moveCd: Math.floor(30 + Math.random() * 40) });
    }

    // Fog of war revealed set
    const revealed = new Set();
    const revealAround = (tx, ty, r = 3) => {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.hypot(dx, dy) <= r) revealed.add(`${tx + dx},${ty + dy}`);
        }
      }
    };
    revealAround(P.tx, P.ty, 4);

    // Particle effects
    let particles = [];
    const burst = (x, y, color) => {
      for (let i = 0; i < 8; i++) {
        particles.push({ x, y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 18, color });
      }
    };

    // Controls
    const move = (dx, dy) => {
      if (moving || !alive || won) return;
      const nx = P.tx + dx, ny = P.ty + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return;
      const tile = map[ny][nx];
      if (tile === 1) return; // wall

      P.tx = nx; P.ty = ny;
      targetPx = nx * TILE + TILE / 2;
      targetPy = ny * TILE + TILE / 2;
      moving = true;
      revealAround(P.tx, P.ty, 3);

      if (tile === 2) {
        map[ny][nx] = 0;
        collected++;
        score += 100;
        if (onScoreUpdate) onScoreUpdate(score);
        burst(targetPx, targetPy, '#FCEE09');
      }
      if (tile === 3) {
        burst(targetPx, targetPy, '#FF003C');
        alive = false;
        setTimeout(() => onGameOver(score), 900);
      }
      if (tile === 4) {
        score += (totalTreasures - collected === 0 ? 2000 : 500 + collected * 100);
        if (onScoreUpdate) onScoreUpdate(score);
        won = true;
        setTimeout(() => onGameOver(score), 1200);
      }
    };

    const onKeyDown = (e) => {
      if (isPaused) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') move(-1, 0);
      if (e.key === 'ArrowRight' || e.key === 'd') move(1, 0);
      if (e.key === 'ArrowUp' || e.key === 'w') move(0, -1);
      if (e.key === 'ArrowDown' || e.key === 's') move(0, 1);
    };
    window.addEventListener('keydown', onKeyDown);

    const loop = () => {
      animId = requestAnimationFrame(loop);
      if (isPaused) return;
      frame++;

      // Smooth player movement
      if (moving) {
        px += (targetPx - px) * 0.22;
        py += (targetPy - py) * 0.22;
        if (Math.abs(px - targetPx) < 1 && Math.abs(py - targetPy) < 1) {
          px = targetPx; py = targetPy;
          moving = false;
        }
      }

      // Enemy AI
      enemies.forEach((e) => {
        e.moveCd--;
        if (e.moveCd <= 0) {
          e.moveCd = Math.floor((25 - (level || 1)) + Math.random() * 25);
          // Move toward player sometimes
          const chase = Math.random() < 0.55;
          let dx = 0, dy = 0;
          if (chase) {
            dx = P.tx > e.tx ? 1 : P.tx < e.tx ? -1 : 0;
            dy = P.ty > e.ty ? 1 : P.ty < e.ty ? -1 : 0;
            if (dx !== 0 && dy !== 0) (Math.random() < 0.5 ? (dy = 0) : (dx = 0));
          } else {
            const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
            [dx, dy] = dirs[Math.floor(Math.random() * 4)];
          }
          const nx = e.tx + dx, ny = e.ty + dy;
          if (nx >= 0 && ny >= 0 && nx < COLS && ny < ROWS && map[ny][nx] !== 1) {
            e.tx = nx; e.ty = ny;
            e.px = nx * TILE + TILE / 2;
            e.py = ny * TILE + TILE / 2;
          }
        }

        // Check collision with player
        if (e.tx === P.tx && e.ty === P.ty && alive) {
          alive = false;
          burst(px, py, '#FF003C');
          setTimeout(() => onGameOver(score), 900);
        }
      });

      // Particles
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      });

      // ===== RENDER =====
      ctx.fillStyle = '#080A0E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw tiles
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const tx = c * TILE, ty = r * TILE;
          const isRevealed = revealed.has(`${c},${r}`);
          const tile = map[r][c];

          if (!isRevealed) {
            ctx.fillStyle = '#050608';
            ctx.fillRect(tx, ty, TILE, TILE);
            continue;
          }

          if (tile === 1) {
            ctx.fillStyle = '#1A1C23';
            ctx.fillRect(tx, ty, TILE, TILE);
            ctx.strokeStyle = 'rgba(252,238,9,0.12)';
            ctx.lineWidth = 1;
            ctx.strokeRect(tx, ty, TILE, TILE);
            // Stone texture
            ctx.strokeStyle = 'rgba(100,100,110,0.2)';
            ctx.beginPath();
            ctx.moveTo(tx, ty + TILE * 0.5); ctx.lineTo(tx + TILE, ty + TILE * 0.5);
            ctx.stroke();
          } else if (tile === 0) {
            ctx.fillStyle = '#0F1015';
            ctx.fillRect(tx, ty, TILE, TILE);
            ctx.strokeStyle = 'rgba(252,238,9,0.04)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(tx, ty, TILE, TILE);
          } else if (tile === 2) {
            ctx.fillStyle = '#0F1015';
            ctx.fillRect(tx, ty, TILE, TILE);
            // Treasure chest glow
            ctx.shadowColor = '#FCEE09';
            ctx.shadowBlur = 8 + Math.sin(frame * 0.08) * 3;
            ctx.fillStyle = '#FCEE09';
            ctx.fillRect(tx + 7, ty + 10, TILE - 14, TILE - 16);
            ctx.fillStyle = '#FF6600';
            ctx.fillRect(tx + 7, ty + 10, TILE - 14, 7);
            ctx.shadowBlur = 0;
          } else if (tile === 3) {
            ctx.fillStyle = '#0F1015';
            ctx.fillRect(tx, ty, TILE, TILE);
            // Trap spike
            ctx.fillStyle = '#FF003C';
            ctx.font = '18px serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚠', tx + TILE / 2, ty + TILE * 0.72);
            ctx.textAlign = 'left';
          } else if (tile === 4) {
            ctx.fillStyle = '#001a00';
            ctx.fillRect(tx, ty, TILE, TILE);
            // Exit portal glow
            ctx.shadowColor = '#00FF66';
            ctx.shadowBlur = 10 + Math.sin(frame * 0.1) * 4;
            ctx.strokeStyle = '#00FF66';
            ctx.lineWidth = 2;
            ctx.strokeRect(tx + 3, ty + 3, TILE - 6, TILE - 6);
            ctx.fillStyle = '#00FF66';
            ctx.font = '18px serif';
            ctx.textAlign = 'center';
            ctx.fillText('▶', tx + TILE / 2, ty + TILE * 0.72);
            ctx.textAlign = 'left';
            ctx.shadowBlur = 0;
          }
        }
      }

      // Enemies
      enemies.forEach(e => {
        if (!revealed.has(`${e.tx},${e.ty}`)) return;
        ctx.fillStyle = '#FF003C';
        ctx.beginPath();
        ctx.arc(e.px, e.py, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0F1015';
        ctx.fillRect(e.px - 5, e.py - 5, 4, 4);
        ctx.fillRect(e.px + 1, e.py - 5, 4, 4);
      });

      // Particles
      particles.forEach(p => {
        ctx.globalAlpha = p.life / 18;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Player
      if (alive) {
        const bob = Math.sin(frame * 0.2) * 1.5;
        ctx.shadowColor = '#00FF66';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#00FF66';
        ctx.fillRect(px - 10, py - 14 + bob, 20, 28);
        ctx.fillStyle = '#FCEE09';
        ctx.fillRect(px - 7, py - 26 + bob, 14, 14);
        ctx.fillStyle = '#FF003C'; // hat
        ctx.fillRect(px - 7, py - 28 + bob, 14, 5);
        ctx.shadowBlur = 0;
      }

      // HUD bar
      ctx.fillStyle = 'rgba(10,12,16,0.88)';
      ctx.fillRect(0, 0, canvas.width, 50);
      ctx.fillStyle = '#FCEE09';
      ctx.font = 'bold 13px "Share Tech Mono"';
      ctx.fillText(`SCORE: ${score.toLocaleString()}`, 12, 20);
      ctx.fillStyle = '#00FF66';
      ctx.font = '11px "Share Tech Mono"';
      ctx.fillText(`TREASURE: ${collected}/${totalTreasures}  [WASD/ARROWS]  LVL ${level || 1}`, 12, 40);
      ctx.fillStyle = won ? '#00FF66' : alive ? '#FCEE09' : '#FF003C';
      ctx.textAlign = 'right';
      ctx.font = 'bold 13px "Share Tech Mono"';
      ctx.fillText(won ? 'EXIT REACHED!' : alive ? 'REACH THE EXIT ▶' : 'DEAD!', canvas.width - 12, 20);
      ctx.textAlign = 'left';
    };

    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isPaused, level]);

  return (
    <canvas ref={canvasRef} width={512} height={448}
      style={{ border: '1px solid var(--accent-yellow)', background: '#080A0E', display: 'block' }} />
  );
}
