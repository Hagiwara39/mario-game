(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const VIEW_W = canvas.width;
  const VIEW_H = canvas.height;
  const GRAVITY = 0.62;
  const MAX_FALL = 16;
  const GROUND_FRICTION = 0.78;
  const AIR_FRICTION = 0.90;
  const ACCEL = 0.9;
  const MAX_RUN = 6.2;
  const JUMP_V = -13.2;
  const JUMP_CUT = 0.45;
  const START_LIVES = 2;
  const MAX_LIVES = 5;

  const scoreEl = document.getElementById('score');
  const coinsEl = document.getElementById('coins');
  const worldEl = document.getElementById('world');
  const timeEl = document.getElementById('time');
  const livesEl = document.getElementById('lives');

  const startScreen = document.getElementById('start-screen');
  const gameoverScreen = document.getElementById('gameover-screen');
  const winScreen = document.getElementById('win-screen');
  const clearScreen = document.getElementById('levelclear-screen');
  const pauseHint = document.getElementById('pause-hint');
  const finalScoreEl = document.getElementById('final-score');
  const winScoreEl = document.getElementById('win-score');

  // ---------- input ----------
  const keys = {};
  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
    keys[e.key] = true;
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause();
  });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });

  const touchState = { left: false, right: false, jump: false };
  function bindTouch(id, prop) {
    const el = document.getElementById(id);
    const on = (e) => { e.preventDefault(); touchState[prop] = true; };
    const off = (e) => { e.preventDefault(); touchState[prop] = false; };
    el.addEventListener('touchstart', on, { passive: false });
    el.addEventListener('touchend', off, { passive: false });
    el.addEventListener('touchcancel', off, { passive: false });
    el.addEventListener('mousedown', on);
    el.addEventListener('mouseup', off);
    el.addEventListener('mouseleave', off);
  }
  bindTouch('btn-left', 'left');
  bindTouch('btn-right', 'right');
  bindTouch('btn-jump', 'jump');

  function isLeft() { return keys['ArrowLeft'] || keys['a'] || keys['A'] || touchState.left; }
  function isRight() { return keys['ArrowRight'] || keys['d'] || keys['D'] || touchState.right; }
  function isJump() { return keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' '] || touchState.jump; }

  // ---------- level definitions ----------
  function buildLevel1() {
    const groundY = 460;
    return {
      width: 3400,
      groundY,
      bg: '#5c94fc',
      label: '1-1',
      pits: [[900, 1020], [1700, 1790], [2450, 2560]],
      platforms: [
        { x: 520, y: 340, w: 160, h: 32, type: 'brick' },
        { x: 760, y: 260, w: 96, h: 32, type: 'brick' },
        { x: 1150, y: 380, w: 128, h: 32, type: 'brick' },
        { x: 1350, y: 300, w: 96, h: 32, type: 'brick' },
        { x: 1950, y: 360, w: 200, h: 32, type: 'brick' },
        { x: 2250, y: 280, w: 128, h: 32, type: 'brick' },
        { x: 2700, y: 380, w: 96, h: 32, type: 'brick' },
        { x: 2900, y: 300, w: 96, h: 32, type: 'brick' },
      ],
      questionBlocks: [
        { x: 560, y: 260 }, { x: 1180, y: 260 }, { x: 2000, y: 260 }, { x: 3000, y: 260 },
      ],
      coins: [
        { x: 600, y: 210 }, { x: 660, y: 210 }, { x: 1200, y: 300 },
        { x: 2000, y: 300 }, { x: 2280, y: 200 }, { x: 3040, y: 200 },
      ],
      hearts: [
        { x: 1360, y: 240 },
      ],
      goombas: [
        { x: 480 }, { x: 1250 }, { x: 1980 }, { x: 2300 }, { x: 3050 },
      ],
      flagX: 3300,
      castleX: 3360,
    };
  }

  function buildLevel2() {
    const groundY = 460;
    return {
      width: 3900,
      groundY,
      bg: '#2c3e6b',
      label: '1-2',
      pits: [[500, 600], [1100, 1230], [1600, 1680], [2200, 2340], [2900, 3060], [3400, 3520]],
      platforms: [
        { x: 300, y: 340, w: 128, h: 32, type: 'brick' },
        { x: 700, y: 380, w: 96, h: 32, type: 'brick' },
        { x: 900, y: 280, w: 96, h: 32, type: 'brick' },
        { x: 1260, y: 340, w: 160, h: 32, type: 'brick' },
        { x: 1500, y: 260, w: 96, h: 32, type: 'brick' },
        { x: 1850, y: 380, w: 128, h: 32, type: 'brick' },
        { x: 2050, y: 300, w: 96, h: 32, type: 'brick' },
        { x: 2400, y: 380, w: 200, h: 32, type: 'brick' },
        { x: 2650, y: 260, w: 96, h: 32, type: 'brick' },
        { x: 3100, y: 340, w: 160, h: 32, type: 'brick' },
        { x: 3550, y: 300, w: 128, h: 32, type: 'brick' },
      ],
      questionBlocks: [
        { x: 330, y: 260 }, { x: 1290, y: 260 }, { x: 2420, y: 300 }, { x: 3130, y: 260 },
      ],
      coins: [
        { x: 720, y: 300 }, { x: 930, y: 200 }, { x: 1530, y: 180 },
        { x: 1880, y: 300 }, { x: 2670, y: 180 }, { x: 3580, y: 220 },
      ],
      hearts: [
        { x: 2060, y: 250 },
      ],
      goombas: [
        { x: 350 }, { x: 950 }, { x: 1320 }, { x: 1900 }, { x: 2450 }, { x: 2700 }, { x: 3150 }, { x: 3600 },
      ],
      flagX: 3800,
      castleX: 3860,
    };
  }

  function buildLevel3() {
    const groundY = 460;
    return {
      width: 2760,
      groundY,
      bg: '#2a1a3d',
      label: '1-3',
      pits: [[560, 660], [1180, 1280], [1750, 1850]],
      platforms: [
        { x: 380, y: 340, w: 128, h: 32, type: 'brick' },
        { x: 820, y: 300, w: 96, h: 32, type: 'brick' },
        { x: 1000, y: 360, w: 128, h: 32, type: 'brick' },
        { x: 1380, y: 320, w: 160, h: 32, type: 'brick' },
        { x: 1620, y: 260, w: 96, h: 32, type: 'brick' },
        { x: 1950, y: 380, w: 128, h: 32, type: 'brick' },
      ],
      questionBlocks: [
        { x: 410, y: 260 }, { x: 1410, y: 240 },
      ],
      coins: [
        { x: 420, y: 210 }, { x: 850, y: 250 }, { x: 1030, y: 310 },
        { x: 1410, y: 270 }, { x: 1650, y: 210 },
      ],
      hearts: [
        { x: 1000, y: 300 }, { x: 1980, y: 320 },
      ],
      goombas: [
        { x: 300 }, { x: 900 }, { x: 1450 }, { x: 1990 },
      ],
      boss: { x: 2280, arenaMin: 2180, arenaMax: 2560, hp: 4 },
      bossGateX: 2610,
      flagX: 2680,
      castleX: 2720,
    };
  }

  const levels = [buildLevel1, buildLevel2, buildLevel3];
  let levelIndex = 0;
  let level = null;
  let solids = [];
  let coins = [];
  let hearts = [];
  let goombas = [];
  let boss = null;
  let gateSolid = null;
  let rocks = [];
  let popups = [];
  let particles = [];

  function loadLevel(idx) {
    level = levels[idx]();
    solids = [];
    let cursor = 0;
    const segs = [];
    for (const [a, b] of level.pits) {
      segs.push([cursor, a]);
      cursor = b;
    }
    segs.push([cursor, level.width + 200]);
    for (const [a, b] of segs) {
      if (b > a) solids.push({ x: a, y: level.groundY, w: b - a, h: 200, type: 'ground' });
    }
    for (const p of level.platforms) solids.push({ ...p });
    for (const q of level.questionBlocks) solids.push({ x: q.x, y: q.y, w: 48, h: 32, type: 'question', used: false });

    coins = level.coins.map(c => ({ x: c.x, y: c.y, w: 24, h: 24, taken: false, t: Math.random() * 10 }));
    hearts = (level.hearts || []).map(h => ({ x: h.x, y: h.y, w: 26, h: 24, taken: false, t: Math.random() * 10 }));
    goombas = level.goombas.map(g => ({
      x: g.x, y: level.groundY - 36, w: 34, h: 36, vx: -1.6, vy: 0, alive: true, squish: 0,
    }));

    if (level.boss) {
      boss = {
        x: level.boss.x, y: level.groundY - 80, w: 84, h: 80,
        vx: 1.4, hp: level.boss.hp, maxHp: level.boss.hp,
        arenaMin: level.boss.arenaMin, arenaMax: level.boss.arenaMax,
        invuln: 0, squish: 0, alive: true, throwT: 100,
      };
      gateSolid = { x: level.bossGateX, y: 200, w: 20, h: level.groundY - 200, type: 'gate' };
      solids.push(gateSolid);
    } else {
      boss = null;
      gateSolid = null;
    }
    rocks = [];
    popups = [];
    particles = [];
  }

  // ---------- player ----------
  const player = {
    x: 80, y: 300, w: 30, h: 44, vx: 0, vy: 0,
    onGround: false, facing: 1, invincible: 0, dead: false, walkT: 0,
  };

  function resetPlayer() {
    player.x = 80; player.y = 300; player.vx = 0; player.vy = 0;
    player.onGround = false; player.facing = 1; player.invincible = 120; player.dead = false;
    camera.x = 0;
  }

  const camera = { x: 0 };

  // ---------- game state ----------
  let score = 0;
  let coinCount = 0;
  let lives = START_LIVES;
  let timeLeft = 300;
  let timeAccum = 0;
  let state = 'start'; // start | playing | paused | dead | clear | win | gameover
  let stateTimer = 0;

  function fmtScore() { return String(score).padStart(6, '0'); }
  function updateHud() {
    scoreEl.textContent = fmtScore();
    coinsEl.textContent = 'x' + String(coinCount).padStart(2, '0');
    worldEl.textContent = level ? level.label : '1-1';
    timeEl.textContent = Math.max(0, Math.ceil(timeLeft));
    livesEl.textContent = 'x' + lives;
  }

  function togglePause() {
    if (state === 'playing') { state = 'paused'; pauseHint.classList.remove('hidden'); }
    else if (state === 'paused') { state = 'playing'; pauseHint.classList.add('hidden'); }
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function spawnPopup(x, y, text, color) {
    popups.push({ x, y, text, color, t: 0 });
  }

  function spawnBurst(x, y, color, count = 6) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 5 - 2, life: 30, color,
      });
    }
  }

  function bumpQuestionBlock(block) {
    if (block.used) return;
    block.used = true;
    score += 100;
    coinCount++;
    spawnPopup(block.x + 12, block.y - 10, '+100', '#ffcc00');
  }

  // ---------- collision resolution ----------
  function moveAndCollideX(entity, solidsList) {
    entity.x += entity.vx;
    for (const s of solidsList) {
      if (!rectsOverlap(entity, s)) continue;
      if (s.type === 'question' && s.used === undefined) continue;
      if (entity.vx > 0) entity.x = s.x - entity.w;
      else if (entity.vx < 0) entity.x = s.x + s.w;
      entity.vx = 0;
    }
  }

  function moveAndCollideY(entity, solidsList, onHitCeil) {
    entity.y += entity.vy;
    entity.onGround = false;
    for (const s of solidsList) {
      if (!rectsOverlap(entity, s)) continue;
      if (entity.vy > 0) {
        entity.y = s.y - entity.h;
        entity.vy = 0;
        entity.onGround = true;
      } else if (entity.vy < 0) {
        entity.y = s.y + s.h;
        entity.vy = 0;
        if (onHitCeil) onHitCeil(s);
      }
    }
  }

  function updatePlayer(dt) {
    if (player.invincible > 0) player.invincible -= dt;

    const accel = ACCEL * dt;
    if (isLeft() && !isRight()) {
      player.vx -= accel;
      player.facing = -1;
    } else if (isRight() && !isLeft()) {
      player.vx += accel;
      player.facing = 1;
    } else {
      player.vx *= player.onGround ? GROUND_FRICTION : AIR_FRICTION;
      if (Math.abs(player.vx) < 0.05) player.vx = 0;
    }
    player.vx = Math.max(-MAX_RUN, Math.min(MAX_RUN, player.vx));

    if (isJump()) {
      if (player.onGround && !player.jumpHeld) {
        player.vy = JUMP_V;
        player.onGround = false;
        player.jumpHeld = true;
      }
    } else {
      if (player.vy < JUMP_V * JUMP_CUT) player.vy = JUMP_V * JUMP_CUT;
      player.jumpHeld = false;
    }

    player.vy += GRAVITY * dt;
    if (player.vy > MAX_FALL) player.vy = MAX_FALL;

    moveAndCollideX(player, solids);
    if (player.x < 0) player.x = 0;
    moveAndCollideY(player, solids, (s) => {
      if (s.type === 'question') bumpQuestionBlock(s);
    });

    if (Math.abs(player.vx) > 0.3) player.walkT += dt * Math.abs(player.vx) * 0.25;

    if (player.y > VIEW_H + 100) killPlayer();
  }

  function killPlayer() {
    if (player.invincible > 60 && state === 'playing') return;
    lives--;
    updateHud();
    if (lives <= 0) {
      state = 'gameover';
      finalScoreEl.textContent = 'SCORE: ' + fmtScore();
      gameoverScreen.classList.remove('hidden');
    } else {
      resetPlayer();
    }
  }

  function updateGoombas(dt) {
    for (const g of goombas) {
      if (!g.alive) continue;
      if (g.squish > 0) {
        g.squish -= dt;
        if (g.squish <= 0) g.dead = true;
        continue;
      }
      g.vy += GRAVITY * dt;
      if (g.vy > MAX_FALL) g.vy = MAX_FALL;

      const probe = { x: g.x + (g.vx < 0 ? -4 : g.w + 4), y: g.y + g.h + 2, w: 2, h: 2 };
      let groundAhead = false;
      for (const s of solids) {
        if (s.type === 'ground' && rectsOverlap(probe, s)) { groundAhead = true; break; }
      }
      if (!groundAhead && g.y + g.h < level.groundY + 190) g.vx *= -1;

      g.x += g.vx * dt;
      for (const s of solids) {
        if (s.type === 'ground') continue;
        if (rectsOverlap(g, s)) {
          if (g.vx > 0) g.x = s.x - g.w; else g.x = s.x + s.w;
          g.vx *= -1;
        }
      }
      g.y += g.vy;
      g.onGround = false;
      for (const s of solids) {
        if (!rectsOverlap(g, s)) continue;
        if (g.vy > 0) { g.y = s.y - g.h; g.vy = 0; g.onGround = true; }
      }
      if (g.y > VIEW_H + 200) g.alive = false;
    }
    goombas = goombas.filter(g => g.alive !== false && !g.dead);
  }

  function checkGoombaCollisions() {
    for (const g of goombas) {
      if (g.squish > 0) continue;
      if (!rectsOverlap(player, g)) continue;
      const playerBottom = player.y + player.h;
      const stomp = player.vy > 0 && playerBottom - g.y < 20;
      if (stomp) {
        g.squish = 14;
        g.alive = true;
        player.vy = JUMP_V * 0.55;
        score += 100;
        spawnPopup(g.x, g.y - 10, '+100', '#fff');
      } else if (player.invincible <= 0) {
        spawnBurst(player.x + player.w / 2, player.y + player.h / 2, '#ff5555');
        killPlayer();
        player.invincible = 90;
      }
    }
  }

  // ---------- boss ----------
  function updateBoss(dt) {
    if (!boss || !boss.alive) return;
    if (boss.squish > 0) {
      boss.squish -= dt;
      if (boss.squish <= 0) {
        boss.alive = false;
        if (gateSolid) {
          const idx = solids.indexOf(gateSolid);
          if (idx >= 0) solids.splice(idx, 1);
        }
        score += 1000;
        spawnPopup(boss.x + boss.w / 2 - 20, boss.y - 20, 'BOSS DOWN!', '#ffcc00');
        spawnBurst(boss.x + boss.w / 2, boss.y + boss.h / 2, '#ffd23f', 16);
      }
      return;
    }
    if (boss.invuln > 0) boss.invuln -= dt;

    boss.x += boss.vx * dt;
    if (boss.x < boss.arenaMin) { boss.x = boss.arenaMin; boss.vx = Math.abs(boss.vx); }
    if (boss.x + boss.w > boss.arenaMax) { boss.x = boss.arenaMax - boss.w; boss.vx = -Math.abs(boss.vx); }

    boss.throwT -= dt;
    if (boss.throwT <= 0) {
      boss.throwT = 110 + Math.random() * 50;
      const dx = (player.x - boss.x) * 0.004;
      rocks.push({ x: boss.x + boss.w / 2, y: boss.y + 10, vx: Math.max(-3, Math.min(3, dx)), vy: -9, w: 16, h: 16 });
    }
  }

  function checkBossCollision() {
    if (!boss || !boss.alive || boss.squish > 0) return;
    if (!rectsOverlap(player, boss)) return;
    const playerBottom = player.y + player.h;
    const stomp = player.vy > 0 && playerBottom - boss.y < 26;
    if (stomp && boss.invuln <= 0) {
      boss.hp--;
      boss.invuln = 45;
      player.vy = JUMP_V * 0.6;
      spawnPopup(boss.x + boss.w / 2, boss.y - 10, 'HIT!', '#fff');
      spawnBurst(player.x + player.w / 2, boss.y + 20, '#c9a0ff', 8);
      if (boss.hp <= 0) boss.squish = 22;
    } else if (!stomp && boss.invuln <= 0 && player.invincible <= 0) {
      spawnBurst(player.x + player.w / 2, player.y + player.h / 2, '#ff5555');
      killPlayer();
      player.invincible = 90;
    }
  }

  function updateRocks(dt) {
    for (const r of rocks) {
      r.vy += GRAVITY * dt;
      r.x += r.vx * dt;
      r.y += r.vy * dt;
    }
    rocks = rocks.filter(r => r.y < level.groundY + 20);
  }

  function checkRockCollisions() {
    for (const r of rocks) {
      if (r.hit) continue;
      if (rectsOverlap(player, r) && player.invincible <= 0) {
        r.hit = true;
        spawnBurst(player.x + player.w / 2, player.y + player.h / 2, '#ff5555');
        killPlayer();
        player.invincible = 90;
      }
    }
    rocks = rocks.filter(r => !r.hit);
  }

  function checkCoins() {
    for (const c of coins) {
      if (c.taken) continue;
      if (rectsOverlap(player, c)) {
        c.taken = true;
        coinCount++;
        score += 50;
        spawnPopup(c.x, c.y - 10, '+50', '#ffcc00');
      }
    }
    coins = coins.filter(c => !c.taken);
  }

  function checkHearts() {
    for (const h of hearts) {
      if (h.taken) continue;
      if (rectsOverlap(player, h)) {
        h.taken = true;
        if (lives < MAX_LIVES) {
          lives++;
          spawnPopup(h.x, h.y - 10, '1UP!', '#ff5f8f');
        } else {
          score += 200;
          spawnPopup(h.x, h.y - 10, '+200', '#ff5f8f');
        }
        updateHud();
      }
    }
    hearts = hearts.filter(h => !h.taken);
  }

  function checkFlag() {
    if (player.x + player.w >= level.flagX) {
      state = 'clear';
      stateTimer = 0;
      clearScreen.classList.remove('hidden');
      score += Math.max(0, Math.floor(timeLeft)) * 2;
      updateHud();
    }
  }

  function updatePopups(dt) {
    for (const p of popups) p.t += dt;
    popups = popups.filter(p => p.t < 45);
    for (const pt of particles) {
      pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 0.3 * dt; pt.life -= dt;
    }
    particles = particles.filter(p => p.life > 0);
  }

  // ---------- rendering ----------
  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    g.addColorStop(0, level.bg);
    g.addColorStop(1, '#bfe4ff');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 6; i++) {
      const bx = ((i * 420) - camera.x * 0.3) % (VIEW_W + 400) - 200;
      const by = 60 + (i % 3) * 30;
      drawCloud(bx, by);
    }
    ctx.fillStyle = 'rgba(0,120,40,0.55)';
    for (let i = 0; i < 8; i++) {
      const hx = ((i * 320) - camera.x * 0.5) % (VIEW_W + 300) - 150;
      drawHill(hx, level.groundY);
    }
  }

  function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 10, 22, 0, Math.PI * 2);
    ctx.arc(x + 42, y, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHill(x, groundY) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + 80, groundY - 70);
    ctx.lineTo(x + 160, groundY);
    ctx.closePath();
    ctx.fill();
  }

  function drawGround(s) {
    const x = s.x - camera.x;
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(x, s.y, s.w, s.h);
    ctx.fillStyle = '#3fa34d';
    ctx.fillRect(x, s.y, s.w, 14);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    for (let i = 0; i < s.w; i += 32) {
      ctx.strokeRect(x + i, s.y + 14, 32, 32);
    }
  }

  function drawBrick(s) {
    const x = s.x - camera.x;
    ctx.fillStyle = '#c86428';
    ctx.fillRect(x, s.y, s.w, s.h);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    for (let i = 0; i < s.w; i += 24) {
      ctx.beginPath(); ctx.moveTo(x + i, s.y); ctx.lineTo(x + i, s.y + s.h); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(x, s.y + s.h / 2); ctx.lineTo(x + s.w, s.y + s.h / 2); ctx.stroke();
  }

  function drawQuestion(s, t) {
    const x = s.x - camera.x;
    if (s.used) {
      ctx.fillStyle = '#7a5230';
      ctx.fillRect(x, s.y, s.w, s.h);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.strokeRect(x, s.y, s.w, s.h);
      return;
    }
    const bounce = Math.sin(t * 0.06) * 2;
    ctx.fillStyle = '#f5a623';
    ctx.fillRect(x, s.y + bounce, s.w, s.h);
    ctx.strokeStyle = '#8a5a10';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, s.y + bounce, s.w, s.h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', x + s.w / 2, s.y + s.h / 2 + 7 + bounce);
  }

  function drawGate(s) {
    const x = s.x - camera.x;
    ctx.fillStyle = '#4a4a52';
    ctx.fillRect(x, s.y, s.w, s.h);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < s.h; i += 22) ctx.strokeRect(x, s.y + i, s.w, 22);
  }

  function drawCoin(c, t) {
    const x = c.x - camera.x;
    const scaleX = Math.abs(Math.cos((t + c.t * 10) * 0.08)) * 0.9 + 0.15;
    ctx.save();
    ctx.translate(x + c.w / 2, c.y - Math.sin(t * 0.05 + c.t) * 4 + c.h / 2);
    ctx.scale(scaleX, 1);
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.arc(0, 0, c.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c98f00';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawHeart(h, t) {
    const x = h.x - camera.x;
    const y = h.y - Math.sin(t * 0.05 + h.t) * 4;
    ctx.save();
    ctx.translate(x + h.w / 2, y + h.h / 2);
    const s = h.w / 2;
    ctx.fillStyle = '#ff3b5c';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.4);
    ctx.bezierCurveTo(-s * 0.3, -s, -s, -s * 0.5, 0, s * 0.2);
    ctx.bezierCurveTo(s, -s * 0.5, s * 0.3, -s, 0, -s * 0.4);
    ctx.fill();
    ctx.strokeStyle = '#a30030';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawGoomba(g) {
    const x = g.x - camera.x;
    ctx.save();
    if (g.squish > 0) {
      ctx.translate(x, g.y + g.h - 12);
      ctx.scale(1.2, 0.3);
      ctx.fillStyle = '#8b4a2b';
      ctx.beginPath(); ctx.ellipse(g.w / 2, 12, g.w / 2, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }
    ctx.translate(x, g.y);
    ctx.fillStyle = '#8b4a2b';
    ctx.beginPath();
    ctx.ellipse(g.w / 2, g.h / 2, g.w / 2, g.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(10, g.h / 2 - 2, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(g.w - 10, g.h / 2 - 2, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(10, g.h / 2, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(g.w - 10, g.h / 2, 2.4, 0, Math.PI * 2); ctx.fill();
    const walk = Math.sin(performance.now() * 0.02) * 4;
    ctx.fillStyle = '#5a2f16';
    ctx.fillRect(4, g.h - 6, 8, 8 + walk * 0.2);
    ctx.fillRect(g.w - 12, g.h - 6, 8, 8 - walk * 0.2);
    ctx.restore();
  }

  function drawBoss(t) {
    if (!boss || !boss.alive) return;
    const x = boss.x - camera.x;
    ctx.save();
    if (boss.squish > 0) {
      ctx.translate(x, boss.y + boss.h - 16);
      ctx.scale(1.15, 0.25);
      ctx.fillStyle = '#5b2c6f';
      ctx.beginPath(); ctx.ellipse(boss.w / 2, 16, boss.w / 2, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }
    const flash = boss.invuln > 0 && Math.floor(boss.invuln / 4) % 2 === 0;
    ctx.translate(x, boss.y);
    ctx.fillStyle = flash ? '#ffffff' : '#5b2c6f';
    ctx.beginPath();
    ctx.ellipse(boss.w / 2, boss.h / 2 + 6, boss.w / 2, boss.h / 2 - 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.moveTo(boss.w / 2 - 22, boss.h / 2 - 24);
    ctx.lineTo(boss.w / 2 - 14, boss.h / 2 - 42);
    ctx.lineTo(boss.w / 2 - 4, boss.h / 2 - 24);
    ctx.lineTo(boss.w / 2, boss.h / 2 - 46);
    ctx.lineTo(boss.w / 2 + 4, boss.h / 2 - 24);
    ctx.lineTo(boss.w / 2 + 14, boss.h / 2 - 42);
    ctx.lineTo(boss.w / 2 + 22, boss.h / 2 - 24);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(boss.w / 2 - 16, boss.h / 2, 9, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(boss.w / 2 + 16, boss.h / 2, 9, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(boss.w / 2 - 16, boss.h / 2 + 3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(boss.w / 2 + 16, boss.h / 2 + 3, 4, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#3a1a4a';
    ctx.fillRect(8, boss.h - 10, 20, 12);
    ctx.fillRect(boss.w - 28, boss.h - 10, 20, 12);
    ctx.restore();

    const barW = 130;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x + boss.w / 2 - barW / 2, boss.y - 26, barW, 10);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(x + boss.w / 2 - barW / 2 + 2, boss.y - 24, (barW - 4) * Math.max(0, boss.hp / boss.maxHp), 6);
  }

  function drawRock(r) {
    const x = r.x - camera.x;
    ctx.fillStyle = '#6b4a2b';
    ctx.beginPath();
    ctx.arc(x, r.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2716';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawPlayer() {
    const x = player.x - camera.x;
    const y = player.y;
    if (player.invincible > 0 && Math.floor(player.invincible / 4) % 2 === 0) return;
    ctx.save();
    ctx.translate(x + player.w / 2, y);
    ctx.scale(player.facing, 1);
    const legSwing = player.onGround ? Math.sin(player.walkT) * 6 : 0;

    ctx.fillStyle = '#2b3a86';
    ctx.fillRect(-6 - Math.max(0, legSwing) / 2, 34, 8, 10);
    ctx.fillRect(-2 + Math.max(0, -legSwing) / 2, 34, 8, 10);

    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-11, 16, 22, 20);
    ctx.fillStyle = '#2b3a86';
    ctx.fillRect(-11, 26, 22, 12);
    ctx.fillStyle = '#f2c48d';
    ctx.fillRect(-9, 4, 18, 14);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(0, 2, 10, 7, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-10, -2, 20, 5);
    ctx.fillStyle = '#7a3d1d';
    ctx.fillRect(-9, 12, 5, 5);

    ctx.fillStyle = '#2b3a86';
    ctx.fillRect(-14, 16, 6, 10);
    ctx.fillRect(8, 16, 6, 10);
    ctx.restore();
  }

  function drawFlag(t) {
    const x = level.flagX - camera.x;
    ctx.fillStyle = '#c8c8c8';
    ctx.fillRect(x, 120, 6, level.groundY - 120);
    ctx.fillStyle = state === 'clear' || state === 'win' ? '#2ecc71' : '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(x + 6, 130);
    ctx.lineTo(x + 46, 145);
    ctx.lineTo(x + 6, 160);
    ctx.closePath();
    ctx.fill();

    const cx = level.castleX - camera.x;
    ctx.fillStyle = '#9b9b9b';
    ctx.fillRect(cx, level.groundY - 90, 120, 90);
    for (let i = 0; i < 4; i++) ctx.fillRect(cx + i * 34, level.groundY - 110, 20, 20);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(cx + 46, level.groundY - 50, 30, 50);
  }

  function drawPopups() {
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px sans-serif';
    for (const p of popups) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.t / 45);
      ctx.fillText(p.text, p.x - camera.x, p.y - p.t * 0.8);
    }
    ctx.globalAlpha = 1;
    for (const pt of particles) {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.life / 30);
      ctx.fillRect(pt.x - camera.x, pt.y, 4, 4);
    }
    ctx.globalAlpha = 1;
  }

  function render(t) {
    drawBackground();
    for (const s of solids) {
      if (s.type === 'ground') drawGround(s);
      else if (s.type === 'brick') drawBrick(s);
      else if (s.type === 'question') drawQuestion(s, t);
      else if (s.type === 'gate') drawGate(s);
    }
    for (const c of coins) drawCoin(c, t);
    for (const h of hearts) drawHeart(h, t);
    for (const g of goombas) drawGoomba(g);
    for (const r of rocks) drawRock(r);
    drawBoss(t);
    drawFlag(t);
    drawPlayer();
    drawPopups();
  }

  // ---------- main loop ----------
  let lastTime = performance.now();

  function frame(now) {
    let dt = (now - lastTime) / 16.6667;
    lastTime = now;
    dt = Math.max(0.001, Math.min(2, dt));

    if (state === 'playing') {
      timeAccum += dt;
      if (timeAccum > 60) { timeAccum = 0; timeLeft -= 1; if (timeLeft <= 0) killPlayer(); }
      updatePlayer(dt);
      updateGoombas(dt);
      updateBoss(dt);
      updateRocks(dt);
      checkGoombaCollisions();
      checkBossCollision();
      checkRockCollisions();
      checkCoins();
      checkHearts();
      checkFlag();
      updatePopups(dt);
      camera.x = Math.max(0, Math.min(player.x - VIEW_W / 2, level.width - VIEW_W));
      updateHud();
    } else if (state === 'clear') {
      stateTimer += dt;
    }

    if (level) render(now);
    requestAnimationFrame(frame);
  }

  function startGame() {
    score = 0; coinCount = 0; lives = START_LIVES; timeLeft = 300; timeAccum = 0;
    levelIndex = 0;
    loadLevel(levelIndex);
    resetPlayer();
    state = 'playing';
    startScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    clearScreen.classList.add('hidden');
    updateHud();
  }

  function nextLevel() {
    levelIndex++;
    if (levelIndex >= levels.length) {
      state = 'win';
      winScoreEl.textContent = 'FINAL SCORE: ' + fmtScore();
      clearScreen.classList.add('hidden');
      winScreen.classList.remove('hidden');
      return;
    }
    timeLeft = 300; timeAccum = 0;
    loadLevel(levelIndex);
    resetPlayer();
    state = 'playing';
    clearScreen.classList.add('hidden');
    updateHud();
  }

  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('retry-btn').addEventListener('click', startGame);
  document.getElementById('win-retry-btn').addEventListener('click', startGame);
  document.getElementById('next-btn').addEventListener('click', nextLevel);

  loadLevel(0);
  requestAnimationFrame(frame);
})();
