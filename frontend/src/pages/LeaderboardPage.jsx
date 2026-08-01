import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeaderboard, getHistory } from '../api/scores';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function LeaderboardPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [yourRank, setYourRank] = useState(null);
  const [yourBest, setYourBest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const targetSlug = slug || 'space-invaders';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getLeaderboard(targetSlug).catch(() => ({ leaderboard: [] })),
      getHistory(targetSlug).catch(() => ({ history: [] }))
    ]).then(([lbData, histData]) => {
      setGame(lbData.game);
      setLeaderboard(lbData.leaderboard || []);
      setYourRank(lbData.yourRank);
      setYourBest(lbData.yourBest);
      setHistory(histData.history || []);
    }).finally(() => setLoading(false));
  }, [targetSlug]);

  const chartData = {
    labels: history.map((_, i) => `Attempt #${i + 1}`),
    datasets: [
      {
        label: 'Score History',
        data: history.map(h => h.score),
        borderColor: '#FCEE09',
        backgroundColor: 'rgba(252, 238, 9, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#00FF66',
        pointBorderColor: '#0F1015',
        pointRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1A1C23',
        titleColor: '#FCEE09',
        bodyColor: '#00FF66',
        borderColor: '#FCEE09',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(252, 238, 9, 0.05)' },
        ticks: { color: '#6B7280', font: { family: 'Share Tech Mono' } }
      },
      y: {
        grid: { color: 'rgba(252, 238, 9, 0.05)' },
        ticks: { color: '#6B7280', font: { family: 'Share Tech Mono' } }
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
      <button className="cyber-btn cyber-btn-sm" onClick={() => navigate('/hub')} style={{ marginBottom: 24 }}>
        ← RETURN TO HUB
      </button>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-hud)', fontSize: 11, color: 'var(--accent-green)', letterSpacing: 4, marginBottom: 8 }}>
          [ TACTICAL RANKINGS & ANALYTICS ]
        </div>
        <h1 className="title-lg">{game?.title?.toUpperCase() || 'LEADERBOARD'}</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <div className="crosshair-icon">⊕</div>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: 16 }}>[ RETRIEVING DATA... ]</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Top 10 Table */}
          <div className="cyber-panel cyber-corner" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: 24, color: 'var(--accent-yellow)', marginBottom: 16 }}>
              TOP OPERATIVES
            </h3>

            {yourRank && (
              <div style={{ padding: 12, background: 'rgba(0, 255, 102, 0.1)', border: '1px solid var(--accent-green)', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-hud)', fontSize: 12, color: 'var(--accent-green)' }}>YOUR RANK: #{yourRank}</span>
                <span style={{ fontFamily: 'var(--font-hud)', fontSize: 12, color: 'var(--accent-yellow)' }}>BEST: {yourBest?.toLocaleString()}</span>
              </div>
            )}

            {leaderboard.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No scores submitted yet for this mission.</p>
            ) : (
              <div>
                {leaderboard.map((entry, idx) => (
                  <div key={idx} className={`lb-row rank-${entry.rank}`}>
                    <span style={{ fontFamily: 'var(--font-hud)', color: entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : entry.rank === 3 ? '#CD7F32' : 'var(--text-muted)' }}>
                      #{entry.rank}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{entry.name}</span>
                    <span style={{ fontFamily: 'var(--font-hud)', color: 'var(--accent-yellow)', fontWeight: 700 }}>{entry.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History Chart */}
          <div className="cyber-panel cyber-corner" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: 24, color: 'var(--accent-yellow)', marginBottom: 16 }}>
              PERFORMANCE PROGRESSION
            </h3>
            {history.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No personal history recorded for this mission yet.</p>
            ) : (
              <div style={{ marginTop: 20 }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
