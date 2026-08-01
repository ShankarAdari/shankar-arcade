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
};
