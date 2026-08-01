import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/Auth/AuthModal';

const BOOT_LINES = [
  '[ SYSTEM BOOT: INITIATED... ]',
  '[ TACTICAL GRID: ONLINE ]',
  '[ WEAPONS SYSTEMS: READY ]',
  '[ 12 MISSION PROFILES LOADED ]',
  '[ OPERATIVE AUTHENTICATION: STANDBY ]',
  '[ SHANKAR ARCADE COLLECTION v2.0 ]',
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, isGuest, playAsGuest } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (user || isGuest) navigate('/hub');
  }, [user, isGuest]);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Animated bg grid lines */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${i * 14}%`, top: 0, bottom: 0, width: 1,
            background: `linear-gradient(180deg, transparent, rgba(252,238,9,${0.04 + i * 0.005}), transparent)`,
            animation: `pulse ${2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', top: `${i * 25}%`, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(0,255,102,0.06), transparent)',
            animation: `pulse ${3 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
          }} />
        ))}
      </div>

      {/* Large crosshair bg */}
      <div style={{ position: 'absolute', fontSize: 320, color: 'rgba(252,238,9,0.03)', userSelect: 'none', animation: 'reticleRotate 12s linear infinite', zIndex: 1 }}>⊕</div>

      {/* Main content */}
      <div className="cyber-panel cyber-corner" style={{ position: 'relative', zIndex: 2, padding: '48px 56px', maxWidth: 680, width: '90%', textAlign: 'center' }}>

        {/* Corner bracket accents */}
        <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderTop: '2px solid #FCEE09', borderLeft: '2px solid #FCEE09' }} />
        <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderTop: '2px solid #FCEE09', borderRight: '2px solid #FCEE09' }} />
        <div style={{ position: 'absolute', bottom: 8, left: 8, width: 20, height: 20, borderBottom: '2px solid #FCEE09', borderLeft: '2px solid #FCEE09' }} />
        <div style={{ position: 'absolute', bottom: 8, right: 8, width: 20, height: 20, borderBottom: '2px solid #FCEE09', borderRight: '2px solid #FCEE09' }} />

        {/* Boot lines */}
        <div style={{ textAlign: 'left', marginBottom: 32, minHeight: 120 }}>
          {BOOT_LINES.map((line, i) => (
            <div key={i} className={`boot-item boot-${i + 1}`} style={{ fontSize: 12 }}>{line}</div>
          ))}
        </div>

        {/* Title */}
        <div className="title-xl" style={{ marginBottom: 4, animation: 'bootUp 0.4s 1.5s both' }}>
          SHANKAR'S
        </div>
        <div className="title-xl" style={{ color: '#00FF66', marginBottom: 4, animation: 'bootUp 0.4s 1.6s both', textShadow: '0 0 20px rgba(0,255,102,0.6)' }}>
          ARCADE
        </div>
        <div className="title-xl" style={{ marginBottom: 28, animation: 'bootUp 0.4s 1.7s both' }}>
          COLLECTION
        </div>

        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12, letterSpacing: 2, marginBottom: 40, animation: 'bootUp 0.4s 1.9s both' }}>
          [ 12 TACTICAL MISSIONS — PROVE YOUR WORTH ]
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', animation: 'bootUp 0.4s 2.1s both' }}>
          <button
            className="cyber-btn"
            data-text="AUTHENTICATE &amp; DEPLOY"
            onClick={() => setShowAuth(true)}
            style={{ width: '100%', justifyContent: 'center', fontSize: 20, padding: '14px 32px' }}
          >
            ⚡ AUTHENTICATE & DEPLOY
          </button>
          <button
            className="cyber-btn-outline"
            onClick={playAsGuest}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            PLAY AS GUEST [ SCORES NOT SAVED ]
          </button>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 36, paddingTop: 24, borderTop: '1px solid rgba(252,238,9,0.15)', animation: 'bootUp 0.4s 2.3s both' }}>
          {[['12', 'GAMES'], ['∞', 'MISSIONS'], ['GLOBAL', 'LEADERBOARD']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--accent-yellow)' }}>{v}</div>
              <div style={{ fontFamily: 'var(--font-hud)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
