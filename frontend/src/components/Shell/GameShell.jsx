import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submitScore } from '../../api/scores';
import { gameRegistry } from '../../games/registry';

export default function GameShell() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [rank, setRank] = useState(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [personalBest, setPersonalBest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [liveScore, setLiveScore] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [gameKey, setGameKey] = useState(0); // for restart

  const GameComponent = gameRegistry[slug];

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Pause on P key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (!gameOver) setIsPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver]);

  const handleGameOver = async (score) => {
    setFinalScore(score);
    setGameOver(true);

    if (user && !isGuest) {
      setSubmitting(true);
      try {
        const data = await submitScore(slug, score);
        setRank(data.rank);
        setIsNewBest(data.isNewBest);
        setPersonalBest(data.personalBest);
      } catch (err) {
        setSubmitError('Score could not be saved. Check backend connection.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRestart = () => {
    setGameOver(false);
    setIsPaused(false);
    setFinalScore(0);
    setRank(null);
    setIsNewBest(false);
    setSubmitError('');
    setLiveScore(0);
    setGameKey(k => k + 1);
  };

  const gameName = slug?.replace(/-/g, ' ').toUpperCase() || 'GAME';

  if (!GameComponent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p className="glow-red" style={{ fontFamily: 'var(--font-mono)' }}>[ ERROR: MISSION NOT FOUND — {slug} ]</p>
        <button className="cyber-btn" data-text="RETURN" onClick={() => navigate('/hub')}>← RETURN TO HUB</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* HUD Bar */}
      <div className="hud-bar">
        <button
          className="cyber-btn cyber-btn-sm"
          data-text="HUB"
          onClick={() => navigate('/hub')}
          style={{ padding: '6px 14px', fontSize: 12 }}
        >
          ← HUB
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 32 }}>
          <div className="hud-item">
            <span className="hud-label">MISSION</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: 'var(--accent-yellow)', letterSpacing: 2 }}>{gameName}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">SCORE</span>
            <span className="hud-value" style={{ fontSize: 22 }}>{liveScore.toLocaleString()}</span>
          </div>
          {personalBest && (
            <div className="hud-item">
              <span className="hud-label">BEST</span>
              <span className="hud-value" style={{ color: 'var(--accent-green)' }}>{personalBest.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user ? (
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: 9, color: 'var(--accent-green)', letterSpacing: 2 }}>
              {user.name.toUpperCase()}
            </span>
          ) : (
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: 9, color: 'var(--accent-orange)', letterSpacing: 2 }}>GUEST</span>
          )}
          <button
            className={`cyber-btn-outline cyber-btn-sm`}
            onClick={() => setIsPaused(p => !p)}
            disabled={gameOver}
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
        </div>
      </div>

      {/* Game area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Suspense fallback={
          <div style={{ textAlign: 'center' }}>
            <div className="crosshair-icon" style={{ fontSize: 48 }}>⊕</div>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: 16 }}>[ LOADING GAME... ]</p>
          </div>
        }>
          <GameComponent
            key={gameKey}
            onGameOver={handleGameOver}
            isPaused={isPaused}
            isMobile={isMobile}
            onScoreUpdate={setLiveScore}
          />
        </Suspense>

        {/* Pause overlay */}
        {isPaused && !gameOver && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(15,16,21,0.88)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 24, zIndex: 50,
          }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 64, color: 'var(--accent-yellow)', letterSpacing: 4 }}>PAUSED</div>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 }}>[ PRESS P OR ESC TO RESUME ]</div>
            <button className="cyber-btn" data-text="RESUME MISSION" onClick={() => setIsPaused(false)}>
              ▶ RESUME MISSION
            </button>
          </div>
        )}

        {/* Game Over overlay */}
        {gameOver && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(15,16,21,0.92)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 16, zIndex: 50, animation: 'fadeIn 0.3s ease',
          }}>
            <div className="cyber-panel cyber-corner" style={{ padding: '40px 56px', textAlign: 'center', maxWidth: 480, width: '90%' }}>
              {isNewBest && (
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontSize: 13, marginBottom: 8, animation: 'pulse 1s ease-in-out infinite' }}>
                  ★ NEW HIGH SCORE! ★
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 52, color: 'var(--accent-red)', letterSpacing: 4, marginBottom: 8 }}>
                MISSION OVER
              </div>
              <div style={{ marginBottom: 24 }}>
                <div className="hud-label">FINAL SCORE</div>
                <div className="hud-value" style={{ fontSize: 48 }}>{finalScore.toLocaleString()}</div>
              </div>

              {submitting && (
                <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>
                  [ TRANSMITTING SCORE... ]
                </p>
              )}

              {rank && !submitting && (
                <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 20 }}>
                  <div>
                    <div className="hud-label">YOUR RANK</div>
                    <div className="hud-value" style={{ color: rank <= 3 ? 'var(--accent-green)' : 'var(--accent-yellow)' }}>
                      #{rank}
                    </div>
                  </div>
                  {personalBest && (
                    <div>
                      <div className="hud-label">PERSONAL BEST</div>
                      <div className="hud-value" style={{ color: 'var(--accent-green)' }}>{personalBest.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              )}

              {!user && !isGuest && (
                <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)', fontSize: 12, marginBottom: 16 }}>
                  [ LOGIN TO SAVE YOUR SCORE ]
                </p>
              )}
              {isGuest && (
                <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)', fontSize: 12, marginBottom: 16 }}>
                  [ GUEST MODE — SCORE NOT SAVED ]
                </p>
              )}
              {submitError && (
                <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-red)', fontSize: 11, marginBottom: 12 }}>⚠ {submitError}</p>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="cyber-btn" data-text="REDEPLOY" onClick={handleRestart}>
                  ↺ REDEPLOY
                </button>
                <button className="cyber-btn-outline" onClick={() => navigate(`/leaderboard/${slug}`)}>
                  🏆 LEADERBOARD
                </button>
                <button className="cyber-btn-outline" onClick={() => navigate('/hub')}>
                  ← HUB
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
