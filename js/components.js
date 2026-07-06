// components.js — Construcción de mapas (exterior/interior) y dibujo por tipo de casilla
const TILE = 32;
const COLS = 30, ROWS = 15;

function buildExteriorMap() {
  const m = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  for (let r=1; r<=8; r++) for (let c=5; c<=24; c++) m[r][c]=1;
  m[8][14]='door'; m[8][15]='door';
  [7,10,13,16,19,22].forEach(c => { m[6][c]=7; m[7][c]=7; });
  for (let c=12; c<=17; c++) m[9][c]=8;
  for (let c=13; c<=16; c++) m[10][c]=8;
  for (let r=11; r<=13; r++) for (let c=12; c<=17; c++) if(m[r][c]===0) m[r][c]=2;
  m[12][14]=5; m[12][15]=5; m[13][14]=5; m[13][15]=5;
  [[2,9],[2,11],[2,13],[27,9],[27,11],[27,13],[4,3],[25,3]].forEach(([c,r]) => m[r][c]=3);
  [[11,11],[18,11],[11,13],[18,13],[10,12],[19,12]].forEach(([c,r]) => m[r][c]=4);
  m[9][11]=6; m[9][18]=6;
  return m;
}

function buildInteriorMap() {
  const m = Array.from({length:ROWS}, () => Array(COLS).fill(1));
  for (let r=1;r<=13;r++) for (let c=1;c<=13;c++) m[r][c]=0;
  for (let r=1;r<=13;r++) for (let c=16;c<=28;c++) m[r][c]=0;
  for (let r=6;r<=8;r++) for (let c=13;c<=16;c++) m[r][c]=0;
  [[3,2,'n1'],[6,2,'n2'],[9,2,'n3'],[3,5,'n4'],[9,5,'n5']].forEach(([c,r,k]) => m[r][c]=k);
  [[19,2,'i1'],[22,2,'i2'],[25,2,'i3'],[19,5,'i4'],[25,5,'i5']].forEach(([c,r,k]) => m[r][c]=k);
  m[3][2]=10; m[3][12]=11;
  m[12][2]=12; m[12][12]=13;
  m[3][17]=14; m[3][27]=11;
  m[12][17]=12; m[12][27]=10;
  for (let r=8;r<=10;r++) for (let c=5;c<=9;c++) m[r][c]=3;
  for (let r=8;r<=10;r++) for (let c=19;c<=23;c++) m[r][c]=3;
  m[6][13]=7; m[6][16]=7; m[8][13]=7; m[8][16]=7;
  m[13][14]='exit'; m[13][15]='exit';
  return m;
}

/* ===== DIBUJO EXTERIOR ===== */
function drawGrass(ctx,c,r) {
  const light=(c+r)%2===0;
  ctx.fillStyle = light?'#66bb6a':'#5cad61';
  ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
}
function drawPathExt(ctx,c,r) {
  const light=(c+r)%3===0;
  ctx.fillStyle = light?'#d7ccc8':'#cbbfba';
  ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
}
function drawFacade(ctx,c,r) {
  const x=c*TILE,y=r*TILE;
  ctx.fillStyle = '#eceff1'; ctx.fillRect(x,y,TILE,TILE);
  ctx.fillStyle = '#cfd8dc'; ctx.fillRect(x,y,TILE,3);
  if ((c%3)===0) { ctx.fillStyle='rgba(0,0,0,0.04)'; ctx.fillRect(x,y,3,TILE); }
}
function drawColumnExt(ctx,c,r) {
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle = '#37474f'; ctx.fillRect(x,y,TILE,TILE);
  ctx.fillStyle = '#f5f5f5'; ctx.fillRect(x+8, y-2, 16, TILE+4);
  ctx.fillStyle = '#e0e0e0';
  for (let i=0;i<3;i++) ctx.fillRect(x+9, y+4+i*9, 14, 1.5);
  ctx.fillStyle = '#fff'; ctx.fillRect(x+7, y-4, 18, 4);
}
function drawStep(ctx,c,r) {
  const x=c*TILE, y=r*TILE;
  const isTop = r===9;
  ctx.fillStyle = isTop ? '#e0e0e0' : '#d5d5d5';
  ctx.fillRect(x,y,TILE,TILE);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(x, y+TILE-4, TILE, 4);
}
function drawTree(ctx,c,r) {
  drawGrass(ctx,c,r);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(x+17,y+27,11,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#5d4037'; ctx.fillRect(x+13,y+16,6,14);
  ctx.fillStyle='#2e7d32'; ctx.beginPath(); ctx.arc(x+16,y+10,13,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#388e3c';
  ctx.beginPath(); ctx.arc(x+8,y+14,8,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+24,y+14,8,0,Math.PI*2); ctx.fill();
}
function drawFlower(ctx,c,r) {
  drawGrass(ctx,c,r);
  const x=c*TILE, y=r*TILE;
  const colors=['#ef5350','#ffee58','#ba68c8','#ff8a65'];
  for (let i=0;i<4;i++) {
    ctx.fillStyle = colors[(c+r+i)%colors.length];
    const ox=9+(i%2)*13, oy=9+Math.floor(i/2)*13;
    ctx.beginPath(); ctx.arc(x+ox,y+oy,3.2,0,Math.PI*2); ctx.fill();
  }
}
function drawLamp(ctx,c,r,t) {
  drawGrass(ctx,c,r);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#37474f'; ctx.fillRect(x+14,y+10,4,22);
  const pulse = 12 + Math.sin(t*2)*1.5;
  const glow = ctx.createRadialGradient(x+16,y+8,1,x+16,y+8,pulse);
  glow.addColorStop(0,'rgba(255,235,130,0.7)'); glow.addColorStop(1,'rgba(255,235,130,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(x+16,y+8,pulse,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ffd54f'; ctx.beginPath(); ctx.arc(x+16,y+8,4,0,Math.PI*2); ctx.fill();
}
function drawFountain(ctx,c,r,t) {
  drawPathExt(ctx,c,r);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#90a4ae'; ctx.beginPath(); ctx.arc(x+16,y+16,15,0,Math.PI*2); ctx.fill();
  const wobble = Math.sin(t*3+c+r)*1.5;
  ctx.fillStyle='#4fc3f7'; ctx.beginPath(); ctx.arc(x+16,y+16,11+wobble*0.3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#81d4fa'; ctx.beginPath(); ctx.arc(x+16,y+16,5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(x+13,y+13,1.5,0,Math.PI*2); ctx.fill();
}
function drawDoorExt(ctx,c,r,glow) {
  const x=c*TILE, y=r*TILE;
  if (glow > 0) {
    const g = ctx.createRadialGradient(x+16,y+16,2,x+16,y+16,30);
    g.addColorStop(0, `rgba(255,213,79,${0.5*glow})`);
    g.addColorStop(1, 'rgba(255,213,79,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x+16,y+16,30,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#4e342e'; ctx.fillRect(x,y-2,TILE,TILE+2);
  ctx.fillStyle='#6d4c41'; ctx.fillRect(x+3,y,TILE-6,TILE-2);
  ctx.strokeStyle='#4e342e'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(x+16,y); ctx.lineTo(x+16,y+TILE-2); ctx.stroke();
  ctx.fillStyle='#ffd54f'; ctx.beginPath(); ctx.arc(x+TILE-8,y+TILE/2,2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+8,y+TILE/2,2,0,Math.PI*2); ctx.fill();
}
function drawPediment(ctx) {
  ctx.fillStyle = '#eceff1';
  ctx.beginPath();
  ctx.moveTo(4*TILE, 1*TILE); ctx.lineTo(14.5*TILE, -1.8*TILE); ctx.lineTo(25*TILE, 1*TILE);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.beginPath();
  ctx.moveTo(5*TILE, 1*TILE); ctx.lineTo(14.5*TILE, -1.2*TILE); ctx.lineTo(24*TILE, 1*TILE);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1b3a5c';
  ctx.font = 'bold 13px Segoe UI';
  ctx.textAlign = 'center';
  ctx.fillText('MUSEO VIRTUAL DE INNOVACION EDUCATIVA', 14.5*TILE, -0.1*TILE);
  ctx.textAlign = 'left';
}

function drawExterior(ctx, exteriorMap, t, doorGlowRef) {
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    const cell = exteriorMap[r][c];
    if (cell===1) drawFacade(ctx,c,r);
    else if (cell===2) drawPathExt(ctx,c,r);
    else if (cell===3) drawTree(ctx,c,r);
    else if (cell===4) drawFlower(ctx,c,r);
    else if (cell===5) drawFountain(ctx,c,r,t);
    else if (cell===6) drawLamp(ctx,c,r,t);
    else if (cell===7) drawColumnExt(ctx,c,r);
    else if (cell===8) drawStep(ctx,c,r);
    else if (cell==='door') drawDoorExt(ctx,c,r,doorGlowRef.value);
    else drawGrass(ctx,c,r);
  }
  drawPediment(ctx);
  if (doorGlowRef.value > 0) doorGlowRef.value = Math.max(0, doorGlowRef.value - 0.01);
}

/* ===== DIBUJO INTERIOR ===== */
function drawFloorTile(ctx,c,r,isNac) {
  const light=(c+r)%2===0;
  ctx.fillStyle = isNac ? (light?'#c8e6c9':'#a5d6a7') : (light?'#bbdefb':'#90caf9');
  ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
  ctx.strokeStyle = isNac ? 'rgba(27,94,32,0.08)' : 'rgba(13,71,161,0.08)';
  ctx.beginPath(); ctx.moveTo(c*TILE, r*TILE+TILE); ctx.lineTo(c*TILE+TILE, r*TILE); ctx.stroke();
}
function drawWallTile(ctx,c,r) {
  ctx.fillStyle='#37474f'; ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
  ctx.fillStyle='#455a64'; ctx.fillRect(c*TILE,r*TILE,TILE,6);
  ctx.fillStyle='#263238'; ctx.fillRect(c*TILE,r*TILE+TILE-3,TILE,3);
}
function drawColumnInt(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#eceff1'; ctx.fillRect(x+8,y+2,16,TILE-4);
  ctx.fillStyle='#cfd8dc';
  ctx.fillRect(x+8,y+2,16,5); ctx.fillRect(x+8,y+TILE-9,16,5);
  ctx.strokeStyle='#b0bec5'; ctx.lineWidth=1;
  for (let i=0;i<3;i++) { ctx.beginPath(); ctx.moveTo(x+9+i*5,y+8); ctx.lineTo(x+9+i*5,y+TILE-8); ctx.stroke(); }
}
function drawRug(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  ctx.fillStyle = isNac?'rgba(46,125,50,0.4)':'rgba(21,101,192,0.4)';
  ctx.fillRect(c*TILE+2,r*TILE+2,TILE-4,TILE-4);
  ctx.strokeStyle = 'rgba(255,215,64,0.5)'; ctx.lineWidth=1;
  ctx.strokeRect(c*TILE+5,r*TILE+5,TILE-10,TILE-10);
}
function drawStatue(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(x+16,y+29,10,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#b0bec5'; ctx.fillRect(x+8,y+22,16,8);
  ctx.fillStyle='#cfd8dc'; ctx.fillRect(x+7,y+20,18,3);
  ctx.fillStyle='#eceff1';
  ctx.beginPath(); ctx.moveTo(x+11,y+21); ctx.lineTo(x+9,y+10); ctx.quadraticCurveTo(x+16,y+6,x+23,y+10); ctx.lineTo(x+21,y+21); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#e0e0e0'; ctx.beginPath(); ctx.arc(x+16,y+7,5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#b0bec5'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x+13,y+13); ctx.lineTo(x+13,y+19); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+19,y+13); ctx.lineTo(x+19,y+19); ctx.stroke();
}
function drawGlobe(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#6d4c41'; ctx.fillRect(x+13,y+24,6,6);
  ctx.strokeStyle='#4e342e'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(x+9,y+24); ctx.lineTo(x+23,y+24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+16,y+8); ctx.lineTo(x+16,y+24); ctx.stroke();
  ctx.save(); ctx.translate(x+16,y+14); ctx.rotate(-0.35);
  ctx.fillStyle='#42a5f5'; ctx.beginPath(); ctx.arc(0,0,9,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#66bb6a';
  ctx.beginPath(); ctx.ellipse(-3,-2,3,4,0.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4,3,2.5,3,0.6,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=0.6;
  ctx.beginPath(); ctx.ellipse(0,0,9,3,0,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,-9); ctx.lineTo(0,9); ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#8d6e63'; ctx.fillRect(x+14,y+3,4,7);
}
function drawBooks(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  const colors=['#c62828','#1565c0','#2e7d32','#f9a825'];
  colors.forEach((col,i) => {
    ctx.fillStyle = col;
    ctx.fillRect(x+7+i*0.4, y+24-i*5, 18-i*0.5, 5);
    ctx.fillStyle='rgba(255,255,255,0.25)';
    ctx.fillRect(x+9+i*0.4, y+25-i*5, 4, 2);
  });
}
function drawChalkboard(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#5d4037'; ctx.fillRect(x+3,y+2,TILE-6,TILE-8);
  ctx.fillStyle='#1b5e20'; ctx.fillRect(x+5,y+4,TILE-10,TILE-13);
  ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x+8,y+10); ctx.lineTo(x+18,y+10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+8,y+15); ctx.lineTo(x+22,y+15); ctx.stroke();
  ctx.beginPath(); ctx.arc(x+16,y+20,3,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='#d7ccc8'; ctx.fillRect(x+8,y+TILE-8,TILE-16,3);
}
function drawLectern(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#6d4c41';
  ctx.beginPath(); ctx.moveTo(x+11,y+28); ctx.lineTo(x+13,y+14); ctx.lineTo(x+19,y+14); ctx.lineTo(x+21,y+28); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#8d6e63'; ctx.fillRect(x+9,y+10,14,5);
  ctx.fillStyle='#fdf6e3'; ctx.fillRect(x+10,y+6,12,6);
  ctx.strokeStyle='#c62828'; ctx.lineWidth=0.6;
  ctx.beginPath(); ctx.moveTo(x+12,y+8); ctx.lineTo(x+20,y+8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+12,y+10); ctx.lineTo(x+18,y+10); ctx.stroke();
}
function drawStation(ctx,c,r,key,visited) {
  const s = STATIONS[key];
  const isNac = s.zona==='nac';
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  const frameColor = isNac?'#2e7d32':'#1565c0';
  ctx.fillStyle='#4e342e'; ctx.fillRect(x+1,y-8,TILE-2,TILE-2);
  ctx.fillStyle='#fff'; ctx.fillRect(x+4,y-5,TILE-8,TILE-6);
  ctx.strokeStyle=frameColor; ctx.lineWidth=2; ctx.strokeRect(x+4,y-5,TILE-8,TILE-6);
  ctx.fillStyle=frameColor; ctx.fillRect(x+7,y-1,TILE-14,7);
  ctx.beginPath(); ctx.arc(x+TILE/2,y+9,5,0,Math.PI*2);
  ctx.fillStyle = isNac?'#66bb6a':'#42a5f5'; ctx.fill();
  const glow = ctx.createRadialGradient(x+16,y-10,1,x+16,y-10,16);
  glow.addColorStop(0, isNac?'rgba(255,235,150,0.35)':'rgba(200,230,255,0.35)');
  glow.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(x+16,y-10,16,0,Math.PI*2); ctx.fill();
  if (visited.has(key)) {
    ctx.fillStyle='#ffd54f';
    ctx.beginPath(); ctx.arc(x+TILE-6,y-9,4,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#b8860b'; ctx.lineWidth=1; ctx.stroke();
  }
}
function drawExitDoor(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#4e342e'; ctx.fillRect(x+2,y+4,TILE-4,TILE-4);
  ctx.fillStyle='#6d4c41'; ctx.fillRect(x+5,y+6,TILE-10,TILE-8);
  ctx.fillStyle='#ffd54f'; ctx.font='8px Segoe UI'; ctx.textAlign='center';
  ctx.fillText('SALIDA', x+TILE/2, y+TILE-6); ctx.textAlign='left';
}
function drawBanner(ctx,text,colStart,colEnd,row,color) {
  const x=colStart*TILE, w=(colEnd-colStart+1)*TILE, y=row*TILE;
  ctx.fillStyle=color; ctx.fillRect(x,y,w,TILE*0.6);
  ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(x,y,w,TILE*0.25);
  ctx.fillStyle='#fff'; ctx.font='bold 13px Segoe UI'; ctx.textAlign='center';
  ctx.fillText(text, x+w/2, y+TILE*0.42); ctx.textAlign='left';
}
function drawChandelier(ctx,px,py,t) {
  const pulse = 42 + Math.sin(t*1.5)*4;
  const glow = ctx.createRadialGradient(px,py,2,px,py,pulse);
  glow.addColorStop(0,'rgba(255,235,150,0.32)'); glow.addColorStop(1,'rgba(255,235,150,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(px,py,pulse,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#8d6e63'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(px,py-40); ctx.lineTo(px,py-10); ctx.stroke();
  ctx.fillStyle='#ffd54f';
  for (let i=0;i<5;i++) {
    const ang=(i/5)*Math.PI*2;
    ctx.beginPath(); ctx.arc(px+Math.cos(ang)*10, py-10+Math.sin(ang)*4, 2.5, 0, Math.PI*2); ctx.fill();
  }
}
function drawInterior(ctx, interiorMap, t, visited) {
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    const cell = interiorMap[r][c];
    const isNac = c<15;
    if (cell===1) drawWallTile(ctx,c,r);
    else if (cell===3) drawRug(ctx,c,r);
    else if (cell===7) drawColumnInt(ctx,c,r);
    else if (cell===10) drawStatue(ctx,c,r);
    else if (cell===11) drawGlobe(ctx,c,r);
    else if (cell===12) drawBooks(ctx,c,r);
    else if (cell===13) drawChalkboard(ctx,c,r);
    else if (cell===14) drawLectern(ctx,c,r);
    else if (cell==='exit') drawExitDoor(ctx,c,r);
    else if (typeof cell==='string') drawStation(ctx,c,r,cell,visited);
    else drawFloorTile(ctx,c,r,isNac);
  }
  drawChandelier(ctx,7*TILE, 6*TILE, t);
  drawChandelier(ctx,22*TILE, 6*TILE, t);
  drawBanner(ctx,'GALERIAS NACIONALES', 1, 13, 0, '#1b5e20');
  drawBanner(ctx,'GALERIAS INTERNACIONALES', 16, 28, 0, '#0d47a1');
}

function drawAvatar(ctx, player) {
  const x=player.x, y=player.y;
  const bob = player.moving ? Math.abs(Math.sin(player.animT))*2 : 0;
  const cx=x+TILE/2, cy=y+TILE/2-bob;
  ctx.save();
  ctx.shadowColor='#ffd54f'; ctx.shadowBlur=10;
  ctx.fillStyle='rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(cx,y+TILE-4,10,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#c62828';
  ctx.beginPath(); ctx.moveTo(cx-9,cy-2); ctx.lineTo(cx-13,cy+12); ctx.lineTo(cx+13,cy+12); ctx.lineTo(cx+9,cy-2); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#283593'; ctx.fillRect(cx-8,cy-4,16,14);
  const legSwing = player.moving ? Math.sin(player.animT*2)*4 : 0;
  ctx.fillStyle='#1a1a2e';
  ctx.fillRect(cx-6,cy+9,4,8+legSwing*0.4);
  ctx.fillRect(cx+2,cy+9,4,8-legSwing*0.4);
  ctx.fillStyle='#ffcc80'; ctx.beginPath(); ctx.arc(cx,cy-8,7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#212121'; ctx.fillRect(cx-8,cy-15,16,3);
  ctx.beginPath(); ctx.moveTo(cx-1,cy-15); ctx.lineTo(cx+9,cy-19); ctx.lineTo(cx-1,cy-19); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ffd54f'; ctx.beginPath(); ctx.arc(cx+9,cy-19,1.6,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
