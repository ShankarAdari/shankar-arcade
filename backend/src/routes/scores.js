const express = require('express');
const db = require('../db/database');
const { authRequired, authOptional } = require('../middleware/auth');

const router = express.Router();

// POST /scores/submit
router.post('/submit', authRequired, (req, res) => {
  const { gameSlug, score } = req.body;
  const userId = req.user.id;

  if (!gameSlug || score === undefined || score === null) {
    return res.status(400).json({ error: 'gameSlug and score are required' });
  }
  if (typeof score !== 'number' || score < 0) {
    return res.status(400).json({ error: 'Score must be a non-negative number' });
  }

  const game = db.prepare('SELECT * FROM games WHERE slug = ?').get(gameSlug);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  // Insert score
  db.prepare('INSERT INTO scores (user_id, game_id, score) VALUES (?, ?, ?)').run(userId, game.id, score);

  // Get personal best
  const personalBest = db.prepare(
    'SELECT MAX(score) as best FROM scores WHERE user_id = ? AND game_id = ?'
  ).get(userId, game.id);

  const isNewBest = score >= (personalBest?.best || 0);

  // Get rank on leaderboard
  const rankRow = db.prepare(`
    SELECT COUNT(*) + 1 as rank FROM (
      SELECT user_id, MAX(score) as best_score
      FROM scores WHERE game_id = ?
      GROUP BY user_id
    ) WHERE best_score > ?
  `).get(game.id, score);

  res.json({
    message: '[ SCORE RECORDED ]',
    rank: rankRow?.rank || 1,
    isNewBest,
    score,
    personalBest: personalBest?.best || score,
  });
});

// GET /scores/leaderboard/:gameSlug
router.get('/leaderboard/:gameSlug', authOptional, (req, res) => {
  const { gameSlug } = req.params;

  const game = db.prepare('SELECT * FROM games WHERE slug = ?').get(gameSlug);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  const top10 = db.prepare(`
    SELECT u.name, s.score, s.created_at,
      ROW_NUMBER() OVER (ORDER BY s.score DESC) as rank
    FROM (
      SELECT user_id, MAX(score) as score, MAX(created_at) as created_at
      FROM scores WHERE game_id = ?
      GROUP BY user_id
    ) s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.score DESC
    LIMIT 10
  `).all(game.id);

  let yourRank = null;
  let yourBest = null;

  if (req.user) {
    const userBest = db.prepare(
      'SELECT MAX(score) as best FROM scores WHERE user_id = ? AND game_id = ?'
    ).get(req.user.id, game.id);

    if (userBest?.best !== null) {
      yourBest = userBest.best;
      const rankRow = db.prepare(`
        SELECT COUNT(*) + 1 as rank FROM (
          SELECT user_id, MAX(score) as best_score
          FROM scores WHERE game_id = ?
          GROUP BY user_id
        ) WHERE best_score > ?
      `).get(game.id, yourBest);
      yourRank = rankRow?.rank || null;
    }
  }

  res.json({
    game: { id: game.id, slug: game.slug, title: game.title },
    leaderboard: top10,
    yourRank,
    yourBest,
  });
});

// GET /scores/history/:gameSlug
router.get('/history/:gameSlug', authRequired, (req, res) => {
  const { gameSlug } = req.params;
  const userId = req.user.id;

  const game = db.prepare('SELECT * FROM games WHERE slug = ?').get(gameSlug);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  const history = db.prepare(`
    SELECT score, created_at
    FROM scores
    WHERE user_id = ? AND game_id = ?
    ORDER BY created_at ASC
  `).all(userId, game.id);

  res.json({ game: { slug: game.slug, title: game.title }, history });
});

// GET /scores/global-leaderboard
router.get('/global', authOptional, (req, res) => {
  const allGames = db.prepare('SELECT * FROM games').all();

  const result = allGames.map((game) => {
    const top3 = db.prepare(`
      SELECT u.name, MAX(s.score) as score
      FROM scores s JOIN users u ON u.id = s.user_id
      WHERE s.game_id = ?
      GROUP BY s.user_id
      ORDER BY score DESC LIMIT 3
    `).all(game.id);

    return { ...game, topPlayers: top3 };
  });

  res.json({ games: result });
});

module.exports = router;
