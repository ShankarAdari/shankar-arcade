import React, { createContext, useContext, useState } from 'react';

const PlayerContext = createContext(null);

const STORAGE_KEY = 'arcade_players';
const CURRENT_KEY = 'arcade_current_player';

// Title unlocks for levels 1 to 25
export const LEVEL_TITLES = {
  1: 'RECRUIT',
  2: 'SCOUT',
  3: 'CADET',
  4: 'AGENT',
  5: 'OPERATIVE',
  6: 'SPECIALIST',
  7: 'VETERAN',
  8: 'CHIEF',
  9: 'CAPTAIN',
  10: 'COMMANDER',
  11: 'MAJOR',
  12: 'COLONEL',
  13: 'BRIGADIER',
  14: 'GENERAL',
  15: 'TACTICAL MASTER',
  16: 'WARLORD',
  17: 'CYBER SHADOW',
  18: 'CYBER PHANTOM',
  19: 'CYBER SPECTRE',
  20: 'CYBER WARLORD',
  21: 'OVERLORD',
  22: 'TITAN',
  23: 'DOMINATOR',
  24: 'GODLIKE',
  25: 'APEX LEGEND'
};

// Calculate Level & XP based on total XP
export const calculatePlayerLevel = (totalXP) => {
  let level = 1;
  let xpNeeded = 500;
  let currentXP = totalXP || 0;

  while (currentXP >= xpNeeded && level < 25) {
    currentXP -= xpNeeded;
    level++;
    xpNeeded = level * 500;
  }

  if (level === 25) {
    return { level: 25, currentXP: xpNeeded, xpNeeded, progressPercent: 100, title: LEVEL_TITLES[25] };
  }

  const progressPercent = Math.min(100, Math.floor((currentXP / xpNeeded) * 100));
  return { level, currentXP, xpNeeded, progressPercent, title: LEVEL_TITLES[level] };
};

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
      player = { ...existing, lastPlayed: new Date().toISOString() };
      const idx = players.findIndex(p => p.name.toLowerCase() === trimmed.toLowerCase());
      players[idx] = player;
    } else {
      player = {
        name: trimmed,
        joined: new Date().toISOString(),
        lastPlayed: new Date().toISOString(),
        xp: 0,
        scores: {}
      };
      players.push(player);
    }

    savePlayers(players);
    localStorage.setItem(CURRENT_KEY, JSON.stringify(player));
    setCurrentPlayer(player);
  };

  const submitScore = (gameSlug, score) => {
    if (!currentPlayer) return { rank: null, isNewBest: false, personalBest: score, xpEarned: 0 };

    const players = getPlayers();
    const idx = players.findIndex(p => p.name.toLowerCase() === currentPlayer.name.toLowerCase());

    const player = idx >= 0 ? players[idx] : { ...currentPlayer, xp: 0, scores: {} };
    if (!player.scores) player.scores = {};
    if (!player.scores[gameSlug]) player.scores[gameSlug] = [];
    if (!player.xp) player.xp = 0;

    const prevBest = player.scores[gameSlug].length > 0
      ? Math.max(...player.scores[gameSlug].map(s => s.score))
      : 0;

    const xpEarned = Math.floor(score * 1.5); // XP earned from score
    player.xp += xpEarned;

    const oldLevel = calculatePlayerLevel(player.xp - xpEarned).level;
    const newLevelObj = calculatePlayerLevel(player.xp);

    player.scores[gameSlug].push({ score, date: new Date().toISOString() });
    player.lastPlayed = new Date().toISOString();

    if (idx >= 0) players[idx] = player;
    else players.push(player);

    savePlayers(players);
    localStorage.setItem(CURRENT_KEY, JSON.stringify(player));
    setCurrentPlayer(player);

    const isNewBest = score > prevBest;
    const personalBest = Math.max(score, prevBest);
    const leveledUp = newLevelObj.level > oldLevel;

    // Calculate rank
    const allBests = players
      .map(p => p.scores?.[gameSlug] ? Math.max(...p.scores[gameSlug].map(s => s.score)) : 0)
      .filter(s => s > 0)
      .sort((a, b) => b - a);
    const rank = allBests.indexOf(personalBest) + 1 || 1;

    return { rank, isNewBest, personalBest, xpEarned, leveledUp, newLevel: newLevelObj.level, newTitle: newLevelObj.title };
  };

  const getLeaderboard = (gameSlug) => {
    const players = getPlayers();
    const entries = players
      .filter(p => p.scores?.[gameSlug]?.length > 0)
      .map(p => ({
        name: p.name,
        score: Math.max(...p.scores[gameSlug].map(s => s.score)),
        levelInfo: calculatePlayerLevel(p.xp || 0),
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

  const levelInfo = calculatePlayerLevel(currentPlayer?.xp || 0);

  return (
    <PlayerContext.Provider value={{
      currentPlayer,
      levelInfo,
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
