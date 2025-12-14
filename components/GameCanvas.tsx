import React, { useRef, useEffect, useState } from 'react';
import { 
  LevelData, PlayerState, EntityType, Platform, Enemy, 
  Coin, Particle, Rect, GameState 
} from '../types';
import { 
  GRAVITY, FRICTION, MOVE_SPEED, MAX_SPEED, 
  JUMP_FORCE, BOUNCE_FORCE, CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE 
} from '../constants';

interface GameCanvasProps {
  level: LevelData;
  onGameOver: (score: number, time: number, win: boolean) => void;
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ level, onGameOver, onScoreUpdate, onLivesUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  
  // Game State Refs (for high-performance loop)
  const playerRef = useRef<PlayerState>({
    x: level.playerStart.x,
    y: level.playerStart.y,
    vx: 0,
    vy: 0,
    w: 30,
    h: 50,
    isGrounded: false,
    jumpCount: 0,
    facingRight: true,
    isDead: false,
    score: 0,
    lives: 3
  });
  
  const platformsRef = useRef<Platform[]>(level.platforms);
  const enemiesRef = useRef<Enemy[]>(JSON.parse(JSON.stringify(level.enemies))); // Deep copy
  const coinsRef = useRef<Coin[]>(JSON.parse(JSON.stringify(level.coins)));
  const particlesRef = useRef<Particle[]>([]);
  
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const cameraXRef = useRef<number>(0);

  // Initialize level
  useEffect(() => {
    playerRef.current = {
      x: level.playerStart.x,
      y: level.playerStart.y,
      vx: 0,
      vy: 0,
      w: 30,
      h: 50,
      isGrounded: false,
      jumpCount: 0,
      facingRight: true,
      isDead: false,
      score: 0,
      lives: 3
    };
    platformsRef.current = level.platforms;
    enemiesRef.current = JSON.parse(JSON.stringify(level.enemies));
    coinsRef.current = JSON.parse(JSON.stringify(level.coins));
    particlesRef.current = [];
    cameraXRef.current = 0;
    startTimeRef.current = Date.now();
    
    onScoreUpdate(0);
    onLivesUpdate(3);
  }, [level]);

  // Utility: Particle creation (hoisted for use in handlers)
  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        color,
        size: Math.random() * 5 + 2
      });
    }
  };

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      
      // Prevent scrolling
      if(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
          e.preventDefault();
      }

      // Jump Logic (Handled here for single-press detection)
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        const player = playerRef.current;
        if (!player.isDead) {
          if (player.isGrounded) {
            // Normal Jump
            player.vy = JUMP_FORCE;
            player.isGrounded = false;
            player.jumpCount = 1;
            createParticles(player.x + player.w/2, player.y + player.h, '#FFFFFF', 5);
          } else if (player.jumpCount < 2) {
            // Double Jump
            player.vy = JUMP_FORCE; // Full force reset
            player.jumpCount = 2;
            createParticles(player.x + player.w/2, player.y + player.h, '#00FFFF', 8); // Cyan particles for double jump
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      // Variable jump height
      if ((e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') && playerRef.current.vy < -5) {
        playerRef.current.vy *= 0.5; // Cut velocity on release
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Utility: AABB Collision
  const checkCollision = (r1: Rect, r2: Rect) => {
    return (
      r1.x < r2.x + r2.w &&
      r1.x + r1.w > r2.x &&
      r1.y < r2.y + r2.h &&
      r1.y + r1.h > r2.y
    );
  };

  const update = () => {
    const player = playerRef.current;
    
    if (player.isDead) return;

    // --- Horizontal Movement ---
    if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
      player.vx -= MOVE_SPEED;
      player.facingRight = false;
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
      player.vx += MOVE_SPEED;
      player.facingRight = true;
    }

    // Friction & Limit
    player.vx *= FRICTION;
    if (player.vx > MAX_SPEED) player.vx = MAX_SPEED;
    if (player.vx < -MAX_SPEED) player.vx = -MAX_SPEED;

    // Apply Velocity X
    player.x += player.vx;

    // Wall Collisions
    platformsRef.current.forEach(plat => {
      if (plat.type === 'solid' && checkCollision(player, plat)) {
        if (player.vx > 0) { // Moving right, hit left wall
          player.x = plat.x - player.w;
          player.vx = 0;
        } else if (player.vx < 0) { // Moving left, hit right wall
          player.x = plat.x + plat.w;
          player.vx = 0;
        }
      }
    });

    // --- Vertical Movement ---
    // Note: Jump initiation is now in handleKeyDown

    // Gravity
    player.vy += GRAVITY;
    player.y += player.vy;
    player.isGrounded = false;

    // Floor/Ceiling Collisions
    platformsRef.current.forEach(plat => {
      if (checkCollision(player, plat)) {
        if (player.vy > 0) { // Falling
          // For one-way platforms, only collide if we were above it before
          if (plat.type === 'oneway' && player.y + player.h - player.vy > plat.y) return;
          
          player.y = plat.y - player.h;
          player.vy = 0;
          player.isGrounded = true;
          player.jumpCount = 0; // Reset jumps on landing
        } else if (player.vy < 0 && plat.type === 'solid') { // Jumping up
          player.y = plat.y + plat.h;
          player.vy = 0;
        }
      }
    });

    // Death Plane
    if (player.y > level.platforms.reduce((max, p) => Math.max(max, p.y), 0) + 500) {
       handleDeath();
    }

    // --- Interaction: Coins ---
    coinsRef.current.forEach(coin => {
      if (!coin.collected && checkCollision(player, coin)) {
        coin.collected = true;
        player.score += 100;
        onScoreUpdate(player.score);
        createParticles(coin.x + 10, coin.y + 10, '#FFD700', 5);
      }
    });

    // --- Interaction: Enemies ---
    enemiesRef.current.forEach(enemy => {
      // Enemy Logic (Simple patrol)
      enemy.x += enemy.vx;
      if (enemy.x > enemy.patrolEnd || enemy.x < enemy.patrolStart) {
        enemy.vx *= -1;
      }

      if (checkCollision(player, enemy)) {
        // Stomp Check: Falling downwards and hitting top of enemy
        const hitTop = player.y + player.h - player.vy <= enemy.y + enemy.h * 0.5;
        
        if (player.vy > 0 && hitTop) {
          // Kill Enemy
          enemy.y = 99999; // Remove
          player.vy = BOUNCE_FORCE;
          player.score += 200;
          // Stomping resets jump count (optional, but feels good like in Mario)
          // player.jumpCount = 0; 
          onScoreUpdate(player.score);
          createParticles(enemy.x + enemy.w/2, enemy.y + enemy.h/2, '#FF0000', 10);
        } else {
          // Player Hurt
          handleDeath();
        }
      }
    });

    // --- Interaction: Goal ---
    if (checkCollision(player, level.goal)) {
       cancelAnimationFrame(requestRef.current!);
       const endTime = Date.now();
       const duration = (endTime - startTimeRef.current) / 1000;
       onGameOver(player.score, duration, true);
       return;
    }

    // --- Camera Update ---
    // Keep player in middle 1/3rd of screen
    let targetCamX = player.x - CANVAS_WIDTH / 3;
    if (targetCamX < 0) targetCamX = 0;
    // Smooth lerp
    cameraXRef.current += (targetCamX - cameraXRef.current) * 0.1;

    // --- Particles Update ---
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
  };

  const handleDeath = () => {
    const player = playerRef.current;
    if (player.isDead) return;
    
    player.lives -= 1;
    onLivesUpdate(player.lives);
    createParticles(player.x, player.y, '#FFFFFF', 20);

    if (player.lives <= 0) {
      player.isDead = true;
      const endTime = Date.now();
      const duration = (endTime - startTimeRef.current) / 1000;
      setTimeout(() => onGameOver(player.score, duration, false), 1000);
    } else {
      // Respawn
      player.x = level.playerStart.x;
      player.y = level.playerStart.y;
      player.vx = 0;
      player.vy = 0;
      player.jumpCount = 0;
      cameraXRef.current = 0;
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear
    ctx.fillStyle = level.theme.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    ctx.translate(-Math.floor(cameraXRef.current), 0);

    // Draw Platforms
    platformsRef.current.forEach(plat => {
      ctx.fillStyle = plat.color;
      // Simple texture/border
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(plat.x, plat.y + plat.h - 5, plat.w, 5); // Shadow
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(plat.x, plat.y, plat.w, 5); // Highlight
    });

    // Draw Goal
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(level.goal.x, level.goal.y, 10, level.goal.h);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(level.goal.x + 10, level.goal.y);
    ctx.lineTo(level.goal.x + 50, level.goal.y + 20);
    ctx.lineTo(level.goal.x + 10, level.goal.y + 40);
    ctx.fill();

    // Draw Coins
    coinsRef.current.forEach(coin => {
      if (!coin.collected) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(coin.x + coin.w/2, coin.y + coin.h/2, coin.w/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw Enemies
    enemiesRef.current.forEach(enemy => {
        if(enemy.y > 5000) return; // Dead
        
        ctx.fillStyle = enemy.type === EntityType.ENEMY_FLYER ? '#9C27B0' : '#FF5722';
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
        
        // Eyes
        ctx.fillStyle = 'white';
        const dirOffset = enemy.vx > 0 ? 5 : -5;
        ctx.fillRect(enemy.x + enemy.w/2 + dirOffset - 5, enemy.y + 10, 5, 5);
        if (enemy.type === EntityType.ENEMY_FLYER) {
            // Wings
            ctx.fillStyle = '#E1BEE7';
            ctx.fillRect(enemy.x - 10, enemy.y + 5, 10, 10);
            ctx.fillRect(enemy.x + enemy.w, enemy.y + 5, 10, 10);
        }
    });

    // Draw Player
    const p = playerRef.current;
    if (!p.isDead) {
      ctx.fillStyle = '#F44336'; // Mario-ish Red
      ctx.fillRect(p.x, p.y, p.w, p.h);
      
      // Overalls
      ctx.fillStyle = '#2196F3';
      ctx.fillRect(p.x, p.y + p.h * 0.6, p.w, p.h * 0.4);
      
      // Face
      ctx.fillStyle = '#FFCCBC'; // Skin
      ctx.fillRect(p.x + 5, p.y + 5, p.w - 10, 15);

      // Eye (direction aware)
      ctx.fillStyle = 'black';
      if (p.facingRight) {
        ctx.fillRect(p.x + p.w - 10, p.y + 8, 4, 4);
      } else {
        ctx.fillRect(p.x + 6, p.y + 8, 4, 4);
      }
    }

    // Draw Particles
    particlesRef.current.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = pt.life;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      ctx.globalAlpha = 1.0;
    });

    ctx.restore();
  };

  const tick = () => {
    update();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        draw(ctx);
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      width={CANVAS_WIDTH} 
      height={CANVAS_HEIGHT} 
      className="block mx-auto border-4 border-white shadow-2xl bg-black rounded-lg cursor-none"
    />
  );
};

export default GameCanvas;