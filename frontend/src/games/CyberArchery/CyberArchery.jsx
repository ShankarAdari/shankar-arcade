import { useEffect, useRef } from 'react';

export default function CyberArchery({ onGameOver, isPaused, onScoreUpdate }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let score = 0;
    let arrowsLeft = 10;
    let aimY = canvas.height / 2;
    let isDrawing = false;
    let drawPower = 0;

    let arrow = null; // { x, y, vx, vy, stuck: false }
    let wind = (Math.random() - 0.5) * 2; // Wind speed

    const target = {
      x: canvas.width - 60,
      y: canvas.height / 2,
      r: 45
    };

    const handleMouseDown = () => {
      if (isPaused || arrow || arrowsLeft <= 0) return;
      isDrawing = true;
      drawPower = 0;
    };

    const handleMouseUp = () => {
      if (!isDrawing) return;
      isDrawing = false;
      arrowsLeft--;

      const speed = 10 + drawPower * 0.15;
      arrow = {
        x: 60,
        y: aimY,
        vx: speed,
        vy: 0,
        stuck: false
      };
    };

    const handleMouseMove = (e) => {
      if (isPaused || arrow) return;
      const rect = canvas.getBoundingClientRect();
      aimY = e.clientY - rect.top;
      aimY = Math.max(30, Math.min(canvas.height - 30, aimY));
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    const loop = () => {
      animationFrameId = requestAnimationFrame(loop);

      if (isPaused) return;

      // Charge Bow
      if (isDrawing && drawPower < 100) {
        drawPower += 2;
      }

      // Fly Arrow
      if (arrow && !arrow.stuck) {
        arrow.x += arrow.vx;
        arrow.y += arrow.vy + wind * 0.15; // Wind effect
        arrow.vy += 0.08; // Gravity drop

        // Check Target Hit
        const distFromCenter = Math.hypot(arrow.x - target.x, arrow.y - target.y);
        if (arrow.x >= target.x - 5 && distFromCenter <= target.r) {
          arrow.stuck = true;

          // Score calculation based on rings (10 to 1 pts)
          let points = 0;
          if (distFromCenter < 8) points = 10;
          else if (distFromCenter < 18) points = 8;
          else if (distFromCenter < 30) points = 5;
          else points = 2;

          score += points;
          if (onScoreUpdate) onScoreUpdate(score);

          // Prepare next arrow after delay
          setTimeout(() => {
            arrow = null;
            wind = (Math.random() - 0.5) * 3; // New wind for next shot
            if (arrowsLeft <= 0) {
              onGameOver(score);
            }
          }, 1200);
        }

        // Missed Target
        if (arrow && (arrow.x > canvas.width || arrow.y > canvas.height)) {
          arrow.stuck = true;
          setTimeout(() => {
            arrow = null;
            wind = (Math.random() - 0.5) * 3;
            if (arrowsLeft <= 0) {
              onGameOver(score);
            }
          }, 1000);
        }
      }

      // Render
      ctx.fillStyle = '#0F1015';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Archery Target Rings
      const ringColors = ['#FFFFFF', '#1A1C23', '#00FFFF', '#FF003C', '#FCEE09'];
      const ringRadii = [target.r, target.r * 0.8, target.r * 0.6, target.r * 0.4, target.r * 0.2];

      ringRadii.forEach((r, idx) => {
        ctx.fillStyle = ringColors[idx];
        ctx.beginPath();
        ctx.arc(target.x, target.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0F1015';
        ctx.stroke();
      });

      // Draw Bow & Aim Line
      ctx.strokeStyle = 'rgba(252,238,9,0.3)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(60, aimY);
      ctx.lineTo(canvas.width, aimY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bow Arc
      ctx.strokeStyle = '#FCEE09';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(40, aimY, 25, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();

      // String
      const pullOffset = isDrawing ? drawPower * 0.2 : 0;
      ctx.strokeStyle = '#00FF66';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40 + Math.cos(-Math.PI / 3) * 25, aimY + Math.sin(-Math.PI / 3) * 25);
      ctx.lineTo(40 - pullOffset, aimY);
      ctx.lineTo(40 + Math.cos(Math.PI / 3) * 25, aimY + Math.sin(Math.PI / 3) * 25);
      ctx.stroke();

      // Draw Arrow
      if (arrow) {
        ctx.strokeStyle = '#00FF66';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(arrow.x - 20, arrow.y);
        ctx.lineTo(arrow.x, arrow.y);
        ctx.stroke();

        ctx.fillStyle = '#FF003C';
        ctx.beginPath();
        ctx.arc(arrow.x, arrow.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // HUD Telemetry
      ctx.fillStyle = '#00FF66';
      ctx.font = '12px "Share Tech Mono"';
      ctx.fillText(`ARROWS REMAINING: ${arrowsLeft}`, 15, 25);
      ctx.fillText(`WIND DRIFT: ${wind.toFixed(1)} ${wind > 0 ? '→' : '←'}`, 15, 42);
      if (isDrawing) {
        ctx.fillStyle = '#FCEE09';
        ctx.fillText(`POWER: ${Math.floor(drawPower)}%`, 15, 60);
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPaused]);

  return (
    <canvas
      ref={canvasRef}
      width={520}
      height={380}
      style={{ border: '1px solid var(--accent-yellow)', background: '#0F1015', cursor: 'crosshair' }}
    />
  );
}
