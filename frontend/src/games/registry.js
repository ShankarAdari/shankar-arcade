import { lazy } from 'react';

export const gameRegistry = {
  'space-invaders': lazy(() => import('./SpaceInvaders/SpaceInvaders')),
  'missile-defense': lazy(() => import('./MissileDefense/MissileDefense')),
  'asteroid-blaster': lazy(() => import('./AsteroidBlaster/AsteroidBlaster')),
  'zombie-survival': lazy(() => import('./ZombieSurvival/ZombieSurvival')),
  'snake': lazy(() => import('./Snake/Snake')),
  'flappy-bird': lazy(() => import('./FlappyBird/FlappyBird')),
  'breakout': lazy(() => import('./Breakout/Breakout')),
  'whack-a-mole': lazy(() => import('./WhackAMole/WhackAMole')),
  'memory-match': lazy(() => import('./MemoryMatch/MemoryMatch')),
  '2048': lazy(() => import('./Game2048/Game2048')),
  'tetris': lazy(() => import('./Tetris/Tetris')),
  'pacman': lazy(() => import('./Pacman/Pacman')),
  'cyber-racer': lazy(() => import('./CyberRacer/CyberRacer')),
  'target-sniper': lazy(() => import('./TargetSniper/TargetSniper')),
  'laser-pong': lazy(() => import('./LaserPong/LaserPong')),
  'lunar-lander': lazy(() => import('./LunarLander/LunarLander')),
  'cyber-frogger': lazy(() => import('./CyberFrogger/CyberFrogger')),
  'minesweeper': lazy(() => import('./Minesweeper/Minesweeper')),
};
