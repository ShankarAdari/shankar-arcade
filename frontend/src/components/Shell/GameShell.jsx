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

  // In-game dynamic Level 1 to 25 calculation based on score
  // Level N is reached every (N-1)*300 score
  const currentInGameLevel = Math.min(25, Math.floor(score / 300) + 1);
  const nextLevelScore = currentInGameLevel < 25 ? currentInGameLevel * 300 : 25 * 300;
  const currentLevelBaseScore = (currentInGameLevel - 1) * 300;
  const levelProgressPercent = currentInGameLevel === 25 ? 100 : Math.floor(((score - currentLevelBaseScore) / 300) * 100);

  const [prevLevel, setPrevLevel] = useState(1);
  const [showLevelUpBanner, setShowLevelUpBanner] = useState(false);

  // Detect Level Up trigger
  useEffect(() => {
    if (currentInGameLevel > prevLevel && currentInGameLevel <= 25) {
      setPrevLevel(currentInGameLevel);
      setShowLevelUpBanner(true);
      const timer = setTimeout(() => setShowLevelUpBanner(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [currentInGameLevel, prevLevel]);

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
    setPrevLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setResult(null);
  };

  if (!currentPlayer) return null;
  const pb = getPersonalBest(slug);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Top HUD Bar with Leveling Progress */}
      <div className="cyber-panel" style={{ width: '100%', maxWidth: 720, padding: '12px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <button className="cyber-btn cyber-btn-outline cyber-btn-sm" onClick={() => navigate('/hub')}>
            ← HUB
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--accent-yellow)' }}>
              {slug?.replace(/-/g, ' ')?.toUpperCase()}
            </div>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: 10, color: 'var(--text-muted)' }}>
              BEST: {pb !== null ? pb.toLocaleString() : '---'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-hud)', fontSize: 18, color: 'var(--accent-green)', fontWeight: 700 }}>
                SCORE: {score.toLocaleString()}
              </div>
              <div style={{ fontFamily: 'var(--font-hud)', fontSize: 11, color: 'var(--accent-yellow)' }}>
                LEVEL {currentInGameLevel} / 25
              </div>
            </div>
            <button className="cyber-btn cyber-btn-sm" onClick={() => setIsPaused(!isPaused)}>
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div style={{ background: 'rgba(252,238,9,0.1)', height: 6, borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(252,238,9,0.3)' }}>
          <div
            style={{
              width: `${levelProgressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00FF66 0%, #FCEE09 100%)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Main Game Canvas Container */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 720, display: 'flex', justifyContent: 'center' }}>
        {/* Level Up Flash Banner */}
        {showLevelUpBanner && (
          <div className="level-up-banner">
            ⚡ LEVEL UP! REACHED LEVEL {currentInGameLevel} / 25 ⚡
          </div>
        )}

        {GameComponent ? (
          <Suspense fallback={<div style={{ padding: 64, color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)' }}>[ LOADING MISSION DATA... ]</div>}>
            <GameComponent
              onGameOver={handleGameOver}
              isPaused={isPaused || gameOver}
              onScoreUpdate={setScore}
              level={currentInGameLevel}
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
          <div className="cyber-panel" style={{ position: 'absolute', inset: 0, background: 'rgba(15, 16, 21, 0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20, padding: 32 }}>
            <h2 className="title-lg" style={{ color: 'var(--accent-red)', marginBottom: 8 }}>MISSION COMPLETE</h2>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: 32, color: 'var(--accent-yellow)', marginBottom: 4 }}>
              FINAL SCORE: {score.toLocaleString()}
            </div>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: 14, color: 'var(--accent-green)', marginBottom: 16 }}>
              REACHED LEVEL {currentInGameLevel} / 25  (+{Math.floor(score * 1.5)} XP)
            </div>

            {result?.leveledUp && (
              <div style={{ color: 'var(--accent-yellow)', fontFamily: 'var(--font-hud)', fontSize: 18, marginBottom: 16, border: '1px solid var(--accent-yellow)', padding: '6px 16px', background: 'rgba(252,238,9,0.1)' }}>
                ⭐ PLAYER LEVELED UP TO LEVEL {result.newLevel}! TITLE: {result.newTitle} ⭐
              </div>
            )}

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

      <style>{`
        .level-up-banner {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          background: var(--accent-yellow);
          color: #0F1015;
          font-family: var(--font-title);
          font-size: 20px;
          padding: 8px 24px;
          border-radius: 4px;
          letter-spacing: 2px;
          box-shadow: 0 0 20px rgba(252, 238, 9, 0.8);
          animation: popPulse 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes popPulse {
          0% { transform: translate(-50%, -20px) scale(0.5); opacity: 0; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
