const express = require('express');
const db = require('../db/database');
const { authOptional } = require('../middleware/auth');

const router = express.Router();

// GET /games
router.get('/', authOptional, (req, res) => {
  const games = db.prepare('SELECT * FROM games ORDER BY id').all();

  if (req.user) {
    const userId = req.user.id;
    const gamesWithScores = games.map((game) => {
      const best = db.prepare(
        'SELECT MAX(score) as best FROM scores WHERE user_id = ? AND game_id = ?'
      ).get(userId, game.id);
      return { ...game, personalBest: best?.best || null };
    });
    return res.json({ games: gamesWithScores });
  }

  res.json({ games });
});

// GET /games/:slug
router.get('/:slug', authOptional, (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE slug = ?').get(req.params.slug);
  if (!game) return res.status(404).json({ error: 'Game not found' });

  let personalBest = null;
  if (req.user) {
    const best = db.prepare(
      'SELECT MAX(score) as best FROM scores WHERE user_id = ? AND game_id = ?'
    ).get(req.user.id, game.id);
    personalBest = best?.best || null;
  }

  res.json({ game: { ...game, personalBest } });
});

module.exports = router;
