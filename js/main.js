// main.js — Bucle principal, control de escenas, input, cámara y modal de estaciones
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const fadeEl = document.getElementById('fade');
  const sceneLabel = document.getElementById('sceneLabel');
  const zoneNacEl = document.getElementById('zoneNac');
  const zoneIntlEl = document.getElementById('zoneIntl');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');

  const STATION_ORDER = ['n1','n2','n3','n4','n5','i1','i2','i3','i4','i5'];
  const TOTAL_STATIONS = STATION_ORDER.length;

  const exteriorMap = buildExteriorMap();
  const interiorMap = buildInteriorMap();

  let scene = 'exterior';
  let map = exteriorMap;
  const visited = new Set();
  const doorGlowRef = { value: 0 };
  let transitioning = false;
  let modalOpen = false;

  const player = {
    col:14, row:14, x:14*TILE, y:14*TILE, targetX:14*TILE, targetY:14*TILE,
    dir:'up', moving:false, speed:4, animT:0
  };

  // ==== CÁMARA CON SEGUIMIENTO Y ZOOM ====
  const ZOOM = window.innerWidth < 700 ? 1.9 : 1.5;
  let camX = 0, camY = 0;
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function updateCamera() {
    const viewW = canvas.width / ZOOM;
    const viewH = canvas.height / ZOOM;
    const targetX = player.x + TILE/2 - viewW/2;
    const targetY = player.y + TILE/2 - viewH/2;
    const maxX = COLS*TILE - viewW;
    const maxY = ROWS*TILE - viewH;
    camX = clamp(targetX, 0, Math.max(0, maxX));
    camY = clamp(targetY, 0, Math.max(0, maxY));
  }

  // Las estaciones (cuadros) son SÓLIDAS: no se puede caminar sobre ellas,
  // hay que quedar justo al frente para interactuar.
  function isWalkable(c,r) {
    if (r<0||r>=ROWS||c<0||c>=COLS) return false;
    const cell = map[r][c];
    if (scene==='exterior') return cell !== 1 && cell !== 3 && cell !== 4 && cell !== 5 && cell !== 6 && cell !== 7;
    if (typeof cell === 'string' && cell !== 'exit') return false;
    return cell !== 1 && cell !== 7 && cell !== 10 && cell !== 11 && cell !== 12 && cell !== 13 && cell !== 14;
  }

  const keys = {};
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'escape') {
      if (modalOpen) {
        document.getElementById('modalOverlay').style.display='none';
        modalOpen = false;
      }
      return;
    }
    if (modalOpen) return;
    keys[k] = true;
    if (k==='e') interact();
  });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

  function tryMove(dc,dr,dir) {
    if (player.moving || transitioning) return;
    player.dir = dir;
    const nc=player.col+dc, nr=player.row+dr;
    if (!isWalkable(nc,nr)) return;
    player.col=nc; player.row=nr;
    player.targetX=nc*TILE; player.targetY=nr*TILE;
    player.moving = true;
  }

  // Devuelve la casilla de estación justo frente al jugador, según hacia dónde mira.
  function getFacingStation() {
    const dirs={down:[0,1],up:[0,-1],left:[-1,0],right:[1,0]};
    const [dc,dr]=dirs[player.dir];
    const tc=player.col+dc, tr=player.row+dr;
    if (tr<0||tr>=ROWS||tc<0||tc>=COLS) return null;
    const cell = map[tr][tc];
    if (typeof cell==='string' && STATIONS[cell]) return cell;
    return null;
  }

  function interact() {
    if (player.moving || transitioning) return;
    const key = getFacingStation();
    if (key) openStation(key);
  }

  function updateProgress() {
    const pct = Math.round((visited.size/TOTAL_STATIONS)*100);
    progressFill.style.width = pct + '%';
    progressText.textContent = `${visited.size}/${TOTAL_STATIONS} estaciones`;
  }

  function openStation(key) {
    const s = STATIONS[key];
    const idx = STATION_ORDER.indexOf(key) + 1;
    const body = document.getElementById('modalBody');
    body.className = s.zona;
    body.innerHTML = `<img src="${s.img}" alt="${s.nombre}">
      <div class="modalText">
      <div class="topRow">
        <span class="tag ${s.zona}">${s.zona==='nac'?'Galeria Nacional':'Galeria Internacional'}</span>
        <span class="counter">Estación ${idx} de ${TOTAL_STATIONS}</span>
      </div>
      <h2>${s.nombre}<span class="catTag">${s.categoria}</span></h2>
      <h4>Contexto</h4><p>${s.contexto}</p>
      <h4>Enfoque</h4><p>${s.enfoque}</p>
      <h4>Metodología</h4><p>${s.metodologia}</p>
      <h4>TIC utilizadas</h4><p>${s.tics}</p>
      <h4>Aportes</h4><p>${s.aportes}</p>
      </div>`;
    document.getElementById('modalOverlay').style.display='flex';
    modalOpen = true;
    visited.add(key);
    updateProgress();
  }
  document.getElementById('closeBtn').addEventListener('click', () => {
    document.getElementById('modalOverlay').style.display='none';
    modalOpen = false;
  });

  // El clic sobre el canvas SOLO abre la ficha si el jugador está justo al lado
  // de esa casilla (adyacente, distancia Manhattan = 1), tomando en cuenta cámara y zoom.
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = Math.floor((camX + (e.clientX-rect.left)*scaleX/ZOOM)/TILE);
    const cy = Math.floor((camY + (e.clientY-rect.top)*scaleY/ZOOM)/TILE);
    if (cy<0||cy>=ROWS||cx<0||cx>=COLS) return;
    const cell = map[cy][cx];
    if (typeof cell!=='string' || !STATIONS[cell]) return;
    const dist = Math.abs(cx-player.col) + Math.abs(cy-player.row);
    if (dist !== 1) return;
    openStation(cell);
  });

  function updateMinimap() {
    zoneNacEl.classList.toggle('active', scene==='interior' && player.col<15);
    zoneIntlEl.classList.toggle('active', scene==='interior' && player.col>=15);
    if (scene==='exterior') { zoneNacEl.classList.remove('active'); zoneIntlEl.classList.remove('active'); }
  }

  function switchScene() {
    transitioning = true;
    fadeEl.style.transition = 'opacity 0.45s ease';
    fadeEl.style.opacity = '1';
    setTimeout(() => {
      if (scene === 'exterior') {
        scene = 'interior';
        map = interiorMap;
        player.col=14; player.row=12; player.x=14*TILE; player.y=12*TILE;
        player.targetX=player.x; player.targetY=player.y;
        sceneLabel.textContent = 'Interior';
      } else {
        scene = 'exterior';
        map = exteriorMap;
        player.col=14; player.row=9; player.x=14*TILE; player.y=9*TILE;
        player.targetX=player.x; player.targetY=player.y;
        sceneLabel.textContent = 'Exterior';
      }
      updateMinimap();
      setTimeout(() => {
        fadeEl.style.opacity = '0';
        setTimeout(() => { transitioning = false; }, 460);
      }, 120);
    }, 460);
  }

  function handleInput() {
    if (modalOpen || player.moving || transitioning) return;
    if (keys['arrowup']||keys['w']) tryMove(0,-1,'up');
    else if (keys['arrowdown']||keys['s']) tryMove(0,1,'down');
    else if (keys['arrowleft']||keys['a']) tryMove(-1,0,'left');
    else if (keys['arrowright']||keys['d']) tryMove(1,0,'right');
  }
  function updatePlayer() {
    player.animT += 0.28;
    if (!player.moving) return;
    const dx=player.targetX-player.x, dy=player.targetY-player.y;
    const dist=Math.hypot(dx,dy);
    if (dist<=player.speed) {
      player.x=player.targetX; player.y=player.targetY; player.moving=false;
      const cell = map[player.row][player.col];
      if (cell==='door' || cell==='exit') {
        doorGlowRef.value = 1;
        switchScene();
      } else {
        updateMinimap();
      }
    } else { player.x+=dx/dist*player.speed; player.y+=dy/dist*player.speed; }
  }

  let t=0;
  function loop() {
    t+=0.03;
    handleInput();
    updatePlayer();
    updateCamera();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.scale(ZOOM, ZOOM);
    ctx.translate(-camX, -camY);
    if (scene==='exterior') drawExterior(ctx, exteriorMap, t, doorGlowRef);
    else drawInterior(ctx, interiorMap, t, visited);
    drawAvatar(ctx, player);
    ctx.restore();
    requestAnimationFrame(loop);
  }
  updateProgress();
  loop();

  // ==== JOYSTICK VIRTUAL (control analógico táctil) ====
  (function() {
    const zone = document.getElementById('joystickZone');
    const base = document.getElementById('joystickBase');
    const stick = document.getElementById('joystickStick');
    if (!zone || !base || !stick) return;
    const baseRadius = 55;
    const stickRadius = 24;
    const maxDist = baseRadius - stickRadius;
    let active = false;

    function setStick(dx, dy) {
      stick.style.left = (31 + dx) + 'px';
      stick.style.top = (31 + dy) + 'px';
    }
    function resetStick() {
      stick.style.left = '31px';
      stick.style.top = '31px';
    }
    function clearDirs() {
      keys['arrowup']=false; keys['arrowdown']=false;
      keys['arrowleft']=false; keys['arrowright']=false;
    }
    function applyDirection(dx, dy) {
      clearDirs();
      const deadzone = 12;
      if (Math.hypot(dx,dy) < deadzone) return;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      if (angle >= -45 && angle < 45) keys['arrowright'] = true;
      else if (angle >= 45 && angle < 135) keys['arrowdown'] = true;
      else if (angle >= -135 && angle < -45) keys['arrowup'] = true;
      else keys['arrowleft'] = true;
    }
    function handleMove(clientX, clientY) {
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxDist) {
        const ratio = maxDist / dist;
        dx *= ratio; dy *= ratio;
      }
      setStick(dx, dy);
      applyDirection(dx, dy);
    }
    function start(e) {
      e.preventDefault();
      active = true;
      const t = e.touches ? e.touches[0] : e;
      handleMove(t.clientX, t.clientY);
    }
    function move(e) {
      if (!active) return;
      e.preventDefault();
      const t = e.touches ? e.touches[0] : e;
      handleMove(t.clientX, t.clientY);
    }
    function end(e) {
      if (!active) return;
      e.preventDefault();
      active = false;
      resetStick();
      clearDirs();
    }
    zone.addEventListener('touchstart', start, {passive:false});
    zone.addEventListener('touchmove', move, {passive:false});
    zone.addEventListener('touchend', end, {passive:false});
    zone.addEventListener('touchcancel', end, {passive:false});
    zone.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
  })();

  const btnAction = document.getElementById('btnAction');
  if (btnAction) {
    btnAction.addEventListener('touchstart', (e)=>{ e.preventDefault(); interact(); }, {passive:false});
    btnAction.addEventListener('click', interact);
  }
});
