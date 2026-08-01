require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Initialize DB first
require('./db/database');

const authRoutes = require('./routes/auth');
const scoresRoutes = require('./routes/scores');
const gamesRoutes = require('./routes/games');

const app = express();
const PORT = process.env.PORT || 3001;

// Security & middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/scores', scoresRoutes);
app.use('/games', gamesRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    message: '[ SHANKAR ARCADE API ONLINE ]',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /auth/register',
      'POST /auth/login',
      'GET  /auth/me',
      'GET  /games',
      'GET  /games/:slug',
      'POST /scores/submit',
      'GET  /scores/leaderboard/:gameSlug',
      'GET  /scores/history/:gameSlug',
      'GET  /scores/global',
    ],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ SERVER ERROR ]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║   SHANKAR'S ARCADE API ONLINE        ║`);
  console.log(`║   Port: ${PORT}                          ║`);
  console.log(`╚══════════════════════════════════════╝\n`);
});

module.exports = app;
