document.addEventListener('DOMContentLoaded', () => {

const TILE = 32, COLS = 30, ROWS = 15;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const fadeEl = document.getElementById('fade');
const sceneLabel = document.getElementById('sceneLabel');

function buildExteriorMap() {
  const m = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  for (let r = 1; r <= 8; r++) for (let c = 5; c <= 24; c++) m[r][c] = 1;
  m[8][14] = 'door'; m[8][15] = 'door';
  [7,10,13,16,19,22].forEach(c => { m[6][c] = 7; m[7][c] = 7; });
  for (let c = 12; c <= 17; c++) m[9][c] = 8;
  for (let c = 13; c <= 16; c++) m[10][c] = 8;
  for (let r = 11; r <= 13; r++) for (let c = 12; c <= 17; c++) if (m[r][c] === 0) m[r][c] = 2;
  m[12][14] = 5; m[12][15] = 5; m[13][14] = 5; m[13][15] = 5;
  [[2,9],[2,11],[2,13],[27,9],[27,11],[27,13],[4,3],[25,3]].forEach(([c,r]) => m[r][c] = 3);
  [[11,11],[18,11],[11,13],[18,13],[10,12],[19,12]].forEach(([c,r]) => m[r][c] = 4);
  m[9][11] = 6; m[9][18] = 6;
  return m;
}

function buildInteriorMap() {
  const m = Array.from({length: ROWS}, () => Array(COLS).fill(1));
  for (let r = 1; r <= 13; r++) for (let c = 1; c <= 13; c++) m[r][c] = 0;
  for (let r = 1; r <= 13; r++) for (let c = 16; c <= 28; c++) m[r][c] = 0;
  // Corredor central abierto de arriba a abajo (antes solo estaba libre en filas 6-8,
  // lo que generaba un muro invisible que bloqueaba el paso hacia las puertas de salida)
  for (let r = 1; r <= 13; r++) for (let c = 13; c <= 16; c++) m[r][c] = 0;

  [[3,2,'n1'],[6,2,'n2'],[9,2,'n3'],[3,5,'n4'],[9,5,'n5']].forEach(([c,r,k]) => m[r][c] = k);
  [[19,2,'i1'],[22,2,'i2'],[25,2,'i3'],[19,5,'i4'],[25,5,'i5']].forEach(([c,r,k]) => m[r][c] = k);
  m[12][2] = 12; m[12][12] = 13;
  m[3][17] = 14; m[3][27] = 11; m[12][17] = 12; m[12][27] = 10;
  for (let r = 8; r <= 10; r++) for (let c = 5; c <= 9; c++) m[r][c] = 3;
  for (let r = 8; r <= 10; r++) for (let c = 19; c <= 23; c++) m[r][c] = 3;
  m[6][13] = 7; m[6][16] = 7; m[8][13] = 7; m[8][16] = 7;
  m[13][14] = 'exit'; m[13][15] = 'exit';
  return m;
}

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

function updateSideLists() {
  document.querySelectorAll('#listNac li, #listIntl li').forEach(li => {
    const key = li.dataset.key;
    li.classList.toggle('done', visited.has(key));
  });
}

function updateProgress() {
  const total = Object.keys(STATIONS).length;
  const pct = Math.round((visited.size / total) * 100);
  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = `${visited.size}/${total} estaciones`;
}

document.querySelectorAll('#listNac li, #listIntl li').forEach(li => {
  li.addEventListener('click', () => {
    const key = li.dataset.key;
    if (scene !== 'interior') switchScene();
    setTimeout(() => openStation(key), 200);
  });
});

function isWalkable(c, r) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
  const cell = map[r][c];
  if (scene === 'exterior') {
    return cell !== 1 && cell !== 3 && cell !== 4 && cell !== 5 && cell !== 6 && cell !== 7;
  }
  return cell !== 1 && cell !== 7 && cell !== 10 && cell !== 11 && cell !== 12 && cell !== 13 && cell !== 14;
}

const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'e') interact();
});
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

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
  if (typeof cell === 'string' && STATIONS[cell]) openStation(cell);
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
    ${s.fuente ? `<p class="sourceLink"><a href="${s.fuente}" target="_blank" rel="noopener noreferrer">Ver fuente ↗</a></p>` : ''}
  `;
  document.getElementById('modalOverlay').style.display = 'flex';
  visited.add(key);
  updateSideLists();
  updateProgress();
}

document.getElementById('closeBtn').addEventListener('click', () => {
  document.getElementById('modalOverlay').style.display = 'none';
});
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'modalOverlay') document.getElementById('modalOverlay').style.display = 'none';
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = Math.floor((e.clientX - rect.left) * scaleX / TILE);
  const cy = Math.floor((e.clientY - rect.top) * scaleY / TILE);
  if (cy >= 0 && cy < ROWS && cx >= 0 && cx < COLS) {
    const cell = map[cy][cx];
    if (typeof cell === 'string' && STATIONS[cell]) openStation(cell);
  }
});

function switchScene() {
  transitioning = true;
  fadeEl.style.transition = 'opacity 0.45s ease';
  fadeEl.style.opacity = 1;
  setTimeout(() => {
    if (scene === 'exterior') {
      scene = 'interior'; map = interiorMap;
      player.col = 14; player.row = 12;
      sceneLabel.textContent = 'Interior';
    } else {
      scene = 'exterior'; map = exteriorMap;
      player.col = 14; player.row = 9;
      sceneLabel.textContent = 'Exterior';
    }
    player.x = player.col * TILE; player.y = player.row * TILE;
    player.targetX = player.x; player.targetY = player.y;
    setTimeout(() => { fadeEl.style.opacity = 0; setTimeout(() => transitioning = false, 460); }, 120);
  }, 460);
}

const joystickBase = document.getElementById('joystickBase');
const joystickStick = document.getElementById('joystickStick');
const joystickZone = document.getElementById('joystickZone');
let joyActive = false, joyDX = 0, joyDY = 0;

function joyReset() {
  joyActive = false; joyDX = 0; joyDY = 0;
  joystickStick.style.transform = 'translate(0px, 0px)';
}

if (joystickZone) {
  const handleStart = (clientX, clientY) => {
    joyActive = true;
  };
  const handleMove = (clientX, clientY) => {
    if (!joyActive) return;
    const rect = joystickBase.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    let dx = clientX - cx, dy = clientY - cy;
    const max = rect.width/2;
    const dist = Math.min(Math.hypot(dx,dy), max);
    const angle = Math.atan2(dy,dx);
    dx = Math.cos(angle)*dist; dy = Math.sin(angle)*dist;
    joystickStick.style.transform = `translate(${dx}px, ${dy}px)`;
    joyDX = dx/max; joyDY = dy/max;
  };

  joystickZone.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.touches[0]; handleStart(t.clientX, t.clientY); }, {passive:false});
  joystickZone.addEventListener('touchmove', (e) => { e.preventDefault(); const t = e.touches[0]; handleMove(t.clientX, t.clientY); }, {passive:false});
  joystickZone.addEventListener('touchend', (e) => { e.preventDefault(); joyReset(); }, {passive:false});

  joystickZone.addEventListener('mousedown', (e) => { handleStart(e.clientX, e.clientY); });
  window.addEventListener('mousemove', (e) => { if (joyActive) handleMove(e.clientX, e.clientY); });
  window.addEventListener('mouseup', () => joyReset());
}

const btnAction = document.getElementById('btnAction');
if (btnAction) {
  btnAction.addEventListener('click', interact);
  btnAction.addEventListener('touchstart', (e) => { e.preventDefault(); interact(); }, {passive:false});
}

function handleInput() {
  if (player.moving || transitioning) return;
  const threshold = 0.4;
  if ((keys['arrowup'] || keys['w']) || joyDY < -threshold) tryMove(0,-1,'up');
  else if ((keys['arrowdown'] || keys['s']) || joyDY > threshold) tryMove(0,1,'down');
  else if ((keys['arrowleft'] || keys['a']) || joyDX < -threshold) tryMove(-1,0,'left');
  else if ((keys['arrowright'] || keys['d']) || joyDX > threshold) tryMove(1,0,'right');
}

function updatePlayer() {
  player.animT += 0.28;
  if (!player.moving) return;
  const dx = player.targetX - player.x, dy = player.targetY - player.y;
  const dist = Math.hypot(dx,dy);
  if (dist <= player.speed) {
    player.x = player.targetX; player.y = player.targetY;
    player.moving = false;
    const cell = map[player.row][player.col];
    if (cell === 'door' || cell === 'exit') { doorGlow = 1; switchScene(); }
  } else {
    player.x += dx/dist*player.speed; player.y += dy/dist*player.speed;
  }
}

function drawGrass(c,r) {
  const light = (c+r)%2===0;
  ctx.fillStyle = light ? '#66bb6a' : '#5cad61';
  ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
}
function drawPathExt(c,r) {
  const light = (c+r)%2===0;
  ctx.fillStyle = light ? '#d7ccc8' : '#cbbfba';
  ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
}
function drawFacade(c,r) {
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle = '#eceff1'; ctx.fillRect(x,y,TILE,TILE);
  ctx.fillStyle = '#cfd8dc'; ctx.fillRect(x,y,TILE,3);
}
function drawColumnExt(c,r) {
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle = '#37474f'; ctx.fillRect(x,y,TILE,TILE);
  ctx.fillStyle = '#f5f5f5'; ctx.fillRect(x+8, y-2, 16, TILE+4);
}
function drawStep(c,r) {
  const x=c*TILE, y=r*TILE;
  const isTop = r===9;
  ctx.fillStyle = isTop ? '#e0e0e0' : '#d5d5d5';
  ctx.fillRect(x,y,TILE,TILE);
}
function drawTree(c,r) {
  drawGrass(c,r);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#5d4037'; ctx.fillRect(x+13,y+16,6,14);
  ctx.fillStyle='#2e7d32'; ctx.beginPath(); ctx.arc(x+16,y+10,13,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#388e3c'; ctx.beginPath(); ctx.arc(x+8,y+14,8,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+24,y+14,8,0,Math.PI*2); ctx.fill();
}
function drawFlower(c,r) {
  drawGrass(c,r);
  const x=c*TILE, y=r*TILE;
  const colors=['#ef5350','#ffee58','#ba68c8','#ff8a65'];
  for (let i=0;i<4;i++) {
    ctx.fillStyle = colors[(c+r+i)%colors.length];
    const ox = 9+(i%2)*13, oy = 9+Math.floor(i/2)*13;
    ctx.beginPath(); ctx.arc(x+ox,y+oy,3.2,0,Math.PI*2); ctx.fill();
  }
}
function drawLamp(c,r,t) {
  drawGrass(c,r);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#37474f'; ctx.fillRect(x+14,y+10,4,22);
  const pulse = 12+Math.sin(t*2)*1.5;
  const glow = ctx.createRadialGradient(x+16,y+8,1,x+16,y+8,pulse);
  glow.addColorStop(0,'rgba(255,235,130,0.7)'); glow.addColorStop(1,'rgba(255,235,130,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(x+16,y+8,pulse,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ffd54f'; ctx.beginPath(); ctx.arc(x+16,y+8,4,0,Math.PI*2); ctx.fill();
}
function drawFountain(c,r,t) {
  drawPathExt(c,r);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#90a4ae'; ctx.beginPath(); ctx.arc(x+16,y+16,15,0,Math.PI*2); ctx.fill();
  const wobble = Math.sin(t*3+c+r)*1.5;
  ctx.fillStyle='#4fc3f7'; ctx.beginPath(); ctx.arc(x+16,y+16,11+wobble*0.3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#81d4fa'; ctx.beginPath(); ctx.arc(x+16,y+16,5,0,Math.PI*2); ctx.fill();
}
function drawDoorExt(c,r,glow) {
  const x=c*TILE, y=r*TILE;
  if (glow > 0) {
    const g = ctx.createRadialGradient(x+16,y+16,2,x+16,y+16,30);
    g.addColorStop(0, `rgba(255,213,79,${0.5*glow})`); g.addColorStop(1, 'rgba(255,213,79,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x+16,y+16,30,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#4e342e'; ctx.fillRect(x,y-2,TILE,TILE+2);
  ctx.fillStyle='#6d4c41'; ctx.fillRect(x+3,y,TILE-6,TILE-2);
  ctx.fillStyle='#ffd54f'; ctx.beginPath(); ctx.arc(x+TILE-8,y+TILE/2,2,0,Math.PI*2); ctx.fill();
}
function drawPediment() {
  ctx.fillStyle = '#eceff1';
  ctx.beginPath(); ctx.moveTo(4*TILE, 1*TILE); ctx.lineTo(14.5*TILE, -1.8*TILE); ctx.lineTo(25*TILE, 1*TILE); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1b3a5c'; ctx.font = 'bold 13px Segoe UI'; ctx.textAlign = 'center';
  ctx.fillText('MUSEO VIRTUAL DE INNOVACION EDUCATIVA', 14.5*TILE, -0.1*TILE);
  ctx.textAlign = 'left';
}
function drawExterior(t) {
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    const cell = exteriorMap[r][c];
    if (cell===1) drawFacade(c,r);
    else if (cell===2) drawPathExt(c,r);
    else if (cell===3) drawTree(c,r);
    else if (cell===4) drawFlower(c,r);
    else if (cell===5) drawFountain(c,r,t);
    else if (cell===6) drawLamp(c,r,t);
    else if (cell===7) drawColumnExt(c,r);
    else if (cell===8) drawStep(c,r);
    else if (cell==='door') drawDoorExt(c,r,doorGlow);
    else drawGrass(c,r);
  }
  drawPediment();
  if (doorGlow > 0) doorGlow = Math.max(0, doorGlow - 0.01);
}

function drawFloorTile(c,r,isNac) {
  const light = (c+r)%2===0;
  ctx.fillStyle = isNac ? (light?'#c8e6c9':'#a5d6a7') : (light?'#bbdefb':'#90caf9');
  ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
}
function drawWallTile(c,r) {
  ctx.fillStyle='#37474f'; ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
  ctx.fillStyle='#455a64'; ctx.fillRect(c*TILE,r*TILE,TILE,6);
}
function drawColumnInt(c,r) {
  const isNac=c<15; drawFloorTile(c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#eceff1'; ctx.fillRect(x+8,y+2,16,TILE-4);
}
function drawRug(c,r) {
  const isNac=c<15; drawFloorTile(c,r,isNac);
  ctx.fillStyle = isNac?'rgba(46,125,50,0.4)':'rgba(21,101,192,0.4)';
  ctx.fillRect(c*TILE+2,r*TILE+2,TILE-4,TILE-4);
}
function drawStatue(c,r) {
  const isNac=c<15; drawFloorTile(c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#b0bec5'; ctx.fillRect(x+8,y+22,16,8);
  ctx.fillStyle='#eceff1'; ctx.beginPath(); ctx.arc(x+16,y+7,5,0,Math.PI*2); ctx.fill();
}
function drawGlobe(c,r) {
  const isNac=c<15; drawFloorTile(c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#6d4c41'; ctx.fillRect(x+13,y+24,6,6);
  ctx.save(); ctx.translate(x+16,y+14); ctx.rotate(-0.35);
  ctx.fillStyle='#42a5f5'; ctx.beginPath(); ctx.arc(0,0,9,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#66bb6a'; ctx.beginPath(); ctx.ellipse(-3,-2,3,4,0.3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
function drawBooks(c,r) {
  const isNac=c<15; drawFloorTile(c,r,isNac);
  const x=c*TILE, y=r*TILE;
  const colors=['#c62828','#1565c0','#2e7d32','#f9a825'];
  colors.forEach((col,i)=>{ ctx.fillStyle = col; ctx.fillRect(x+7+i*0.4, y+24-i*5, 18-i*0.5, 5); });
}
function drawChalkboard(c,r) {
  const isNac=c<15; drawFloorTile(c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#5d4037'; ctx.fillRect(x+3,y+2,TILE-6,TILE-8);
  ctx.fillStyle='#1b5e20'; ctx.fillRect(x+5,y+4,TILE-10,TILE-13);
}
function drawLectern(c,r) {
  const isNac=c<15; drawFloorTile(c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#6d4c41'; ctx.beginPath();
  ctx.moveTo(x+11,y+28); ctx.lineTo(x+13,y+14); ctx.lineTo(x+19,y+14); ctx.lineTo(x+21,y+28); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#8d6e63'; ctx.fillRect(x+9,y+10,14,5);
}
function drawStation(c,r,key) {
  const s = STATIONS[key];
  const isNac = s.zona === 'nac';
  drawFloorTile(c,r,isNac);
  const x=c*TILE, y=r*TILE;
  const frameColor = isNac?'#2e7d32':'#1565c0';
  ctx.fillStyle='#4e342e'; ctx.fillRect(x+1,y-8,TILE-2,TILE-2);
  ctx.fillStyle='#fff'; ctx.fillRect(x+4,y-5,TILE-8,TILE-6);
  ctx.strokeStyle=frameColor; ctx.lineWidth=2; ctx.strokeRect(x+4,y-5,TILE-8,TILE-6);
  ctx.fillStyle=frameColor; ctx.fillRect(x+7,y-1,TILE-14,7);
  const glow = ctx.createRadialGradient(x+16,y-10,1,x+16,y-10,16);
  glow.addColorStop(0, isNac?'rgba(255,235,150,0.35)':'rgba(200,230,255,0.35)');
  glow.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(x+16,y-10,16,0,Math.PI*2); ctx.fill();
  if (visited.has(key)) {
    ctx.fillStyle='#ffd54f'; ctx.beginPath(); ctx.arc(x+TILE-6,y-9,4,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#b8860b'; ctx.lineWidth=1; ctx.stroke();
  }
}
function drawExitDoor(c,r) {
  const isNac=c<15; drawFloorTile(c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#4e342e'; ctx.fillRect(x+2,y+4,TILE-4,TILE-4);
  ctx.fillStyle='#6d4c41'; ctx.fillRect(x+5,y+6,TILE-10,TILE-8);
  ctx.fillStyle='#ffd54f'; ctx.font='8px Segoe UI'; ctx.textAlign='center';
  ctx.fillText('SALIDA', x+TILE/2, y+TILE-6); ctx.textAlign='left';
}
function drawBanner(text,colStart,colEnd,row,color) {
  const x=colStart*TILE, w=(colEnd-colStart+1)*TILE, y=row*TILE;
  ctx.fillStyle=color; ctx.fillRect(x,y,w,TILE*0.6);
  ctx.fillStyle='#fff'; ctx.font='bold 13px Segoe UI'; ctx.textAlign='center';
  ctx.fillText(text, x+w/2, y+TILE*0.42); ctx.textAlign='left';
}
function drawChandelier(px,py,t) {
  const pulse = 42+Math.sin(t*1.5)*4;
  const glow = ctx.createRadialGradient(px,py,2,px,py,pulse);
  glow.addColorStop(0,'rgba(255,235,150,0.32)'); glow.addColorStop(1,'rgba(255,235,150,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(px,py,pulse,0,Math.PI*2); ctx.fill();
}
function drawInterior(t) {
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    const cell = interiorMap[r][c];
    const isNac = c<15;
    if (cell===1) drawWallTile(c,r);
    else if (cell===3) drawRug(c,r);
    else if (cell===7) drawColumnInt(c,r);
    else if (cell===10) drawStatue(c,r);
    else if (cell===11) drawGlobe(c,r);
    else if (cell===12) drawBooks(c,r);
    else if (cell===13) drawChalkboard(c,r);
    else if (cell===14) drawLectern(c,r);
    else if (cell==='exit') drawExitDoor(c,r);
    else if (typeof cell === 'string') drawStation(c,r,cell);
    else drawFloorTile(c,r,isNac);
  }
  drawChandelier(7*TILE, 6*TILE, t);
  drawChandelier(22*TILE, 6*TILE, t);
  drawBanner('GALERIAS NACIONALES', 1, 13, 0, '#1b5e20');
  drawBanner('GALERIAS INTERNACIONALES', 16, 28, 0, '#0d47a1');
}

function drawAvatar() {
  const x=player.x, y=player.y;
  const bob = player.moving ? Math.abs(Math.sin(player.animT))*2 : 0;
  const cx=x+TILE/2, cy=y+TILE/2-bob;
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(cx,y+TILE-4,10,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#c62828';
  ctx.beginPath(); ctx.moveTo(cx-9,cy-2); ctx.lineTo(cx-13,cy+12); ctx.lineTo(cx+13,cy+12); ctx.lineTo(cx+9,cy-2); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#283593'; ctx.fillRect(cx-8,cy-4,16,14);
  const legSwing = player.moving ? Math.sin(player.animT*2)*4 : 0;
  ctx.fillStyle='#1a1a2e'; ctx.fillRect(cx-6,cy+9,4,8+legSwing*0.4); ctx.fillRect(cx+2,cy+9,4,8-legSwing*0.4);
  ctx.fillStyle='#ffcc80'; ctx.beginPath(); ctx.arc(cx,cy-8,7,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function updateMinimap() {
  const mmNac = document.getElementById('mmNac');
  const mmIntl = document.getElementById('mmIntl');
  if (!mmNac || !mmIntl) return;
  if (scene !== 'interior') { mmNac.classList.remove('active'); mmIntl.classList.remove('active'); return; }
  const isNacSide = player.col < 15;
  mmNac.classList.toggle('active', isNacSide);
  mmIntl.classList.toggle('active', !isNacSide);
}

let t = 0;
function loop() {
  t += 0.03;
  handleInput();
  updatePlayer();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (scene === 'exterior') drawExterior(t); else drawInterior(t);
  drawAvatar();
  updateMinimap();
  requestAnimationFrame(loop);
}

updateProgress();
loop();

});
