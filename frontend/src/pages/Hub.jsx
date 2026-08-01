import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

const GAMES_DATA = [
  { slug: 'space-invaders', title: 'Space Invaders', genre: 'Shooter', description: 'Defend Earth from descending alien waves' },
  { slug: 'missile-defense', title: 'Missile Defense', genre: 'Shooter', description: 'Intercept incoming missiles before they destroy your base' },
  { slug: 'asteroid-blaster', title: 'Asteroid Blaster', genre: 'Shooter', description: 'Rotate your ship and blast asteroids that split on impact' },
  { slug: 'zombie-survival', title: 'Zombie Survival', genre: 'Shooter', description: 'Survive endless zombie waves in a post-apocalyptic warzone' },
  { slug: 'target-sniper', title: 'Target Sniper', genre: 'Shooter', description: 'Precision tactical marksmanship target timing' },
  { slug: 'cyber-archery', title: 'Cyber Archery', genre: 'Shooter', description: 'Tactical bow simulator with wind drift physics & ring scoring' },
  { slug: 'cyber-shooter', title: 'Cyber Shooter', genre: 'Shooter', description: 'Retro duck-hunt style drone shooter with ammo reloading' },
  { slug: 'cyber-mario', title: 'Cyber Mario', genre: 'Platformer', description: 'Super Mario platformer with blocks, coins, Goombas & flag' },
  { slug: 'snake', title: 'Snake', genre: 'Arcade', description: 'Classic snake — grow longer without hitting yourself' },
  { slug: 'flappy-bird', title: 'Flappy Rocket', genre: 'Endless Runner', description: 'Fly a rocket through enemy missile gaps' },
  { slug: 'cyber-racer', title: 'Cyber Racer', genre: 'Endless Runner', description: 'High-speed highway obstacle evasion' },
  { slug: 'cyber-drift', title: 'Cyber Drift', genre: 'Endless Runner', description: 'OutRun pseudo 3D arcade racing & nitro speed boost' },
  { slug: 'breakout', title: 'Breakout', genre: 'Arcade', description: 'Destroy all bricks with your tactical bouncing shot' },
  { slug: 'whack-a-mole', title: 'Whack-a-Mole', genre: 'Reflex', description: 'Destroy targets before they disappear' },
  { slug: 'laser-pong', title: 'Laser Pong', genre: 'Arcade', description: 'High-speed neon laser paddle table tennis' },
  { slug: 'lunar-lander', title: 'Lunar Lander', genre: 'Arcade', description: 'Control thrusters to safely land on plasma pads' },
  { slug: 'cyber-frogger', title: 'Cyber Frogger', genre: 'Arcade', description: 'Cross busy cyber highways to reach safety' },
  { slug: 'memory-match', title: 'Memory Match', genre: 'Puzzle', description: 'Match classified intel cards before time runs out' },
  { slug: '2048', title: '2048', genre: 'Puzzle', description: 'Merge numbered tiles to reach 2048' },
  { slug: 'tetris', title: 'Tetris', genre: 'Puzzle', description: 'Clear lines with falling tactical blocks' },
  { slug: 'pacman', title: 'Pacman', genre: 'Arcade', description: 'Navigate the maze and evade enemy ghosts' },
  { slug: 'minesweeper', title: 'Minesweeper', genre: 'Puzzle', description: 'Tactical minefield sector sweep and clearing' },
];

export default function Hub() {
  const navigate = useNavigate();
  const { currentPlayer, levelInfo, logout, getPersonalBest } = usePlayer();
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!currentPlayer) {
      navigate('/');
    }
  }, [currentPlayer]);

  if (!currentPlayer) return null;

  const genres = ['ALL', 'SHOOTER', 'PLATFORMER', 'ARCADE', 'PUZZLE', 'Endless Runner', 'Reflex'];

  const filteredGames = GAMES_DATA.filter(game => {
    const matchesGenre = selectedGenre === 'ALL' || game.genre.toUpperCase() === selectedGenre.toUpperCase();
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Operative Header with Level 1-25 Badge & XP Progress */}
      <header className="cyber-panel cyber-corner" style={{ padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Level Badge */}
            <div style={{
              width: 56,
              height: 56,
              background: 'var(--accent-yellow)',
              color: '#0F1015',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-title)',
              fontWeight: 900,
              boxShadow: '0 0 15px rgba(252,238,9,0.5)',
              flexShrink: 0
            }}>
              <span style={{ fontSize: 10, lineHeight: 1 }}>LVL</span>
              <span style={{ fontSize: 24, lineHeight: 1 }}>{levelInfo.level}</span>
            </div>

            <div>
              <h1 className="title-text" style={{ fontSize: 32, margin: 0 }}>SHANKAR'S ARCADE</h1>
              <div style={{ fontFamily: 'var(--font-hud)', fontSize: 12, color: 'var(--accent-green)', letterSpacing: 2 }}>
                OPERATIVE: {currentPlayer.name.toUpperCase()} &nbsp;|&nbsp; TITLE: [{levelInfo.title}]
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="cyber-btn cyber-btn-outline cyber-btn-sm" onClick={() => navigate('/leaderboard')}>
              🏆 LEADERBOARDS
            </button>
            <button className="cyber-btn cyber-btn-danger cyber-btn-sm" onClick={() => { logout(); navigate('/'); }}>
              SWITCH OPERATIVE
            </button>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-hud)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>LEVEL {levelInfo.level} / 25 PROGRESS</span>
            <span>{levelInfo.currentXP} / {levelInfo.xpNeeded} XP ({levelInfo.progressPercent}%)</span>
          </div>
          <div style={{ background: 'rgba(252,238,9,0.1)', height: 8, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(252,238,9,0.3)' }}>
            <div
              style={{
                width: `${levelInfo.progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00FF66 0%, #FCEE09 100%)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      </header>

      {/* Filters & Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {genres.map(genre => (
            <button
              key={genre}
              className={`cyber-btn cyber-btn-sm ${selectedGenre === genre ? '' : 'cyber-btn-outline'}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="SEARCH MISSIONS..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="cyber-input"
          style={{ width: 220, border: '1px solid var(--accent-yellow)', background: 'rgba(252,238,9,0.05)', padding: '6px 12px' }}
        />
      </div>

      {/* Game Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {filteredGames.map(game => {
          const pb = getPersonalBest(game.slug);
          return (
            <div key={game.slug} className="cyber-panel cyber-corner" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="genre-tag">{game.genre.toUpperCase()}</span>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: 24, color: 'var(--accent-yellow)', margin: '8px 0' }}>
                  {game.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, height: 36 }}>
                  {game.description}
                </p>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-hud)', fontSize: 12, color: pb !== null ? 'var(--accent-green)' : 'var(--text-muted)', marginBottom: 12 }}>
                  PERSONAL BEST: {pb !== null ? pb.toLocaleString() : '---'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="cyber-btn cyber-btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/game/${game.slug}`)}>
                    ▶ LAUNCH
                  </button>
                  <button className="cyber-btn cyber-btn-outline cyber-btn-sm" onClick={() => navigate(`/leaderboard/${game.slug}`)}>
                    🏆
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
