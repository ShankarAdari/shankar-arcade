import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer, getPlayers } from '../context/PlayerContext';

const BOOT_LINES = [
  '[ SYSTEM INITIALIZING... ]',
  '[ SHANKAR\'S ARCADE COLLECTION ]',
  '[ TACTICAL GAMING SUITE v2.0 ]',
  '[ 12 MISSIONS LOADED ]',
  '[ IDENTIFY OPERATIVE TO DEPLOY ]',
];

export default function Landing() {
  const navigate = useNavigate();
  const { currentPlayer, startAsPlayer } = usePlayer();
  const [bootStep, setBootStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [prevPlayers, setPrevPlayers] = useState([]);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Redirect if already have a player session
  useEffect(() => {
    if (currentPlayer) {
      navigate('/hub');
    }
  }, [currentPlayer]);

  // Boot sequence
  useEffect(() => {
    if (bootStep < BOOT_LINES.length) {
      const t = setTimeout(() => setBootStep(s => s + 1), 300 + bootStep * 120);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setReady(true);
        setPrevPlayers(getPlayers());
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [bootStep]);

  const handleEnter = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('[ OPERATIVE NAME REQUIRED ]'); return; }
    startAsPlayer(trimmed);
    navigate('/hub');
  };

  const handleSelectPlayer = (playerName) => {
    startAsPlayer(playerName);
    navigate('/hub');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEnter();
  };

  return (
    <div className="landing-wrapper">
      {/* Animated grid lines background */}
      <div className="grid-bg" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid-line-h" style={{ top: `${i * 10}%`, animationDelay: `${i * 0.2}s` }} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid-line-v" style={{ left: `${i * 10}%`, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>

      {/* Crosshair */}
      <div className="crosshair-bg" aria-hidden="true">⊕</div>

      {/* Central HUD Panel */}
      <div className="landing-panel cyber-panel cyber-corner">
        {/* Boot sequence */}
        <div className="boot-lines">
          {BOOT_LINES.slice(0, bootStep).map((line, i) => (
            <div key={i} className="boot-line" style={{ animationDelay: `${i * 0.05}s` }}>
              {line}
            </div>
          ))}
        </div>

        {ready && (
          <div className="landing-form">
            {/* Name input */}
            <div className="form-group">
              <label className="mono-label">[ ENTER OPERATIVE NAME ]</label>
              <div className="input-row">
                <span className="input-prefix">&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  className="cyber-input"
                  placeholder="YOUR NAME..."
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  maxLength={24}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              {error && <p className="error-text">{error}</p>}
              <button className="cyber-btn" style={{ marginTop: 12, width: '100%' }} onClick={handleEnter}>
                ▶ DEPLOY TO ARCADE
              </button>
            </div>

            {/* Previous Players */}
            {prevPlayers.length > 0 && (
              <div className="prev-players">
                <div className="mono-label" style={{ marginBottom: 10 }}>[ RETURNING OPERATIVES ]</div>
                <div className="players-grid">
                  {prevPlayers
                    .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
                    .slice(0, 6)
                    .map((p) => {
                      const totalGames = Object.values(p.scores || {}).reduce((acc, arr) => acc + arr.length, 0);
                      const topScore = Object.values(p.scores || {}).flatMap(arr => arr.map(s => s.score));
                      const best = topScore.length > 0 ? Math.max(...topScore) : 0;
                      return (
                        <button
                          key={p.name}
                          className="player-card"
                          onClick={() => handleSelectPlayer(p.name)}
                        >
                          <div className="player-avatar">{p.name.charAt(0).toUpperCase()}</div>
                          <div className="player-info">
                            <div className="player-name">{p.name}</div>
                            <div className="player-stats">
                              <span>{totalGames} RUNS</span>
                              {best > 0 && <span>BEST: {best.toLocaleString()}</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .landing-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: var(--bg-primary);
        }
        .grid-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .grid-line-h {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: rgba(252,238,9,0.04);
          animation: gridPulse 4s ease-in-out infinite;
        }
        .grid-line-v {
          position: absolute;
          top: 0; bottom: 0;
          width: 1px;
          background: rgba(252,238,9,0.04);
          animation: gridPulse 4s ease-in-out infinite;
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .crosshair-bg {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-size: 600px;
          color: rgba(252,238,9,0.025);
          animation: spin 30s linear infinite;
          pointer-events: none;
          z-index: 0;
          line-height: 1;
        }
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .landing-panel {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 520px;
          padding: 36px 32px;
          margin: 24px;
        }
        .boot-lines {
          margin-bottom: 24px;
          min-height: 120px;
        }
        .boot-line {
          font-family: var(--font-hud);
          font-size: 13px;
          color: var(--accent-green);
          letter-spacing: 2px;
          padding: 3px 0;
          animation: fadeIn 0.3s ease forwards;
        }
        .boot-line:first-child { color: var(--text-muted); }
        .boot-line:nth-child(2) {
          font-family: var(--font-title);
          font-size: 28px;
          color: var(--accent-yellow);
          letter-spacing: 4px;
          margin: 6px 0;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .landing-form {
          animation: fadeIn 0.5s ease forwards;
        }
        .form-group {
          margin-bottom: 24px;
        }
        .input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          border: 1px solid var(--accent-yellow);
          background: rgba(252,238,9,0.05);
          padding: 2px 8px;
        }
        .input-prefix {
          font-family: var(--font-hud);
          color: var(--accent-yellow);
          font-size: 18px;
          flex-shrink: 0;
        }
        .cyber-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: var(--font-hud);
          font-size: 16px;
          color: var(--text-primary);
          padding: 10px 4px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .cyber-input::placeholder {
          color: rgba(232,232,232,0.2);
          font-size: 12px;
          letter-spacing: 1px;
        }
        .error-text {
          font-family: var(--font-hud);
          font-size: 11px;
          color: var(--accent-red);
          margin-top: 6px;
          letter-spacing: 1px;
        }
        .prev-players {
          border-top: 1px solid rgba(252,238,9,0.15);
          padding-top: 20px;
        }
        .players-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .player-card {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(252,238,9,0.05);
          border: 1px solid rgba(252,238,9,0.2);
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          color: inherit;
        }
        .player-card:hover {
          background: rgba(252,238,9,0.12);
          border-color: var(--accent-yellow);
          transform: translateY(-2px);
        }
        .player-avatar {
          width: 36px;
          height: 36px;
          background: var(--accent-yellow);
          color: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-title);
          font-size: 20px;
          font-weight: 900;
          flex-shrink: 0;
        }
        .player-name {
          font-family: var(--font-hud);
          font-size: 12px;
          color: var(--accent-yellow);
          letter-spacing: 1px;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 110px;
        }
        .player-stats {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-family: var(--font-mono);
          font-size: 9px;
          color: var(--text-muted);
          letter-spacing: 1px;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
