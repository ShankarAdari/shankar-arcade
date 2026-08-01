const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbFilePath = path.resolve(process.env.DB_PATH || './arcade-data.json');

let data = {
  users: [],
  games: [],
  scores: []
};

const load = () => {
  if (fs.existsSync(dbFilePath)) {
    try {
      const content = fs.readFileSync(dbFilePath, 'utf8');
      data = JSON.parse(content);
    } catch (e) {
      console.error('Error loading DB file, creating fresh:', e);
    }
  }
};

const save = () => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving DB file:', e);
  }
};

// Seed games if empty
const seedGames = () => {
  const gamesData = [
    { id: 1, slug: 'space-invaders', title: 'Space Invaders', genre: 'Shooter', description: 'Defend Earth from descending alien waves' },
    { id: 2, slug: 'missile-defense', title: 'Missile Defense', genre: 'Shooter', description: 'Intercept incoming missiles before they destroy your base' },
    { id: 3, slug: 'asteroid-blaster', title: 'Asteroid Blaster', genre: 'Shooter', description: 'Rotate your ship and blast asteroids that split on impact' },
    { id: 4, slug: 'zombie-survival', title: 'Zombie Survival', genre: 'Shooter', description: 'Survive endless zombie waves in a post-apocalyptic warzone' },
    { id: 5, slug: 'snake', title: 'Snake', genre: 'Arcade', description: 'Classic snake — grow longer without hitting yourself' },
    { id: 6, slug: 'flappy-bird', title: 'Flappy Rocket', genre: 'Endless Runner', description: 'Fly a rocket through enemy missile gaps' },
    { id: 7, slug: 'breakout', title: 'Breakout', genre: 'Arcade', description: 'Destroy all bricks with your tactical bouncing shot' },
    { id: 8, slug: 'whack-a-mole', title: 'Whack-a-Mole', genre: 'Reflex', description: 'Destroy targets before they disappear' },
    { id: 9, slug: 'memory-match', title: 'Memory Match', genre: 'Puzzle', description: 'Match classified intel cards before time runs out' },
    { id: 10, slug: '2048', title: '2048', genre: 'Puzzle', description: 'Merge numbered tiles to reach 2048' },
    { id: 11, slug: 'tetris', title: 'Tetris', genre: 'Puzzle', description: 'Clear lines with falling tactical blocks' },
    { id: 12, slug: 'pacman', title: 'Pacman', genre: 'Arcade', description: 'Navigate the maze and evade enemy ghosts' },
  ];

  if (!data.games || data.games.length === 0) {
    data.games = gamesData;
    save();
  }
};

load();
seedGames();

// Prepared statement wrapper emulation for simple migration
const db = {
  prepare: (sql) => {
    return {
      get: (...params) => {
        if (sql.includes('FROM users WHERE email = ?')) {
          return data.users.find(u => u.email === params[0]) || null;
        }
        if (sql.includes('FROM users WHERE id = ?')) {
          return data.users.find(u => u.id === params[0]) || null;
        }
        if (sql.includes('FROM games WHERE slug = ?')) {
          return data.games.find(g => g.slug === params[0]) || null;
        }
        if (sql.includes('MAX(score) as best FROM scores WHERE user_id = ? AND game_id = ?')) {
          const userScores = data.scores.filter(s => s.user_id === params[0] && s.game_id === params[1]);
          if (userScores.length === 0) return { best: null };
          const max = Math.max(...userScores.map(s => s.score));
          return { best: max };
        }
        if (sql.includes('COUNT(*) + 1 as rank')) {
          const gameId = params[0];
          const targetScore = params[1];
          // get best score per user
          const userBests = {};
          data.scores.filter(s => s.game_id === gameId).forEach(s => {
            if (!userBests[s.user_id] || s.score > userBests[s.user_id]) {
              userBests[s.user_id] = s.score;
            }
          });
          const ranks = Object.values(userBests).filter(score => score > targetScore);
          return { rank: ranks.length + 1 };
        }
        return null;
      },
      all: (...params) => {
        if (sql.includes('SELECT * FROM games')) {
          return data.games;
        }
        if (sql.includes('FROM scores WHERE user_id = ? AND game_id = ?')) {
          return data.scores
            .filter(s => s.user_id === params[0] && s.game_id === params[1])
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        if (sql.includes('FROM ( SELECT user_id, MAX(score) as score')) {
          const gameId = params[0];
          const userBests = {};
          data.scores.filter(s => s.game_id === gameId).forEach(s => {
            if (!userBests[s.user_id] || s.score > userBests[s.user_id].score) {
              userBests[s.user_id] = { score: s.score, created_at: s.created_at, user_id: s.user_id };
            }
          });
          const sorted = Object.values(userBests).sort((a, b) => b.score - a.score).slice(0, 10);
          return sorted.map((entry, index) => {
            const user = data.users.find(u => u.id === entry.user_id);
            return {
              rank: index + 1,
              name: user ? user.name : 'Unknown Operative',
              score: entry.score,
              created_at: entry.created_at
            };
          });
        }
        return [];
      },
      run: (...params) => {
        if (sql.includes('INSERT INTO users')) {
          const id = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
          const newUser = { id, name: params[0], email: params[1], password_hash: params[2], created_at: new Date().toISOString() };
          data.users.push(newUser);
          save();
          return { lastInsertRowid: id };
        }
        if (sql.includes('INSERT INTO scores')) {
          const id = data.scores.length > 0 ? Math.max(...data.scores.map(s => s.id)) + 1 : 1;
          const newScore = { id, user_id: params[0], game_id: params[1], score: params[2], created_at: new Date().toISOString() };
          data.scores.push(newScore);
          save();
          return { lastInsertRowid: id };
        }
        return { lastInsertRowid: null };
      }
    };
  }
};

console.log('[ DATABASE: ONLINE (PURE JS STORE) ]');
console.log(`[ DB PATH: ${dbFilePath} ]`);

module.exports = db;
