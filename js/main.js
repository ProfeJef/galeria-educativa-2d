// main.js — Logica principal del Museo Virtual: movimiento, camara, interaccion, HUD
document.addEventListener('DOMContentLoaded', () => {

const TILE = 32, COLS = 30, ROWS = 15;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const fadeEl = document.getElementById('fade');
const sceneLabel = document.getElementById('sceneLabel');

const exteriorMap = buildExteriorMap();
const interiorMap = buildInteriorMap();

let scene = 'exterior';
let map = exteriorMap;
const visited = new Set();

const player = {
  col: 14, row: 14, x: 14*TILE, y: 14*TILE,
  targetX: 14*TILE, targetY: 14*TILE,
  dir: 'up', moving: false, speed: 4, animT: 0
};

let doorGlow = 0;
let transitioning = false;

// ==== TECLADO ====
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'e') interact();
});
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// Evita que las teclas queden "atascadas" si la ventana pierde el foco
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) for (const k in keys) keys[k] = false;
});

function isWalkable(c, r) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
  const cell = map[r][c];
  if (scene === 'exterior') {
    return cell !== 1 && cell !== 3 && cell !== 4 && cell !== 5 && cell !== 6 && cell !== 7;
  }
  return cell !== 1 && cell !== 7 && cell !== 10 && cell !== 11 && cell !== 12 && cell !== 13 && cell !== 14;
}

function tryMove(dc, dr, dir) {
  if (player.moving || transitioning) return;
  player.dir = dir;
  const nc = player.col + dc, nr = player.row + dr;
  if (!isWalkable(nc, nr)) return;
  player.col = nc; player.row = nr;
  player.targetX = nc * TILE; player.targetY = nr * TILE;
  player.moving = true;
}

function interact() {
  const dirs = { down:[0,1], up:[0,-1], left:[-1,0], right:[1,0] };
  const [dc, dr] = dirs[player.dir];
  const tc = player.col + dc, tr = player.row + dr;
  if (tr < 0 || tr >= ROWS || tc < 0 || tc >= COLS) return;
  const cell = map[tr][tc];
  if (typeof cell === 'string') openStation(cell);
  else if (cell === 'door' || cell === 'exit') switchScene();
}

function openStation(key) {
  const s = STATIONS[key];
  if (!s) return;
  const body = document.getElementById('modalBody');
  body.className = s.zona;
  body.innerHTML = `
    <div class="topRow">
      <span class="tag ${s.zona}">${s.zona === 'nac' ? 'Galeria Nacional' : 'Galeria Internacional'}</span>
      <span class="counter">${visited.size + (visited.has(key) ? 0 : 1)}/10 estaciones</span>
    </div>
    <img src="${s.img}" alt="${s.nombre}">
    <h2>${s.nombre}</h2>
    <h4>Contexto</h4><p>${s.contexto}</p>
    <h4>Enfoque</h4><p>${s.enfoque}</p>
    <h4>Metodologia</h4><p>${s.metodologia}</p>
    <h4>TICs empleadas</h4><p>${s.tics}</p>
    <h4>Aportes</h4><p>${s.aportes}</p>
  `;
  document.getElementById('modalOverlay').style.display = 'flex';
  visited.add(key);
  updateSideLists();
  updateProgress();
}

function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }
document.getElementById('closeBtn').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'modalOverlay') closeModal();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = Math.floor((e.clientX - rect.left) * scaleX / TILE);
  const cy = Math.floor((e.clientY - rect.top) * scaleY / TILE);
  if (cy < 0 || cy >= ROWS || cx < 0 || cx >= COLS) return;
  const cell = map[cy][cx];
  if (typeof cell === 'string') openStation(cell);
});

// ==== LISTAS LATERALES: clic para abrir ficha directamente ====
document.querySelectorAll('.sidePanel li[data-key]').forEach(li => {
  li.addEventListener('click', () => openStation(li.dataset.key));
});

function updateSideLists() {
  document.querySelectorAll('.sidePanel li[data-key]').forEach(li => {
    li.classList.toggle('done', visited.has(li.dataset.key));
  });
}

// ==== MINIMAPA (NAC / INTL) ====
function updateMinimap() {
  const mmNac = document.getElementById('mmNac');
  const mmIntl = document.getElementById('mmIntl');
  if (!mmNac || !mmIntl) return;
  const inNac = scene === 'interior' && player.col < 15;
  const inIntl = scene === 'interior' && player.col >= 15;
  mmNac.classList.toggle('active', inNac);
  mmIntl.classList.toggle('active', inIntl);
}

// ==== BARRA DE PROGRESO ====
function updateProgress() {
  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  if (!fill || !text) return;
  const pct = (visited.size / 10) * 100;
  fill.style.width = pct + '%';
  text.textContent = `${visited.size}/10 estaciones`;
}

// ==== TRANSICION EXTERIOR / INTERIOR ====
function switchScene() {
  transitioning = true;
  fadeEl.style.transition = 'opacity 0.45s ease';
  fadeEl.style.opacity = 1;
  setTimeout(() => {
    if (scene === 'exterior') {
      scene = 'interior'; map = interiorMap;
      player.col = 14; player.row = 12;
      player.x = 14*TILE; player.y = 12*TILE;
      player.targetX = player.x; player.targetY = player.y;
      sceneLabel.textContent = 'Interior';
    } else {
      scene = 'exterior'; map = exteriorMap;
      player.col = 14; player.row = 9;
      player.x = 14*TILE; player.y = 9*TILE;
      player.targetX = player.x; player.targetY = player.y;
      sceneLabel.textContent = 'Exterior';
    }
    fadeEl.style.opacity = 0;
    setTimeout(() => { transitioning = false; }, 460);
  }, 460);
}

// ==== CONTROLES TACTILES (joystick + boton E) ====
const joystickZone = document.getElementById('joystickZone');
const joystickStick = document.getElementById('joystickStick');
const btnAction = document.getElementById('btnAction');
let touchDir = null;

if (joystickZone) {
  let baseRect = null;
  const startTouch = (e) => {
    baseRect = joystickZone.getBoundingClientRect();
    e.preventDefault();
  };
  const moveTouch = (e) => {
    if (!baseRect) return;
    const t = e.touches ? e.touches[0] : e;
    const cx = baseRect.left + baseRect.width/2;
    const cy = baseRect.top + baseRect.height/2;
    let dx = t.clientX - cx, dy = t.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const max = baseRect.width/2;
    if (dist > max) { dx = dx/dist*max; dy = dy/dist*max; }
    joystickStick.style.left = (31 + dx*0.55) + 'px';
    joystickStick.style.top = (31 + dy*0.55) + 'px';
    if (Math.abs(dx) > Math.abs(dy)) {
      touchDir = dx > 15 ? 'right' : dx < -15 ? 'left' : null;
    } else {
      touchDir = dy > 15 ? 'down' : dy < -15 ? 'up' : null;
    }
    e.preventDefault();
  };
  const endTouch = (e) => {
    baseRect = null; touchDir = null;
    joystickStick.style.left = '31px';
    joystickStick.style.top = '31px';
    if (e) e.preventDefault();
  };
  joystickZone.addEventListener('touchstart', startTouch, { passive:false });
  joystickZone.addEventListener('touchmove', moveTouch, { passive:false });
  joystickZone.addEventListener('touchend', endTouch, { passive:false });
  joystickZone.addEventListener('mousedown', startTouch);
  window.addEventListener('mousemove', (e) => { if (baseRect) moveTouch(e); });
  window.addEventListener('mouseup', endTouch);
}

if (btnAction) {
  const fire = (e) => { interact(); if (e) e.preventDefault(); };
  btnAction.addEventListener('touchstart', fire, { passive:false });
  btnAction.addEventListener('click', fire);
}

// ==== BUCLE PRINCIPAL ====
function handleInput() {
  if (player.moving || transitioning) return;
  if (keys['arrowup'] || keys['w'] || touchDir === 'up') tryMove(0,-1,'up');
  else if (keys['arrowdown'] || keys['s'] || touchDir === 'down') tryMove(0,1,'down');
  else if (keys['arrowleft'] || keys['a'] || touchDir === 'left') tryMove(-1,0,'left');
  else if (keys['arrowright'] || keys['d'] || touchDir === 'right') tryMove(1,0,'right');
}

function updatePlayer() {
  player.animT += 0.28;
  if (!player.moving) return;
  const dx = player.targetX - player.x, dy = player.targetY - player.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= player.speed) {
    player.x = player.targetX; player.y = player.targetY;
    player.moving = false;
    const cell = map[player.row][player.col];
    if (cell === 'door' || cell === 'exit') { doorGlow = 1; switchScene(); }
  } else {
    player.x += dx/dist*player.speed;
    player.y += dy/dist*player.speed;
  }
}

let t = 0;
function loop() {
  t += 0.03;
  handleInput();
  updatePlayer();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const doorGlowRef = { value: doorGlow };
  if (scene === 'exterior') drawExterior(ctx, exteriorMap, t, doorGlowRef);
  else drawInterior(ctx, interiorMap, t, visited);
  doorGlow = doorGlowRef.value;
  drawAvatar(ctx, player, TILE);
  updateMinimap();
  updateProgress();
  requestAnimationFrame(loop);
}

updateProgress();
document.getElementById('loading') && (document.getElementById('loading').style.display = 'none');
loop();

});
