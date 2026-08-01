import React, { createContext, useContext, useState, useEffect } from 'react';

const PlayerContext = createContext(null);

const STORAGE_KEY = 'arcade_players';
const CURRENT_KEY = 'arcade_current_player';

export const getPlayers = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
};

const savePlayers = (players) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
};

export const PlayerProvider = ({ children }) => {
  const [currentPlayer, setCurrentPlayer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
    } catch { return null; }
  });

  const startAsPlayer = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const players = getPlayers();
    const existing = players.find(p => p.name.toLowerCase() === trimmed.toLowerCase());

    let player;
    if (existing) {
      // Update last played
      player = { ...existing, lastPlayed: new Date().toISOString() };
      const idx = players.findIndex(p => p.name.toLowerCase() === trimmed.toLowerCase());
      players[idx] = player;
    } else {
      // New player
      player = {
        name: trimmed,
        joined: new Date().toISOString(),
        lastPlayed: new Date().toISOString(),
        scores: {}
      };
      players.push(player);
    }

    savePlayers(players);
    localStorage.setItem(CURRENT_KEY, JSON.stringify(player));
    setCurrentPlayer(player);
  };

  const submitScore = (gameSlug, score) => {
    if (!currentPlayer) return { rank: null, isNewBest: false, personalBest: score };

    const players = getPlayers();
    const idx = players.findIndex(p => p.name.toLowerCase() === currentPlayer.name.toLowerCase());

    const player = idx >= 0 ? players[idx] : { ...currentPlayer, scores: {} };
    if (!player.scores) player.scores = {};
    if (!player.scores[gameSlug]) player.scores[gameSlug] = [];

    const prevBest = player.scores[gameSlug].length > 0
      ? Math.max(...player.scores[gameSlug].map(s => s.score))
      : 0;

    player.scores[gameSlug].push({ score, date: new Date().toISOString() });
    player.lastPlayed = new Date().toISOString();

    if (idx >= 0) players[idx] = player;
    else players.push(player);

    savePlayers(players);
    localStorage.setItem(CURRENT_KEY, JSON.stringify(player));
    setCurrentPlayer(player);

    const isNewBest = score > prevBest;
    const personalBest = Math.max(score, prevBest);

    // Calculate rank across all players for this game
    const allBests = players
      .map(p => p.scores?.[gameSlug] ? Math.max(...p.scores[gameSlug].map(s => s.score)) : 0)
      .filter(s => s > 0)
      .sort((a, b) => b - a);
    const rank = allBests.indexOf(personalBest) + 1 || 1;

    return { rank, isNewBest, personalBest };
  };

  const getLeaderboard = (gameSlug) => {
    const players = getPlayers();
    const entries = players
      .filter(p => p.scores?.[gameSlug]?.length > 0)
      .map(p => ({
        name: p.name,
        score: Math.max(...p.scores[gameSlug].map(s => s.score)),
        date: p.scores[gameSlug][p.scores[gameSlug].length - 1].date
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    const myBest = currentPlayer?.scores?.[gameSlug]?.length > 0
      ? Math.max(...currentPlayer.scores[gameSlug].map(s => s.score))
      : null;
    const myRank = myBest ? (entries.findIndex(e => e.name === currentPlayer.name) + 1) || null : null;

    return { leaderboard: entries, yourBest: myBest, yourRank: myRank };
  };

  const getHistory = (gameSlug) => {
    const player = currentPlayer;
    if (!player?.scores?.[gameSlug]) return [];
    return player.scores[gameSlug];
  };

  const getPersonalBest = (gameSlug) => {
    if (!currentPlayer?.scores?.[gameSlug]?.length) return null;
    return Math.max(...currentPlayer.scores[gameSlug].map(s => s.score));
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_KEY);
    setCurrentPlayer(null);
  };

  return (
    <PlayerContext.Provider value={{
      currentPlayer,
      startAsPlayer,
      submitScore,
      getLeaderboard,
      getHistory,
      getPersonalBest,
      logout
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be inside PlayerProvider');
  return ctx;
};

export default PlayerContext;
