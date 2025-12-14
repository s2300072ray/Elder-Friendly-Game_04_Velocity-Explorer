import { LevelData, EntityType } from './types';

// Physics
export const GRAVITY = 0.6;
export const FRICTION = 0.8;
export const MOVE_SPEED = 0.5;
export const MAX_SPEED = 6;
export const JUMP_FORCE = -14;
export const BOUNCE_FORCE = -8; // Force when stomping enemy

// Dimensions
export const TILE_SIZE = 40;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Levels
const LEVEL_1: LevelData = {
  id: 'level-1',
  name: 'Green Plains',
  description: 'Basic platforming skills. Watch out for mushrooms!',
  theme: { background: '#87CEEB', platformColor: '#4CAF50', accentColor: '#8BC34A' },
  playerStart: { x: 50, y: 400 },
  platforms: [
    { id: 1, x: 0, y: 500, w: 1000, h: 100, type: 'solid', color: '#4CAF50' }, // Ground
    { id: 2, x: 400, y: 350, w: 200, h: 40, type: 'solid', color: '#4CAF50' },
    { id: 3, x: 700, y: 250, w: 200, h: 40, type: 'solid', color: '#4CAF50' },
    { id: 4, x: 1000, y: 500, w: 800, h: 100, type: 'solid', color: '#4CAF50' }, // Ground 2
    { id: 5, x: 1300, y: 350, w: 150, h: 40, type: 'solid', color: '#4CAF50' },
    { id: 6, x: 1600, y: 200, w: 150, h: 40, type: 'solid', color: '#4CAF50' },
    { id: 7, x: 1900, y: 500, w: 600, h: 100, type: 'solid', color: '#4CAF50' }, // Goal Ground
  ],
  enemies: [
    { id: 1, x: 600, y: 460, w: 40, h: 40, type: EntityType.ENEMY_WALKER, vx: 2, vy: 0, patrolStart: 500, patrolEnd: 900 },
    { id: 2, x: 1200, y: 460, w: 40, h: 40, type: EntityType.ENEMY_WALKER, vx: 2, vy: 0, patrolStart: 1100, patrolEnd: 1500 },
  ],
  coins: [
    { id: 1, x: 450, y: 300, w: 20, h: 20, collected: false },
    { id: 2, x: 800, y: 200, w: 20, h: 20, collected: false },
    { id: 3, x: 1350, y: 300, w: 20, h: 20, collected: false },
  ],
  goal: { x: 2300, y: 350, w: 50, h: 150 }
};

const LEVEL_2: LevelData = {
  id: 'level-2',
  name: 'Underground Cave',
  description: 'Darkness and vertical challenges. Beware of bats.',
  theme: { background: '#2D2D2D', platformColor: '#795548', accentColor: '#5D4037' },
  playerStart: { x: 50, y: 500 },
  platforms: [
    { id: 1, x: 0, y: 550, w: 400, h: 50, type: 'solid', color: '#795548' },
    { id: 2, x: 500, y: 450, w: 150, h: 30, type: 'solid', color: '#795548' },
    { id: 3, x: 200, y: 350, w: 150, h: 30, type: 'solid', color: '#795548' },
    { id: 4, x: 500, y: 250, w: 150, h: 30, type: 'solid', color: '#795548' },
    { id: 5, x: 800, y: 300, w: 300, h: 30, type: 'solid', color: '#795548' },
    { id: 6, x: 1200, y: 400, w: 200, h: 30, type: 'solid', color: '#795548' },
    { id: 7, x: 1500, y: 500, w: 400, h: 50, type: 'solid', color: '#795548' },
  ],
  enemies: [
    { id: 1, x: 900, y: 150, w: 40, h: 30, type: EntityType.ENEMY_FLYER, vx: 3, vy: 0, patrolStart: 800, patrolEnd: 1100 },
    { id: 2, x: 600, y: 400, w: 40, h: 40, type: EntityType.ENEMY_WALKER, vx: 2, vy: 0, patrolStart: 500, patrolEnd: 650 },
  ],
  coins: [
    { id: 1, x: 250, y: 300, w: 20, h: 20, collected: false },
    { id: 2, x: 550, y: 200, w: 20, h: 20, collected: false },
    { id: 3, x: 950, y: 250, w: 20, h: 20, collected: false },
  ],
  goal: { x: 1800, y: 350, w: 50, h: 150 }
};

const LEVEL_3: LevelData = {
  id: 'level-3',
  name: 'Sky City',
  description: 'Precision jumping required. Don\'t fall!',
  theme: { background: '#E0F7FA', platformColor: '#607D8B', accentColor: '#90A4AE' },
  playerStart: { x: 50, y: 300 },
  platforms: [
    { id: 1, x: 0, y: 400, w: 200, h: 50, type: 'solid', color: '#607D8B' },
    { id: 2, x: 300, y: 400, w: 100, h: 30, type: 'solid', color: '#607D8B' },
    { id: 3, x: 500, y: 350, w: 100, h: 30, type: 'solid', color: '#607D8B' },
    { id: 4, x: 700, y: 300, w: 100, h: 30, type: 'solid', color: '#607D8B' },
    { id: 5, x: 900, y: 450, w: 300, h: 30, type: 'solid', color: '#607D8B' },
    { id: 6, x: 1400, y: 350, w: 100, h: 30, type: 'solid', color: '#607D8B' },
    { id: 7, x: 1600, y: 250, w: 100, h: 30, type: 'solid', color: '#607D8B' },
    { id: 8, x: 1900, y: 400, w: 300, h: 50, type: 'solid', color: '#607D8B' },
  ],
  enemies: [
    { id: 1, x: 1000, y: 400, w: 40, h: 40, type: EntityType.ENEMY_WALKER, vx: 4, vy: 0, patrolStart: 900, patrolEnd: 1200 }, // Fast enemy
    { id: 2, x: 1500, y: 200, w: 40, h: 30, type: EntityType.ENEMY_FLYER, vx: 2, vy: 0, patrolStart: 1400, patrolEnd: 1700 },
  ],
  coins: [
    { id: 1, x: 350, y: 350, w: 20, h: 20, collected: false },
    { id: 2, x: 750, y: 250, w: 20, h: 20, collected: false },
    { id: 3, x: 1650, y: 200, w: 20, h: 20, collected: false },
  ],
  goal: { x: 2100, y: 250, w: 50, h: 150 }
};

export const LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3];