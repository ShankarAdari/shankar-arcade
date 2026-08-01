# Shankar's Arcade Collection

A full-stack, Military Cyberpunk-themed multi-game web arcade platform built with React, Node.js/Express, and SQLite/PostgreSQL.

## Features

1. **User Authentication System**: Registration, JWT login, and a "Play as Guest" mode.
2. **Game Hub Dashboard**: Listing all 12 playable games as cards with high scores, genre tags, and search/filter.
3. **Reusable Game Shell Wrapper**: Manages pause/resume, live score/timer HUD, and automated score submission on game-over.
4. **Per-game & Global Leaderboards**: Track top 10 players, your personal rank, and score history.
5. **Score Analytics Graph**: Interactive Chart.js score history graph per game over time.
6. **Military Cyberpunk Aesthetic**: Complete custom CSS theme featuring glitch text, scanline overlays, neon glow, and tactical HUDs.

---

## Games Included (12 Total)

- 👾 **Space Invaders**: Defend Earth against descending alien waves
- 🚀 **Missile Defense**: Intercept incoming missiles before they strike base cities
- ☄️ **Asteroid Blaster**: Thrust, rotate, and blast splitting asteroids
- 🧟 **Zombie Survival**: Top-down survival shooter against endless zombie waves
- 🐍 **Snake**: Classic snake game with speed acceleration
- ✈️ **Flappy Rocket**: Flappy-bird style rocket obstacle navigation
- 🧱 **Breakout**: Tactical paddle-and-ball brick breaker
- 🎯 **Whack-a-Mole**: Tactical target reflex clicking game
- 🃏 **Memory Match**: Classified intel memory card match game
- 🔢 **2048**: Grid tile merging puzzle
- 🟦 **Tetris**: Block clearing grid puzzle
- 👻 **Pacman**: Maze navigation & ghost evasion arcade game

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Chart.js, Axios, Canvas API
- **Backend**: Node.js, Express REST API, JWT, bcryptjs, Helmet, CORS
- **Database**: SQLite (`better-sqlite3`) for zero-setup local dev / easily swappable to PostgreSQL

---

## Getting Started

### 1. Start the Backend API

```bash
cd backend
npm install
npm run dev
```

The Express server will start at `http://localhost:3001` and create/seed `arcade.db`.

### 2. Start the Frontend App

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:5173`. Open in your browser!
