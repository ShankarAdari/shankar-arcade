import { Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import Landing from './pages/Landing';
import Hub from './pages/Hub';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';

export default function App() {
  return (
    <PlayerProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/game/:slug" element={<GamePage />} />
        <Route path="/leaderboard/:slug" element={<LeaderboardPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PlayerProvider>
  );
}
