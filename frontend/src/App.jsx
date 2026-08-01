import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Hub from './pages/Hub';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';

const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
    <div className="crosshair-icon" style={{ fontSize: 48 }}>⊕</div>
    <span className="boot-item boot-1">[ LOADING MISSION... ]</span>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/hub" element={<Hub />} />
          <Route path="/game/:slug" element={<GamePage />} />
          <Route path="/leaderboard/:slug" element={<LeaderboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
