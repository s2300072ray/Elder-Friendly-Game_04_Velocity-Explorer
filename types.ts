export enum GameState {
  MENU,
  PLAYING,
  GAME_OVER,
  VICTORY,
  LOADING_AI
}

export enum EntityType {
  PLAYER,
  PLATFORM,
  ENEMY_WALKER,
  ENEMY_FLYER,
  COIN,
  SPIKE,
  GOAL
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Platform extends Rect {
  id: number;
  type: 'solid' | 'oneway';
  color: string;
}

export interface Enemy extends Rect {
  id: number;
  type: EntityType.ENEMY_WALKER | EntityType.ENEMY_FLYER;
  vx: number;
  vy: number;
  patrolStart: number;
  patrolEnd: number;
}

export interface Coin extends Rect {
  id: number;
  collected: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface LevelData {
  id: string;
  name: string;
  theme: {
    background: string;
    platformColor: string;
    accentColor: string;
  };
  playerStart: Vector2;
  platforms: Platform[];
  enemies: Enemy[];
  coins: Coin[];
  goal: Rect;
  description: string;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  isGrounded: boolean;
  jumpCount: number;
  facingRight: boolean;
  isDead: boolean;
  score: number;
  lives: number;
}