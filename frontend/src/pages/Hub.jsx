import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

const GAMES_DATA = [
  { slug: 'space-invaders',  title: 'Space Invaders',  genre: 'Shooter',       description: 'Defend Earth from descending alien waves' },
  { slug: 'missile-defense', title: 'Missile Defense', genre: 'Shooter',       description: 'Intercept incoming missiles before they destroy your base' },
  { slug: 'asteroid-blaster',title: 'Asteroid Blaster',genre: 'Shooter',       description: 'Rotate your ship and blast asteroids that split on impact' },
  { slug: 'zombie-survival', title: 'Zombie Survival', genre: 'Shooter',       description: 'Survive endless zombie waves in a post-apocalyptic warzone' },
  { slug: 'target-sniper',   title: 'Target Sniper',   genre: 'Shooter',       description: 'Precision tactical marksmanship target timing' },
  { slug: 'cyber-archery',   title: 'Cyber Archery',   genre: 'Shooter',       description: 'Bow simulator with wind drift physics & ring scoring' },
  { slug: 'cyber-shooter',   title: 'Cyber Shooter',   genre: 'Shooter',       description: 'Retro duck-hunt style drone shooter with ammo reloading' },
  { slug: 'rambo-run',       title: 'Rambo Run',        genre: 'Action',        description: 'Side-scroll commando shooter — run, jump, blast enemies!' },
  { slug: 'temple-run',      title: 'Temple Run',       genre: 'Endless Runner',description: '3-lane infinite runner — jump, duck, collect coins, survive!' },
  { slug: 'treasure-hunt',   title: 'Treasure Hunt',    genre: 'Adventure',     description: 'Dungeon crawler with fog of war, traps & enemy AI hunters' },
  { slug: 'cyber-mario',     title: 'Cyber Mario',      genre: 'Platformer',    description: 'Super Mario platformer with blocks, coins, Goombas & flag' },
  { slug: 'snake',           title: 'Snake',            genre: 'Arcade',        description: 'Classic snake — grow longer without hitting yourself' },
  { slug: 'flappy-bird',     title: 'Flappy Rocket',    genre: 'Endless Runner',description: 'Fly a rocket through enemy missile gaps' },
  { slug: 'cyber-racer',     title: 'Cyber Racer',      genre: 'Endless Runner',description: 'High-speed highway obstacle evasion' },
  { slug: 'cyber-drift',     title: 'Cyber Drift',      genre: 'Endless Runner',description: 'OutRun pseudo-3D arcade racing & nitro speed boost' },
  { slug: 'breakout',        title: 'Breakout',         genre: 'Arcade',        description: 'Destroy all bricks with your tactical bouncing shot' },
  { slug: 'whack-a-mole',    title: 'Whack-a-Mole',    genre: 'Reflex',        description: 'Destroy targets before they disappear' },
  { slug: 'laser-pong',      title: 'Laser Pong',       genre: 'Arcade',        description: 'High-speed neon laser paddle table tennis' },
  { slug: 'lunar-lander',    title: 'Lunar Lander',     genre: 'Arcade',        description: 'Control thrusters to safely land on plasma pads' },
  { slug: 'cyber-frogger',   title: 'Cyber Frogger',    genre: 'Arcade',        description: 'Cross busy cyber highways to reach safety' },
  { slug: 'memory-match',    title: 'Memory Match',     genre: 'Puzzle',        description: 'Match classified intel cards before time runs out' },
  { slug: '2048',            title: '2048',             genre: 'Puzzle',        description: 'Merge numbered tiles to reach 2048' },
  { slug: 'tetris',          title: 'Tetris',           genre: 'Puzzle',        description: 'Clear lines with falling tactical blocks' },
  { slug: 'pacman',          title: 'Pacman',           genre: 'Arcade',        description: 'Navigate the maze and evade enemy ghosts' },
  { slug: 'minesweeper',     title: 'Minesweeper',      genre: 'Puzzle',        description: 'Tactical minefield sector sweep and clearing' },
];

const GENRE_ICONS = {
  Shooter: '🎯', Action: '⚔️', 'Endless Runner': '🏃', Adventure: '🗺️',
  Platformer: '🍄', Arcade: '🕹️', Reflex: '⚡', Puzzle: '🧩'
};

export default function Hub() {
  const navigate = useNavigate();
  const { currentPlayer, levelInfo, logout, getPersonalBest } = usePlayer();
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { if (!currentPlayer) navigate('/'); }, [currentPlayer]);
  if (!currentPlayer) return null;

  const genres = ['ALL','Action','Shooter','Adventure','Platformer','Arcade','Puzzle','Endless Runner','Reflex'];

  const filteredGames = GAMES_DATA.filter(game => {
    const matchesGenre = selectedGenre === 'ALL' || game.genre === selectedGenre;
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 1240, margin: '0 auto' }}>
      {/* ── Header ── */}
      <header className="cyber-panel cyber-corner" style={{ padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 60, height: 60, background: 'var(--accent-yellow)', color: '#0F1015',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-title)', fontWeight: 900,
              boxShadow: '0 0 20px rgba(252,238,9,0.5)', flexShrink: 0
            }}>
              <span style={{ fontSize: 10, lineHeight: 1 }}>LVL</span>
              <span style={{ fontSize: 26, lineHeight: 1 }}>{levelInfo.level}</span>
            </div>
            <div>
              <h1 className="title-text" style={{ fontSize: 30, margin: 0 }}>SHANKAR'S ARCADE</h1>
              <div style={{ fontFamily: 'var(--font-hud)', fontSize: 12, color: 'var(--accent-green)', letterSpacing: 2 }}>
                OPERATIVE: {currentPlayer.name.toUpperCase()} &nbsp;|&nbsp; [{levelInfo.title}] &nbsp;|&nbsp; 25 MISSIONS
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="cyber-btn cyber-btn-outline cyber-btn-sm" onClick={() => navigate('/leaderboard')}>🏆 RANKS</button>
            <button className="cyber-btn cyber-btn-danger cyber-btn-sm" onClick={() => { logout(); navigate('/'); }}>SWITCH</button>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-hud)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>LEVEL {levelInfo.level} / 25 — {levelInfo.title}</span>
            <span>{levelInfo.currentXP.toLocaleString()} / {levelInfo.xpNeeded.toLocaleString()} XP</span>
          </div>
          <div style={{ background: 'rgba(252,238,9,0.08)', height: 8, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(252,238,9,0.25)' }}>
            <div style={{
              width: `${levelInfo.progressPercent}%`, height: '100%',
              background: 'linear-gradient(90deg, #00FF66 0%, #FCEE09 100%)',
              transition: 'width 0.5s ease',
              boxShadow: '0 0 8px rgba(0,255,102,0.6)'
            }} />
          </div>
        </div>
      </header>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {genres.map(g => (
            <button key={g}
              className={`cyber-btn cyber-btn-sm ${selectedGenre === g ? '' : 'cyber-btn-outline'}`}
              onClick={() => setSelectedGenre(g)}
            >
              {GENRE_ICONS[g] || ''} {g}
            </button>
          ))}
        </div>
        <input type="text" placeholder="SEARCH MISSIONS..."
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="cyber-input"
          style={{ width: 220, border: '1px solid var(--accent-yellow)', background: 'rgba(252,238,9,0.05)', padding: '6px 12px' }} />
      </div>

      {/* ── Game Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 18 }}>
        {filteredGames.map(game => {
          const pb = getPersonalBest(game.slug);
          return (
            <div key={game.slug} className="cyber-panel cyber-corner"
              style={{ padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span className="genre-tag">{(GENRE_ICONS[game.genre] || '') + ' ' + game.genre.toUpperCase()}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: 'var(--accent-yellow)', margin: '4px 0 8px' }}>
                  {game.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
                  {game.description}
                </p>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-hud)', fontSize: 11, color: pb !== null ? 'var(--accent-green)' : 'var(--text-muted)', marginBottom: 10 }}>
                  PERSONAL BEST: {pb !== null ? pb.toLocaleString() : '---'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="cyber-btn cyber-btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/game/${game.slug}`)}>▶ LAUNCH</button>
                  <button className="cyber-btn cyber-btn-outline cyber-btn-sm" onClick={() => navigate(`/leaderboard/${game.slug}`)}>🏆</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
