import client from './client';

const getLocalScores = (gameSlug) => {
  try {
    const raw = localStorage.getItem(`arcade_scores_${gameSlug}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalScore = (gameSlug, score) => {
  const userRaw = localStorage.getItem('arcade_user');
  const user = userRaw ? JSON.parse(userRaw) : { name: 'Operative (Local)' };
  const history = getLocalScores(gameSlug);
  
  const newEntry = {
    score,
    created_at: new Date().toISOString(),
    name: user.name
  };
  
  history.push(newEntry);
  localStorage.setItem(`arcade_scores_${gameSlug}`, JSON.stringify(history));

  const allScores = [...history].sort((a, b) => b.score - a.score);
  const best = allScores[0].score;
  const rank = allScores.findIndex(s => s.score === score) + 1;

  return {
    message: '[ LOCAL SCORE SAVED ]',
    rank,
    isNewBest: score >= best,
    score,
    personalBest: best
  };
};

export const submitScore = (gameSlug, score) => {
  return client.post('/scores/submit', { gameSlug, score })
    .then(r => r.data)
    .catch(() => saveLocalScore(gameSlug, score));
};

export const getLeaderboard = (gameSlug) => {
  return client.get(`/scores/leaderboard/${gameSlug}`)
    .then(r => r.data)
    .catch(() => {
      const local = getLocalScores(gameSlug);
      const sorted = [...local].sort((a, b) => b.score - a.score).slice(0, 10);
      const userRaw = localStorage.getItem('arcade_user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      
      const top10 = sorted.map((s, idx) => ({
        rank: idx + 1,
        name: s.name || 'Operative',
        score: s.score,
        created_at: s.created_at
      }));

      const best = local.length > 0 ? Math.max(...local.map(s => s.score)) : null;

      return {
        game: { slug: gameSlug, title: gameSlug.replace(/-/g, ' ').toUpperCase() },
        leaderboard: top10,
        yourRank: best ? 1 : null,
        yourBest: best
      };
    });
};

export const getHistory = (gameSlug) => {
  return client.get(`/scores/history/${gameSlug}`)
    .then(r => r.data)
    .catch(() => {
      const local = getLocalScores(gameSlug);
      return {
        game: { slug: gameSlug, title: gameSlug.replace(/-/g, ' ').toUpperCase() },
        history: local
      };
    });
};

export const getGlobal = () => {
  return client.get('/scores/global').then(r => r.data).catch(() => ({ games: [] }));
};
