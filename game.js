'use strict';

/* ================================================================
   Shane's Wild Night — Pac-Man style maze game
   ================================================================ */

// ── Cell types ───────────────────────────────────────────────────
const C = { WALL: 0, PELLET: 1, HOTDOG: 2, BEER: 3, EMPTY: 4 };

// ── 15×15 Maze — perfectly symmetric: row[c] === row[14-c] ────────
// 0=wall  1=pellet  2=hotdog(power)  3=beer  4=empty open path
const MAZE_SRC = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // row 0
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // row 1
  [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],  // row 2  ← fixed
  [0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0],  // row 3
  [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],  // row 4  ← fixed
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // row 5
  [0, 1, 0, 0, 1, 0, 4, 4, 4, 0, 1, 0, 0, 1, 0],  // row 6
  [0, 1, 0, 0, 1, 0, 4, 4, 4, 0, 1, 0, 0, 1, 0],  // row 7
  [0, 1, 0, 0, 1, 0, 4, 4, 4, 0, 1, 0, 0, 1, 0],  // row 8
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // row 9
  [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],  // row 10 ← fixed
  [0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0],  // row 11
  [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],  // row 12 ← fixed
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // row 13
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // row 14
];
const ROWS = MAZE_SRC.length;    // 15
const COLS = MAZE_SRC[0].length; // 15

// Beer positions — valid path cells in the symmetric maze
const BEER_CELLS = [[1, 7], [5, 4], [5, 10], [9, 4], [9, 10], [13, 4], [13, 10]];

// ── Game constants ────────────────────────────────────────────────
const SHANE_SPEED = 7.5;  // cells per second
const COP_SPEED = 5.0;
const EMI_SPEED = 5.5;  // slower than Shane — helpful but not perfect
const EAT_TIME = 0.22; // seconds show eat sprite
const DRUNK_LIMIT = 4;
const DRUNK_DUR = 8.0;
const HDOGS_FOR_INV = 3;    // hotdogs to go invincible
const INV_DUR = 10.0;
const SCORE_PELLET = 10;
const SCORE_HOTDOG = 200;
const SCORE_BEER = 50;
const SCORE_COP = 300;

// ── Images ───────────────────────────────────────────────────────
const IMG = {};
const IMG_SRCS = {
  shaneUp: 'up movement.png', shaneDown: 'down movement.png',
  shaneLeft: 'left movement.png', shaneRight: 'right movement.png',
  eatUp: 'up eat.png', eatDown: 'down eat.png',
  eatLeft: 'left eat.png', eatRight: 'right eat.png',
  drunkUp: 'drunk up.png', drunkDown: 'drunk down.png',
  drunkLeft: 'drunk left.png', drunkRight: 'drunk right.png',
  cop: 'cop.png', hotdog: 'hotdog.png', beer: 'beer.png', eminem: 'eminem.png',
};

function loadImages(cb) {
  let n = 0, total = Object.keys(IMG_SRCS).length;
  for (const [k, s] of Object.entries(IMG_SRCS)) {
    const img = new Image();
    img.src = s;
    img.onload = img.onerror = () => { if (++n === total) cb(); };
    IMG[k] = img;
  }
}

// ── DOM ──────────────────────────────────────────────────────────
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const beersEl = document.getElementById('beers');
const statusEl = document.getElementById('status-label');
const finalScoreEl = document.getElementById('final-score');
const endTitleEl = document.getElementById('end-title');
const endMessageEl = document.getElementById('end-message');

// ── Audio ─────────────────────────────────────────────
const MAIN_TRACK = new Audio('Shane! (Get Those Hot Dogs).mp3');
const EMI_TRACK  = new Audio('Eminem - My Name Is (Explicit).mp3');
MAIN_TRACK.loop = true;
EMI_TRACK.loop  = true;
MAIN_TRACK.volume = 0;
EMI_TRACK.volume  = 0;

let _fadingMain = null;  // setInterval IDs for cross-fade
let _fadingEmi  = null;

function _fade(audio, targetVol, durationMs, onDone) {
  const steps = 30;
  const interval = durationMs / steps;
  const startVol = audio.volume;
  const delta    = (targetVol - startVol) / steps;
  let   step     = 0;
  const id = setInterval(() => {
    step++;
    audio.volume = Math.min(1, Math.max(0, startVol + delta * step));
    if (step >= steps) {
      clearInterval(id);
      audio.volume = targetVol;
      if (onDone) onDone();
    }
  }, interval);
  return id;
}

function audioStartMain() {
  // User gesture already happened (button click), safe to play
  if (_fadingMain) clearInterval(_fadingMain);
  if (_fadingEmi)  clearInterval(_fadingEmi);
  EMI_TRACK.pause(); EMI_TRACK.currentTime = 0; EMI_TRACK.volume = 0;
  MAIN_TRACK.currentTime = 0;
  MAIN_TRACK.play().catch(() => {}); // ignore autoplay policy errors
  _fadingMain = _fade(MAIN_TRACK, 0.75, 800);
}

function audioCrossfadeToEminem() {
  if (_fadingMain) clearInterval(_fadingMain);
  if (_fadingEmi)  clearInterval(_fadingEmi);
  // Fade main down
  _fadingMain = _fade(MAIN_TRACK, 0, 600, () => MAIN_TRACK.pause());
  // Fade eminem in
  EMI_TRACK.currentTime = 0;
  EMI_TRACK.play().catch(() => {});
  _fadingEmi = _fade(EMI_TRACK, 0.8, 600);
}

function audioCrossfadeToMain() {
  if (_fadingMain) clearInterval(_fadingMain);
  if (_fadingEmi)  clearInterval(_fadingEmi);
  // Fade eminem down
  _fadingEmi = _fade(EMI_TRACK, 0, 800, () => { EMI_TRACK.pause(); EMI_TRACK.currentTime = 0; });
  // Fade main back in
  MAIN_TRACK.play().catch(() => {});
  _fadingMain = _fade(MAIN_TRACK, 0.75, 800);
}

function audioStop() {
  if (_fadingMain) clearInterval(_fadingMain);
  if (_fadingEmi)  clearInterval(_fadingEmi);
  _fade(MAIN_TRACK, 0, 400, () => MAIN_TRACK.pause());
  _fade(EMI_TRACK,  0, 400, () => EMI_TRACK.pause());
}

// ── Helpers ─────────────────────────────────────────────────────
function isWalkable(maze, r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
  return maze[r][c] !== C.WALL;
}

const DIRS = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

// ── BFS shortest path (1 step) for cops ──────────────────────────
function bfsNext(maze, fromR, fromC, toR, toC, forbidDir) {
  if (fromR === toR && fromC === toC) return null;
  const queue = [[fromR, fromC, null]];
  const visited = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
  visited[fromR][fromC] = true;
  while (queue.length) {
    const [r, c, firstDir] = queue.shift();
    for (const [dname, { dr, dc }] of Object.entries(DIRS)) {
      if (forbidDir && dname === forbidDir) continue;
      const nr = r + dr, nc = c + dc;
      if (!isWalkable(maze, nr, nc) || visited[nr][nc]) continue;
      visited[nr][nc] = true;
      const fd = firstDir || dname;
      if (nr === toR && nc === toC) return fd;
      queue.push([nr, nc, fd]);
    }
  }
  return null;
}

// ── Entity factory ───────────────────────────────────────────────
function makeEntity(row, col, dir) {
  return {
    row, col,           // current destination cell
    fromRow: row,
    fromCol: col,
    progress: 1,        // 1 = arrived at cell
    dir,
    nextDir: dir,
    moving: false,
  };
}

// ── Pixel position of entity center ──────────────────────────────
function entityPx(e, cs, ox, oy) {
  const x = ox + (e.fromCol + (e.col - e.fromCol) * e.progress + 0.5) * cs;
  const y = oy + (e.fromRow + (e.row - e.fromRow) * e.progress + 0.5) * cs;
  return { x, y };
}

// ── Particle system ──────────────────────────────────────────────
const particles = [];
function spawnPt(x, y, text, color) {
  particles.push({ x, y, text, color, life: 1, vy: -40 });
}
function updatePts(dt) {
  for (const p of particles) { p.y += p.vy * dt; p.life -= dt * 1.1; }
  particles.splice(0, particles.length, ...particles.filter(p => p.life > 0));
}
function drawPts() {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.font = 'bold 18px Nunito,sans-serif';
    ctx.fillStyle = p.color;
    ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  }
}

// ── Main state ───────────────────────────────────────────────────
let state = null;
let raf = null;

function buildState() {
  // Deep copy maze
  const maze = MAZE_SRC.map(r => [...r]);
  // Inject beers
  for (const [r, c] of BEER_CELLS) if (maze[r][c] === C.PELLET) maze[r][c] = C.BEER;

  // Count ALL collectibles for win condition (pellets + hotdogs + beers)
  let totalDots = 0;
  for (const row of maze) for (const cell of row)
    if (cell === C.PELLET || cell === C.HOTDOG || cell === C.BEER) totalDots++;


  return {
    maze,
    totalDots,
    dotsEaten: 0,
    score: 0,
    lives: 3,
    beerCount: 0,
    hdogsRun: 0,       // hotdogs eaten this power-up run
    // timers (seconds)
    isDrunk: false, drunkT: 0,
    isInv: false, invT: 0,
    isGrace: false,
    beerStreak: 0,   // consecutive beers without a hotdog in between
    // Shane
    shane: { ...makeEntity(13, 7, 'right'), nextDir: null, eatT: 0 },
    // Eminem
    eminem: { ...makeEntity(13, 5, 'right'), active: false },
    // Cops — start in house cells
    cops: [
      { ...makeEntity(7, 6, 'left'), eaten: false },
      { ...makeEntity(7, 7, 'up'), eaten: false },
      { ...makeEntity(7, 8, 'right'), eaten: false },
    ],
    running: true,
    lastTime: null,
  };
}

// ── Update entity movement ────────────────────────────────────────
function stepEntity(e, speed, dt, maze, wantDir, flee) {
  if (e.progress < 1) {
    e.progress = Math.min(1, e.progress + speed * dt);
    return;
  }
  // Arrived — decide next cell
  e.fromRow = e.row;
  e.fromCol = e.col;

  // For Shane: try queued direction first, then current
  let chosen = null;
  const tryDir = (d) => {
    const { dr, dc } = DIRS[d];
    if (isWalkable(maze, e.row + dr, e.col + dc)) return d;
    return null;
  };

  if (wantDir) { // Shane — don't move until a direction has been chosen by the player
    if (!e.nextDir) return;
    chosen = tryDir(e.nextDir) || tryDir(e.dir);
  } else {     // cop / eminem
    chosen = wantDir === null ? null : wantDir;
  }

  if (!chosen) {
    e.moving = false;
    return;
  }
  e.moving = true;
  e.dir = chosen;
  if (wantDir) e.nextDir = chosen; // update Shane's queued dir if changed
  const { dr, dc } = DIRS[chosen];
  e.row += dr;
  e.col += dc;
  e.progress = 0;
}

function stepCop(cop, speed, dt, maze, shane, isInv) {
  if (cop.eaten) return;
  if (cop.progress < 1) { cop.progress = Math.min(1, cop.progress + speed * dt); return; }

  cop.fromRow = cop.row; cop.fromCol = cop.col;

  // Decide: chase Shane or flee
  let targetR = shane.row, targetC = shane.col;
  const forbid = OPPOSITE[cop.dir]; // don't go back

  let nextD;
  if (isInv) {
    // Flee: pick dir that maximizes distance from Shane
    let bestD = null, bestDist = -1;
    for (const [d, { dr, dc }] of Object.entries(DIRS)) {
      if (d === forbid) continue;
      const nr = cop.row + dr, nc = cop.col + dc;
      if (!isWalkable(maze, nr, nc)) continue;
      const dist = (nr - targetR) ** 2 + (nc - targetC) ** 2;
      if (dist > bestDist) { bestDist = dist; bestD = d; }
    }
    nextD = bestD;
  } else {
    nextD = bfsNext(maze, cop.row, cop.col, targetR, targetC, forbid);
    // Fallback: any valid dir excluding back
    if (!nextD) {
      for (const [d, { dr, dc }] of Object.entries(DIRS)) {
        if (d === forbid) continue;
        if (isWalkable(maze, cop.row + dr, cop.col + dc)) { nextD = d; break; }
      }
    }
  }
  if (!nextD) return;
  cop.dir = nextD;
  const { dr, dc } = DIRS[nextD];
  cop.row += dr; cop.col += dc;
  cop.progress = 0;
}

function stepEminem(emi, speed, dt, maze, cops, shane, isInv) {
  if (!emi.active) return;
  if (emi.progress < 1) { emi.progress = Math.min(1, emi.progress + speed * dt); return; }

  emi.fromRow = emi.row; emi.fromCol = emi.col;
  const forbid = OPPOSITE[emi.dir];

  let targetR, targetC;
  if (isInv) {
    // Chase nearest living cop
    let best = null, bd = Infinity;
    for (const cop of cops) {
      if (cop.eaten) continue;
      const d = Math.abs(cop.row - emi.row) + Math.abs(cop.col - emi.col);
      if (d < bd) { bd = d; best = cop; }
    }
    if (best) { targetR = best.row; targetC = best.col; }
    else { targetR = shane.row; targetC = shane.col; }
  } else {
    // follow Shane
    targetR = shane.row; targetC = shane.col;
  }

  // 40% of the time Eminem wanders randomly instead of beelining — helpful but not OP
  let nextD;
  if (Math.random() < 0.6) {
    nextD = bfsNext(maze, emi.row, emi.col, targetR, targetC, forbid);
  }
  if (!nextD) {
    // random valid direction (excluding back)
    const dirs = Object.entries(DIRS).filter(([d, { dr, dc }]) =>
      d !== forbid && isWalkable(maze, emi.row + dr, emi.col + dc));
    if (dirs.length) nextD = dirs[Math.floor(Math.random() * dirs.length)][0];
  }
  if (!nextD) return;
  emi.dir = nextD;
  const { dr, dc } = DIRS[nextD];
  emi.row += dr; emi.col += dc;
  emi.progress = 0;
}

// ── Input ────────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

function readInput(shane) {
  if (keys['ArrowUp'] || keys['w'] || keys['W']) shane.nextDir = 'up';
  if (keys['ArrowDown'] || keys['s'] || keys['S']) shane.nextDir = 'down';
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) shane.nextDir = 'left';
  if (keys['ArrowRight'] || keys['d'] || keys['D']) shane.nextDir = 'right';
}

function setupDPad() {
  const map = [['btn-up', 'up'], ['btn-down', 'down'], ['btn-left', 'left'], ['btn-right', 'right']];
  map.forEach(([id, dir]) => {
    const btn = document.getElementById(id);
    btn.addEventListener('pointerdown', e => { e.preventDefault(); if (state) state.shane.nextDir = dir; });
  });
}

// touch swipe on canvas
let swipeXY = null;
canvas.addEventListener('touchstart', e => { swipeXY = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
canvas.addEventListener('touchend', e => {
  if (!swipeXY || !state) return;
  const dx = e.changedTouches[0].clientX - swipeXY.x, dy = e.changedTouches[0].clientY - swipeXY.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) {
    state.shane.nextDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
  swipeXY = null;
}, { passive: true });

// ── Sizing ───────────────────────────────────────────────────────
function resizeCanvas() {
  const w = document.getElementById('canvas-wrapper');
  canvas.width = Math.floor(w.clientWidth);
  canvas.height = Math.floor(w.clientHeight);
}
function cellSize() { return Math.floor(Math.min(canvas.width / COLS, canvas.height / ROWS)); }
function mazeOffset(cs) { return { ox: Math.floor((canvas.width - COLS * cs) / 2), oy: Math.floor((canvas.height - ROWS * cs) / 2) }; }

// ── Draw ─────────────────────────────────────────────────────────
function drawSprite(img, cx, cy, size) {
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
  } else {
    ctx.fillStyle = '#f5a623';
    ctx.beginPath(); ctx.arc(cx, cy, size / 2, 0, Math.PI * 2); ctx.fill();
  }
}

// ── Shane sprite selection ───────────────────────────────────────
function getShaneImg(shane) {
  const d = shane.dir || 'right';
  if (state.isDrunk) {
    return IMG[{ up: 'drunkUp', down: 'drunkDown', left: 'drunkLeft', right: 'drunkRight' }[d]];
  }
  // Chomp: alternate between movement and eat sprite on a ~6Hz cycle while moving
  const chomp = shane.moving && Math.floor(glowT * 6) % 2 === 0;
  if (chomp) {
    return IMG[{ up: 'eatUp', down: 'eatDown', left: 'eatLeft', right: 'eatRight' }[d]];
  }
  return IMG[{ up: 'shaneUp', down: 'shaneDown', left: 'shaneLeft', right: 'shaneRight' }[d]];
}

const WALL_COLOR = '#1a1a5e';
const WALL_BORDER = '#4444cc';
const PELLET_CLR = '#f0d080';

function drawMaze(maze, cs, ox, oy) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const px = ox + c * cs, py = oy + r * cs;
      const cell = maze[r][c];
      if (cell === C.WALL) {
        ctx.fillStyle = WALL_COLOR;
        ctx.fillRect(px, py, cs, cs);
        ctx.strokeStyle = WALL_BORDER;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px + 0.75, py + 0.75, cs - 1.5, cs - 1.5);
      } else {
        ctx.fillStyle = '#05050f'; ctx.fillRect(px, py, cs, cs);
        // dot
        if (cell === C.PELLET) {
          const r2 = cs * 0.08;
          ctx.fillStyle = PELLET_CLR;
          ctx.beginPath();
          ctx.arc(px + cs / 2, py + cs / 2, r2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}

function drawCollectibles(maze, cs, ox, oy) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = maze[r][c];
      const cx = ox + (c + 0.5) * cs, cy = oy + (r + 0.5) * cs;
      if (cell === C.HOTDOG) {
        const sz = cs * 0.75;
        drawSprite(IMG.hotdog, cx, cy, sz);
      } else if (cell === C.BEER) {
        const sz = cs * 0.65;
        drawSprite(IMG.beer, cx, cy, sz);
      }
    }
  }
}

let glowT = 0;
function drawScene(dt) {
  glowT += dt;
  const cs = cellSize();
  const { ox, oy } = mazeOffset(cs);
  const { maze, shane, eminem, cops, isInv, isDrunk } = state;

  ctx.fillStyle = '#05050f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // invincible flashing bg
  if (isInv) {
    ctx.save();
    ctx.globalAlpha = 0.05 + 0.04 * Math.sin(glowT * 12);
    ctx.fillStyle = `hsl(${glowT * 180 % 360},100%,60%)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  drawMaze(maze, cs, ox, oy);
  drawCollectibles(maze, cs, ox, oy);

  const spSize = cs * 0.95;

  // Eminem
  if (eminem.active) {
    const p = entityPx(eminem, cs, ox, oy);
    drawSprite(IMG.eminem, p.x, p.y, spSize);
  }

  // Cops
  cops.forEach(cop => {
    if (cop.eaten) return;
    const p = entityPx(cop, cs, ox, oy);
    ctx.save();
    if (isInv) {
      // Flash blue when vulnerable
      ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(glowT * 8));
    }
    drawSprite(IMG.cop, p.x, p.y, spSize);
    ctx.restore();
  });

  // Shane
  {
    const p = entityPx(shane, cs, ox, oy);
    const img = getShaneImg(shane);
    // Invincible aura
    if (isInv) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = `hsl(${glowT * 200 % 360},100%,60%)`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, cs * 0.52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // Grace flicker
    if (state.isGrace && Math.floor(glowT * 10) % 2 === 0) {
      ctx.save(); ctx.globalAlpha = 0.4;
      drawSprite(img, p.x, p.y, spSize);
      ctx.restore();
    } else {
      drawSprite(img, p.x, p.y, spSize);
    }
  }

  // Drunk overlay
  if (isDrunk) {
    ctx.save();
    ctx.globalAlpha = 0.06 + 0.04 * Math.abs(Math.sin(glowT * 3));
    ctx.fillStyle = '#3498db';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  drawPts();

  // Progress bars (bottom of canvas)
  const barY = canvas.height - 10;
  if (isInv) {
    const frac = Math.max(0, state.invT / INV_DUR);
    const bw = canvas.width * 0.7, bx = (canvas.width - bw) / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(bx, barY - 6, bw, 5);
    const g = ctx.createLinearGradient(bx, 0, bx + bw * frac, 0);
    g.addColorStop(0, '#f5a623'); g.addColorStop(1, '#e84393');
    ctx.fillStyle = g; ctx.fillRect(bx, barY - 6, bw * frac, 5);
  }
  if (isDrunk) {
    const frac = Math.max(0, state.drunkT / DRUNK_DUR);
    const bw = canvas.width * 0.5, bx = (canvas.width - bw) / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(bx, barY - 6, bw, 5);
    ctx.fillStyle = '#3498db'; ctx.fillRect(bx, barY - 6, bw * frac, 5);
  }

  // Hotdog progress indicator (top of maze area)
  if (!isInv && state.hdogsRun > 0) {
    const prog = state.hdogsRun / HDOGS_FOR_INV;
    const bw = cs * COLS * 0.4, bx = ox + (cs * COLS - bw) / 2, by2 = oy - 8;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(bx, by2, bw, 4);
    ctx.fillStyle = '#f5a623'; ctx.fillRect(bx, by2, bw * prog, 4);
  }
}

// ── HUD ──────────────────────────────────────────────────────────
function updateHUD() {
  scoreEl.textContent = state.score;
  livesEl.textContent = '';        // no lives — one hit kills
  beersEl.textContent = `🍺×${state.beerStreak}`;

  if (!state.isDrunk && !state.isInv) {
    if (state.hdogsRun > 0) {
      const left = HDOGS_FOR_INV - state.hdogsRun;
      statusEl.style.color = '#f5a623';
      statusEl.textContent = left > 0 ? `🌭 ${left} more → POWER!` : '';
    } else {
      statusEl.textContent = '';
    }
  }
}

// ── Collisions ───────────────────────────────────────────────────
function checkCollisions() {
  const { shane, cops, eminem, maze, isInv, isGrace } = state;
  // only check when arrived at a cell
  if (shane.progress < 0.5) return;

  const r = shane.row, c = shane.col;
  const cell = maze[r][c];

  if (cell === C.PELLET) {
    maze[r][c] = C.EMPTY;
    state.score += SCORE_PELLET;
    state.dotsEaten++;
  } else if (cell === C.HOTDOG) {
    maze[r][c] = C.EMPTY;
    state.score += SCORE_HOTDOG;
    state.dotsEaten++;
    state.hdogsRun++;
    state.beerStreak = 0;  // reset beer streak — hotdog sobers between beers
    const cx2 = entityPx(shane, cellSize(), mazeOffset(cellSize()).ox, mazeOffset(cellSize()).oy);
    spawnPt(cx2.x, cx2.y - 20, '🌭 +200!', '#f5a623');
    if (state.hdogsRun >= HDOGS_FOR_INV && !state.isInv) triggerInv();
  } else if (cell === C.BEER) {
    maze[r][c] = C.EMPTY;
    state.score += SCORE_BEER;
    state.dotsEaten++;
    state.beerStreak++;    // only consecutive beers count toward drunk
    state.beerCount = state.beerStreak;
    const cx2 = entityPx(shane, cellSize(), mazeOffset(cellSize()).ox, mazeOffset(cellSize()).oy);
    spawnPt(cx2.x, cx2.y - 20, '🍺 +50', '#3498db');
    if (state.beerStreak >= DRUNK_LIMIT && !state.isDrunk) triggerDrunk();
  }

  // Cop collisions — one hit = instant game over
  cops.forEach(cop => {
    if (cop.eaten) return;
    const close = cop.row === r && cop.col === c;
    const crossOver =
      cop.fromRow === r && cop.fromCol === c && cop.row === shane.fromRow && cop.col === shane.fromCol;
    if (close || crossOver) {
      if (isInv) {
        cop.eaten = true;
        state.score += SCORE_COP;
        const cp = entityPx(cop, cellSize(), mazeOffset(cellSize()).ox, mazeOffset(cellSize()).oy);
        spawnPt(cp.x, cp.y - 20, '🚔 +300', '#2ecc71');
      } else {
        endGame(false);  // instant death
      }
    }
  });

  // Eminem eats cops
  if (isInv && eminem.active) {
    const er = eminem.row, ec = eminem.col;
    cops.forEach(cop => {
      if (cop.eaten) return;
      if (cop.row === er && cop.col === ec) {
        cop.eaten = true;
        state.score += SCORE_COP;
        const cp = entityPx(cop, cellSize(), mazeOffset(cellSize()).ox, mazeOffset(cellSize()).oy);
        spawnPt(cp.x, cp.y - 20, '💨 +300', '#2ecc71');
      }
    });
  }
}

// loseLife removed — cops now cause instant game over via endGame(false)

function triggerDrunk() {
  state.isDrunk = true;
  state.drunkT = DRUNK_DUR;
  statusEl.textContent = '🥴 DRUNK MODE!';
  statusEl.style.color = '#3498db';
  canvas.style.filter = 'hue-rotate(220deg) saturate(1.5)';
}

function triggerInv() {
  state.isInv = true;
  state.invT = INV_DUR;
  state.hdogsRun = 0;
  state.eminem.active = true;
  // spawn eminem adjacent to Shane
  state.eminem.row = state.shane.row;
  state.eminem.col = Math.max(1, state.shane.col - 1);
  state.eminem.fromRow = state.eminem.row;
  state.eminem.fromCol = state.eminem.col;
  state.eminem.progress = 1;
  state.eminem.dir = 'right';
  statusEl.textContent = '🔥 INVINCIBLE! Eminem\'s here!';
  statusEl.style.color = '#f5a623';
  canvas.classList.add('invincible');
  audioCrossfadeToEminem();
}

// ── Timers ───────────────────────────────────────────────────────
function updateTimers(dt) {
  if (state.isDrunk) {
    state.drunkT -= dt;
    if (state.drunkT <= 0) {
      state.isDrunk = false;
      state.beerCount = 0;
      beersEl.textContent = '🍺×0';
      canvas.style.filter = 'none';
      if (!state.isInv) { statusEl.textContent = '😌 Sobered up!'; statusEl.style.color = '#8888aa'; }
      setTimeout(() => { if (state && !state.isDrunk && !state.isInv) statusEl.textContent = ''; }, 2000);
    }
  }
  if (state.isInv) {
    state.invT -= dt;
    if (state.invT <= 0) {
      state.isInv = false;
      state.eminem.active = false;
      canvas.classList.remove('invincible');
      audioCrossfadeToMain();
      statusEl.textContent = '😮 Back to normal...';
      setTimeout(() => { if (state && !state.isInv && !state.isDrunk) statusEl.textContent = ''; }, 2000);
    }
  }
}

// ── Win check ────────────────────────────────────────────────────
function checkWin() {
  // Win only when every collectible on the board is eaten
  if (state.dotsEaten >= state.totalDots) endGame(true);
}

function endGame(won) {
  state.running = false;
  canvas.style.filter = 'none';
  canvas.classList.remove('invincible');
  audioStop();
  gameScreen.classList.add('hidden');

  if (won) {
    showWinScreen(state.score);
  } else {
    finalScoreEl.textContent = state.score;
    endTitleEl.textContent  = '🚔 BUSTED!';
    endMessageEl.textContent = `The cops finally got Shane. Better luck next time!`;
    gameoverScreen.classList.remove('hidden');
  }
}

// ── Victory screen sequence ───────────────────────────────────────
function showWinScreen(score) {
  const winScreen   = document.getElementById('win-screen');
  const bubble      = document.getElementById('speech-bubble');
  const speechText  = document.getElementById('speech-text');
  const shaneImg    = document.getElementById('win-shane-img');
  const footer      = document.getElementById('win-footer');
  const scoreSpan   = document.getElementById('win-final-score');

  // Reset state
  bubble.classList.remove('visible');
  shaneImg.classList.remove('fadeIn');
  footer.classList.remove('visible');
  speechText.textContent = '';
  scoreSpan.textContent  = score;

  winScreen.classList.remove('hidden');

  const MSG = "Dayum homie! You ate them dogs up like a real gangsta! I knew you had it in you!";

  // Step 1 — after short pause, show bubble and typewrite the text
  setTimeout(() => {
    bubble.classList.add('visible');
    let i = 0;
    const typer = setInterval(() => {
      speechText.textContent += MSG[i++];
      if (i >= MSG.length) {
        clearInterval(typer);

        // Step 2 — after text finishes, fade Shane hearts in
        setTimeout(() => {
          shaneImg.classList.add('fadeIn');

          // Step 3 — after fade, reveal Play Again
          setTimeout(() => {
            footer.classList.add('visible');
          }, 1800);
        }, 800);
      }
    }, 38); // ~38ms per char ≈ 2.5 seconds total for the line
  }, 600);
}


// ── Game loop ────────────────────────────────────────────────────
function loop(ts) {
  if (!state || !state.running) { raf = null; return; }
  const dt = Math.min((ts - (state.lastTime || ts)) / 1000, 0.05);
  state.lastTime = ts;

  readInput(state.shane);

  const spd = state.isDrunk ? SHANE_SPEED * 0.55 : SHANE_SPEED;
  stepEntity(state.shane, spd, dt, state.maze, true, false);
  state.shane.eatT = Math.max(0, state.shane.eatT - dt);

  state.cops.forEach(cop => {
    stepCop(cop, COP_SPEED, dt, state.maze, state.shane, state.isInv);
  });
  stepEminem(state.eminem, EMI_SPEED, dt, state.maze, state.cops, state.shane, state.isInv);

  updateTimers(dt);
  checkCollisions();
  checkWin();
  updatePts(dt);
  updateHUD();
  drawScene(dt);

  raf = requestAnimationFrame(loop);
}

// ── Start game ───────────────────────────────────────────────────
function startGame() {
  startScreen.classList.add('hidden');
  gameoverScreen.classList.add('hidden');
  document.getElementById('win-screen').classList.add('hidden');
  gameScreen.classList.remove('hidden');
  canvas.style.filter = 'none';
  canvas.classList.remove('invincible');
  statusEl.textContent = '';
  Object.keys(keys).forEach(k => keys[k] = false);
  particles.splice(0);
  if (raf) cancelAnimationFrame(raf);
  resizeCanvas();
  state = buildState();
  audioStartMain();
  raf = requestAnimationFrame(loop);
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('win-restart-btn').addEventListener('click', startGame);

window.addEventListener('resize', () => {
  if (state && state.running) resizeCanvas();
});

setupDPad();
loadImages(() => console.log('Images ready'));
