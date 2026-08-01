import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/Auth/AuthModal';
import { getGames } from '../api/games';

const GENRE_COLORS = {
  'Shooter': 'genre-shooter',
  'Arcade': 'genre-arcade',
  'Puzzle': 'genre-puzzle',
  'Endless Runner': 'genre-runner',
  'Reflex': 'genre-reflex',
};

const GAME_ICONS = {
  'space-invaders': '👾',
  'missile-defense': '🚀',
  'asteroid-blaster': '☄️',
  'zombie-survival': '🧟',
  'snake': '🐍',
  'flappy-bird': '✈️',
  'breakout': '🧱',
  'whack-a-mole': '🎯',
  'memory-match': '🃏',
  '2048': '🔢',
  'tetris': '🟦',
  'pacman': '👻',
};

export default function Hub() {
  const navigate = useNavigate();
  const { user, isGuest, logout } = useAuth();
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user && !isGuest) navigate('/');
  }, [user, isGuest]);

  useEffect(() => {
    getGames()
      .then((data) => setGames(data.games || []))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  const genres = ['ALL', ...new Set(games.map(g => g.genre))];

  const filtered = games.filter(g => {
    const matchGenre = filter === 'ALL' || g.genre === filter;
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-yellow)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: 28, color: 'var(--accent-yellow)', letterSpacing: 3 }}>
            ⊕ SHANKAR'S ARCADE
          </span>
          <span className="boot-item boot-1" style={{ fontFamily: 'var(--font-hud)', fontSize: 9, color: 'var(--accent-green)', letterSpacing: 2, opacity: 1, transform: 'none' }}>[ ONLINE ]</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 }}>
                OPERATIVE: <span style={{ color: 'var(--accent-yellow)' }}>{user.name.toUpperCase()}</span>
              </span>
              <button onClick={() => navigate('/leaderboard')} className="cyber-btn-outline cyber-btn-sm">RANKS</button>
              <button onClick={logout} className="cyber-btn cyber-btn-red cyber-btn-sm" data-text="LOGOUT">LOGOUT</button>
            </>
          ) : (
            <>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-orange)', fontSize: 12 }}>[ GUEST MODE ]</span>
              <button onClick={() => setShowAuth(true)} className="cyber-btn cyber-btn-sm" data-text="LOGIN">LOGIN</button>
            </>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 }}>
        {/* Title */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-hud)', fontSize: 11, color: 'var(--accent-green)', letterSpacing: 4, marginBottom: 8 }}>
            ── SELECT MISSION ──
          </div>
          <h1 className="title-lg" style={{ marginBottom: 4 }}>MISSION CONTROL</h1>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 }}>
            {filtered.length} MISSIONS AVAILABLE
          </p>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 28, justifyContent: 'center' }}>
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              style={{
                fontFamily: 'var(--font-hud)', fontSize: 10, letterSpacing: 2,
                padding: '6px 14px', border: '1px solid',
                borderColor: filter === g ? 'var(--accent-yellow)' : 'rgba(252,238,9,0.2)',
                background: filter === g ? 'rgba(252,238,9,0.1)' : 'transparent',
                color: filter === g ? 'var(--accent-yellow)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.15s', textTransform: 'uppercase',
              }}
            >
              {g}
            </button>
          ))}
          <input
            className="cyber-input"
            placeholder="SEARCH MISSIONS..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 200, fontSize: 12, padding: '6px 12px' }}
          />
        </div>

        {/* Game grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <div className="crosshair-icon">⊕</div>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: 16 }}>[ LOADING MISSION FILES... ]</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {filtered.map((game, i) => (
              <GameCard key={game.id} game={game} index={i} onPlay={() => navigate(`/game/${game.slug}`)} onLeaderboard={() => navigate(`/leaderboard/${game.slug}`)} />
            ))}
          </div>
        )}
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

function GameCard({ game, index, onPlay, onLeaderboard }) {
  const icon = GAME_ICONS[game.slug] || '🎮';
  const tagClass = GENRE_COLORS[game.genre] || 'genre-arcade';

  return (
    <div
      className="game-card"
      style={{ borderRadius: 2, animation: `slideUp 0.3s ${index * 0.05}s both`, overflow: 'hidden' }}
    >
      {/* Thumbnail area */}
      <div style={{
        height: 140,
        background: `linear-gradient(135deg, var(--bg-secondary) 0%, #0D0F14 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 64, position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid rgba(252,238,9,0.1)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(252,238,9,0.01) 20px, rgba(252,238,9,0.01) 21px)' }} />
        {icon}
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <span className={`genre-tag ${tagClass}`}>{game.genre}</span>
        </div>
        {game.personalBest != null && (
          <div style={{ position: 'absolute', top: 8, right: 8, fontFamily: 'var(--font-hud)', fontSize: 9, color: 'var(--accent-green)', letterSpacing: 1 }}>
            ★ {game.personalBest.toLocaleString()}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px' }}>
        <h3 style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--text-primary)', letterSpacing: 2, marginBottom: 6 }}>
          {game.title.toUpperCase()}
        </h3>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14, minHeight: 34 }}>
          {game.description}
        </p>
        {game.personalBest != null && (
          <div style={{ fontFamily: 'var(--font-hud)', fontSize: 9, color: 'var(--accent-green)', letterSpacing: 2, marginBottom: 10 }}>
            BEST SCORE: <span style={{ color: 'var(--accent-yellow)' }}>{game.personalBest.toLocaleString()}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="cyber-btn cyber-btn-sm" data-text="DEPLOY" onClick={onPlay} style={{ flex: 1, justifyContent: 'center' }}>
            ▶ DEPLOY
          </button>
          <button className="cyber-btn-outline cyber-btn-sm" onClick={onLeaderboard} style={{ padding: '7px 12px' }} title="Leaderboard">
            🏆
          </button>
        </div>
      </div>
    </div>
  );
}
