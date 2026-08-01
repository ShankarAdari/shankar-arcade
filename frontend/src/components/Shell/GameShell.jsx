import { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import { gameRegistry } from '../../games/registry';

export default function GameShell() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentPlayer, submitScore, getPersonalBest } = usePlayer();

  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);

  const GameComponent = gameRegistry[slug];

  useEffect(() => {
    if (!currentPlayer) {
      navigate('/');
    }
  }, [currentPlayer]);

  // Pause hotkey (P key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'p' || e.key === 'P') {
        if (!gameOver) setIsPaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  const handleGameOver = (finalScore) => {
    setScore(finalScore);
    setGameOver(true);
    const res = submitScore(slug, finalScore);
    setResult(res);
  };

  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setResult(null);
  };

  if (!currentPlayer) return null;
  const pb = getPersonalBest(slug);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Top HUD Bar */}
      <div className="cyber-panel" style={{ width: '100%', maxWidth: 700, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="cyber-btn cyber-btn-outline cyber-btn-sm" onClick={() => navigate('/hub')}>
          ← HUB
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--accent-yellow)' }}>
            {slug?.replace(/-/g, ' ')?.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-hud)', fontSize: 10, color: 'var(--text-muted)' }}>
            BEST: {pb !== null ? pb.toLocaleString() : '---'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-hud)', fontSize: 18, color: 'var(--accent-green)', fontWeight: 700 }}>
            SCORE: {score.toLocaleString()}
          </div>
          <button className="cyber-btn cyber-btn-sm" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>

      {/* Main Game Canvas Container */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 700, display: 'flex', justifyContent: 'center' }}>
        {GameComponent ? (
          <Suspense fallback={<div style={{ padding: 64, color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)' }}>[ LOADING MISSION DATA... ]</div>}>
            <GameComponent
              onGameOver={handleGameOver}
              isPaused={isPaused || gameOver}
              onScoreUpdate={setScore}
            />
          </Suspense>
        ) : (
          <div style={{ color: 'var(--accent-red)', padding: 32 }}>Mission Component Not Found</div>
        )}

        {/* Pause Overlay */}
        {isPaused && !gameOver && (
          <div className="cyber-panel" style={{ position: 'absolute', inset: 0, background: 'rgba(15, 16, 21, 0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <h2 className="title-lg" style={{ marginBottom: 16 }}>MISSION PAUSED</h2>
            <p style={{ fontFamily: 'var(--font-hud)', color: 'var(--accent-green)', marginBottom: 24 }}>PRESS 'P' OR CLICK TO RESUME</p>
            <button className="cyber-btn" onClick={() => setIsPaused(false)}>RESUME MISSION</button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="cyber-panel" style={{ position: 'absolute', inset: 0, background: 'rgba(15, 16, 21, 0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20, padding: 32 }}>
            <h2 className="title-lg" style={{ color: 'var(--accent-red)', marginBottom: 8 }}>MISSION COMPLETE</h2>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: 28, color: 'var(--accent-yellow)', marginBottom: 16 }}>
              FINAL SCORE: {score.toLocaleString()}
            </div>

            {result?.isNewBest && (
              <div style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-hud)', fontSize: 16, marginBottom: 16, letterSpacing: 2 }}>
                🎉 NEW PERSONAL BEST! 🎉
              </div>
            )}

            {result?.rank && (
              <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-hud)', fontSize: 14, marginBottom: 24 }}>
                YOUR RANK: #{result.rank}
              </div>
            )}

            <div style={{ display: 'flex', gap: 16 }}>
              <button className="cyber-btn" onClick={handleRestart}>RETRY MISSION</button>
              <button className="cyber-btn cyber-btn-outline" onClick={() => navigate('/hub')}>RETURN TO HUB</button>
              <button className="cyber-btn cyber-btn-outline" onClick={() => navigate(`/leaderboard/${slug}`)}>LEADERBOARD</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
