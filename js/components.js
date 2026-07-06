// components.js — Construcción de mapas (exterior/interior) y dibujo por tipo de casilla
const TILE = 32;
const COLS = 30, ROWS = 15;

// Paleta profesional/institucional
const PAL = {
  navy:'#1c2b3a', navyDeep:'#101a24', steel:'#5c7a94', steelLight:'#b6c7d6',
  olive:'#6f7d4f', oliveLight:'#a9b587', terracotta:'#c1694f', terracottaLight:'#e0a893',
  parchment:'#f3ecd9', gold:'#d9a955', stone:'#8a9199', stoneLight:'#c7ccd1'
};

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
  ctx.fillStyle = light? '#5b7a52' : '#526e4a';
  ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
}
function drawPathExt(ctx,c,r) {
  const light=(c+r)%3===0;
  ctx.fillStyle = light? PAL.stoneLight : PAL.stone;
  ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
}
function drawFacade(ctx,c,r) {
  const x=c*TILE,y=r*TILE;
  ctx.fillStyle = '#e4e1d6'; ctx.fillRect(x,y,TILE,TILE);
  ctx.fillStyle = PAL.stoneLight; ctx.fillRect(x,y,TILE,3);
  if ((c%3)===0) { ctx.fillStyle='rgba(28,43,58,0.06)'; ctx.fillRect(x,y,3,TILE); }
}
function drawColumnExt(ctx,c,r) {
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle = PAL.navy; ctx.fillRect(x,y,TILE,TILE);
  ctx.fillStyle = '#eef0ee'; ctx.fillRect(x+8, y-2, 16, TILE+4);
  ctx.fillStyle = PAL.stoneLight;
  for (let i=0;i<3;i++) ctx.fillRect(x+9, y+4+i*9, 14, 1.5);
  ctx.fillStyle = '#fff'; ctx.fillRect(x+7, y-4, 18, 4);
}
function drawStep(ctx,c,r) {
  const x=c*TILE, y=r*TILE;
  const isTop = r===9;
  ctx.fillStyle = isTop ? PAL.stoneLight : '#b9beb9';
  ctx.fillRect(x,y,TILE,TILE);
  ctx.fillStyle = 'rgba(16,26,36,0.15)';
  ctx.fillRect(x, y+TILE-4, TILE, 4);
}
function drawTree(ctx,c,r) {
  drawGrass(ctx,c,r);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='rgba(16,26,36,0.18)';
  ctx.beginPath(); ctx.ellipse(x+17,y+27,11,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#5b4636'; ctx.fillRect(x+13,y+16,6,14);
  ctx.fillStyle=PAL.olive; ctx.beginPath(); ctx.arc(x+16,y+10,13,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=PAL.oliveLight;
  ctx.beginPath(); ctx.arc(x+8,y+14,8,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+24,y+14,8,0,Math.PI*2); ctx.fill();
}
function drawFlower(ctx,c,r) {
  drawGrass(ctx,c,r);
  const x=c*TILE, y=r*TILE;
  const colors=[PAL.terracotta,PAL.gold,PAL.steel,PAL.terracottaLight];
  for (let i=0;i<4;i++) {
    ctx.fillStyle = colors[(c+r+i)%colors.length];
    const ox=9+(i%2)*13, oy=9+Math.floor(i/2)*13;
    ctx.beginPath(); ctx.arc(x+ox,y+oy,3.2,0,Math.PI*2); ctx.fill();
  }
}
function drawLamp(ctx,c,r,t) {
  drawGrass(ctx,c,r);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle=PAL.navy; ctx.fillRect(x+14,y+10,4,22);
  const pulse = 12 + Math.sin(t*2)*1.5;
  const glow = ctx.createRadialGradient(x+16,y+8,1,x+16,y+8,pulse);
  glow.addColorStop(0,'rgba(217,169,85,0.65)'); glow.addColorStop(1,'rgba(217,169,85,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(x+16,y+8,pulse,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=PAL.gold; ctx.beginPath(); ctx.arc(x+16,y+8,4,0,Math.PI*2); ctx.fill();
}
function drawFountain(ctx,c,r,t) {
  drawPathExt(ctx,c,r);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle=PAL.stone; ctx.beginPath(); ctx.arc(x+16,y+16,15,0,Math.PI*2); ctx.fill();
  const wobble = Math.sin(t*3+c+r)*1.5;
  ctx.fillStyle=PAL.steel; ctx.beginPath(); ctx.arc(x+16,y+16,11+wobble*0.3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=PAL.steelLight; ctx.beginPath(); ctx.arc(x+16,y+16,5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(x+13,y+13,1.5,0,Math.PI*2); ctx.fill();
}
function drawDoorExt(ctx,c,r,glow) {
  const x=c*TILE, y=r*TILE;
  if (glow > 0) {
    const g = ctx.createRadialGradient(x+16,y+16,2,x+16,y+16,30);
    g.addColorStop(0, `rgba(217,169,85,${0.5*glow})`);
    g.addColorStop(1, 'rgba(217,169,85,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x+16,y+16,30,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#3d2f26'; ctx.fillRect(x,y-2,TILE,TILE+2);
  ctx.fillStyle='#5a4636'; ctx.fillRect(x+3,y,TILE-6,TILE-2);
  ctx.strokeStyle='#3d2f26'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(x+16,y); ctx.lineTo(x+16,y+TILE-2); ctx.stroke();
  ctx.fillStyle=PAL.gold; ctx.beginPath(); ctx.arc(x+TILE-8,y+TILE/2,2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+8,y+TILE/2,2,0,Math.PI*2); ctx.fill();
}

function drawEntranceSign(ctx, exteriorMap) {
  let minC = null, maxC = null, doorRow = null;
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    if (exteriorMap[r][c]==='door') {
      if (minC===null || c<minC) minC=c;
      if (maxC===null || c>maxC) maxC=c;
      doorRow=r;
    }
  }
  if (minC===null) return;
  const cx = ((minC+maxC)/2 + 0.5) * TILE;
  const y = doorRow*TILE - 10;
  ctx.fillStyle = PAL.gold;
  ctx.font = 'bold 11px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('INGRESO', cx, y);
  ctx.textAlign = 'left';
}
function drawPediment(ctx) {
  ctx.fillStyle = '#e4e1d6';
  ctx.beginPath();
  ctx.moveTo(4*TILE, 1*TILE); ctx.lineTo(14.5*TILE, -1.8*TILE); ctx.lineTo(25*TILE, 1*TILE);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = PAL.stone; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(16,26,36,0.06)';
  ctx.beginPath();
  ctx.moveTo(5*TILE, 1*TILE); ctx.lineTo(14.5*TILE, -1.2*TILE); ctx.lineTo(24*TILE, 1*TILE);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = PAL.navy;
  ctx.font = 'bold 13px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('MUSEO VIRTUAL DE INNOVACION EDUCATIVA', 14.5*TILE, -0.1*TILE);
  ctx.font = 'bold 15px Georgia';
  ctx.fillStyle = PAL.gold;
  ctx.fillText('BIENVENIDOS', 14.5*TILE, 3.2*TILE);
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
  drawEntranceSign(ctx, exteriorMap);
  if (doorGlowRef.value > 0) doorGlowRef.value = Math.max(0, doorGlowRef.value - 0.01);
}

/* ===== DIBUJO INTERIOR ===== */
// Piso Sala Nacional: textura tipo tejido/artesanal en tonos oliva/terracota
function drawFloorNac(ctx,c,r) {
  const light=(c+r)%2===0;
  ctx.fillStyle = light ? '#ded3b6' : '#d3c6a3';
  ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
  ctx.strokeStyle = 'rgba(111,125,79,0.25)';
  ctx.lineWidth = 1;
  const x=c*TILE, y=r*TILE;
  ctx.beginPath(); ctx.moveTo(x,y+8); ctx.lineTo(x+TILE,y+8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x,y+16); ctx.lineTo(x+TILE,y+16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x,y+24); ctx.lineTo(x+TILE,y+24); ctx.stroke();
  if ((c+r)%4===0) { ctx.fillStyle='rgba(193,105,79,0.18)'; ctx.fillRect(x+4,y+4,TILE-8,TILE-8); }
}
// Piso Sala Internacional: mármol geométrico frío
function drawFloorIntl(ctx,c,r) {
  const light=(c+r)%2===0;
  ctx.fillStyle = light ? '#dde3e8' : '#cbd5dc';
  ctx.fillRect(c*TILE,r*TILE,TILE,TILE);
  const x=c*TILE, y=r*TILE;
  ctx.strokeStyle = 'rgba(92,122,148,0.3)'; ctx.lineWidth=1;
  ctx.strokeRect(x+1,y+1,TILE-2,TILE-2);
  if ((c+r)%3===0) {
    ctx.strokeStyle='rgba(92,122,148,0.35)';
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+TILE,y+TILE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+TILE,y); ctx.lineTo(x,y+TILE); ctx.stroke();
  }
}
function drawFloorTile(ctx,c,r,isNac) {
  if (isNac) drawFloorNac(ctx,c,r); else drawFloorIntl(ctx,c,r);
}
function drawWallTile(ctx,c,r) {
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle=PAL.navy; ctx.fillRect(x,y,TILE,TILE);
  ctx.fillStyle='#2a3d4f'; ctx.fillRect(x,y,TILE,6);
  // Cenefa decorativa superior
  ctx.fillStyle=PAL.gold;
  for (let i=0;i<TILE;i+=8) ctx.fillRect(x+i,y+6,4,2);
  ctx.fillStyle='#0d1620'; ctx.fillRect(x,y+TILE-3,TILE,3);
}
function drawColumnInt(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#eceff1'; ctx.fillRect(x+8,y+2,16,TILE-4);
  ctx.fillStyle=PAL.stoneLight;
  ctx.fillRect(x+8,y+2,16,5); ctx.fillRect(x+8,y+TILE-9,16,5);
  ctx.strokeStyle=PAL.stone; ctx.lineWidth=1;
  for (let i=0;i<3;i++) { ctx.beginPath(); ctx.moveTo(x+9+i*5,y+8); ctx.lineTo(x+9+i*5,y+TILE-8); ctx.stroke(); }
}
function drawRug(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  ctx.fillStyle = isNac? 'rgba(111,125,79,0.35)' : 'rgba(92,122,148,0.35)';
  ctx.fillRect(c*TILE+2,r*TILE+2,TILE-4,TILE-4);
  ctx.strokeStyle = 'rgba(217,169,85,0.5)'; ctx.lineWidth=1;
  ctx.strokeRect(c*TILE+5,r*TILE+5,TILE-10,TILE-10);
}
function drawStatue(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='rgba(16,26,36,0.18)';
  ctx.beginPath(); ctx.ellipse(x+16,y+29,10,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=PAL.stone; ctx.fillRect(x+8,y+22,16,8);
  ctx.fillStyle=PAL.stoneLight; ctx.fillRect(x+7,y+20,18,3);
  ctx.fillStyle='#eceff1';
  ctx.beginPath(); ctx.moveTo(x+11,y+21);
  ctx.lineTo(x+21,y+21); ctx.lineTo(x+18,y+13); ctx.lineTo(x+14,y+13);
  ctx.closePath(); ctx.fill();
}
function drawGlobe(ctx,c,r) {
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#6d4c41'; ctx.fillRect(x+13,y+24,6,6);
  ctx.strokeStyle='#4e342e'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(x+9,y+24); ctx.lineTo(x+23,y+24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+16,y+8); ctx.lineTo(x+16,y+24); ctx.stroke();
  ctx.save(); ctx.translate(x+16,y+14); ctx.rotate(-0.35);
  ctx.fillStyle=PAL.steel; ctx.beginPath(); ctx.arc(0,0,9,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=PAL.olive;
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
  const colors=[PAL.terracotta,PAL.steel,PAL.olive,PAL.gold];
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
  ctx.fillStyle='#3d2f26'; ctx.fillRect(x+3,y+2,TILE-6,TILE-8);
  ctx.fillStyle='#28402a'; ctx.fillRect(x+5,y+4,TILE-10,TILE-13);
  ctx.strokeStyle='rgba(243,236,217,0.7)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x+8,y+10); ctx.lineTo(x+18,y+10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+8,y+15); ctx.lineTo(x+22,y+15); ctx.stroke();
  ctx.beginPath(); ctx.arc(x+16,y+20,3,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle=PAL.stoneLight; ctx.fillRect(x+8,y+TILE-8,TILE-16,3);
}
function drawLectern(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#6d4c41';
  ctx.beginPath(); ctx.moveTo(x+11,y+28); ctx.lineTo(x+13,y+14); ctx.lineTo(x+19,y+14); ctx.lineTo(x+21,y+28); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#8d6e63'; ctx.fillRect(x+9,y+10,14,5);
  ctx.fillStyle=PAL.parchment; ctx.fillRect(x+10,y+6,12,6);
  ctx.strokeStyle=PAL.terracotta; ctx.lineWidth=0.6;
  ctx.beginPath(); ctx.moveTo(x+12,y+8); ctx.lineTo(x+20,y+8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+12,y+10); ctx.lineTo(x+18,y+10); ctx.stroke();
}

// Iconos distintivos por estación, dibujados dentro del marco del cuadro
function iconLaptop(ctx,x,y,color) {
  ctx.fillStyle=color; ctx.fillRect(x-7,y-5,14,8);
  ctx.fillStyle='#dfe9f2'; ctx.fillRect(x-5.5,y-3.5,11,5.5);
  ctx.fillStyle=color; ctx.fillRect(x-8,y+3,16,2);
}
function iconRuralHouse(ctx,x,y,color) {
  ctx.fillStyle=color;
  ctx.beginPath(); ctx.moveTo(x,y-7); ctx.lineTo(x+8,y-1); ctx.lineTo(x-8,y-1); ctx.closePath(); ctx.fill();
  ctx.fillRect(x-5,y-1,10,7);
  ctx.fillStyle='#dfe9f2'; ctx.fillRect(x-2,y+1,4,5);
}
function iconGearWrench(ctx,x,y,color) {
  ctx.strokeStyle=color; ctx.lineWidth=2.2; ctx.fillStyle=color;
  ctx.beginPath(); ctx.arc(x-2,y-2,4,0,Math.PI*2); ctx.fill();
  for (let i=0;i<6;i++){
    const ang=i/6*Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(x-2+Math.cos(ang)*4,y-2+Math.sin(ang)*4);
    ctx.lineTo(x-2+Math.cos(ang)*6.5,y-2+Math.sin(ang)*6.5);
    ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(x-2,y-2,1.6,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
}
function iconDove(ctx,x,y,color) {
  ctx.fillStyle=color;
  ctx.beginPath(); ctx.ellipse(x,y,7,4,0.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x+6,y-1); ctx.lineTo(x+11,y-4); ctx.lineTo(x+7,y+1); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x-7,y); ctx.lineTo(x-12,y-3); ctx.lineTo(x-6,y+2); ctx.closePath(); ctx.fill();
}
function iconSunMask(ctx,x,y,color) {
  ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=color; ctx.lineWidth=1.6;
  for (let i=0;i<8;i++){
    const ang=i/8*Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(x+Math.cos(ang)*6,y+Math.sin(ang)*6);
    ctx.lineTo(x+Math.cos(ang)*9,y+Math.sin(ang)*9);
    ctx.stroke();
  }
}
function iconSnowflake(ctx,x,y,color) {
  ctx.strokeStyle=color; ctx.lineWidth=1.8;
  for (let i=0;i<3;i++){
    const ang=i/3*Math.PI;
    ctx.beginPath();
    ctx.moveTo(x-Math.cos(ang)*8,y-Math.sin(ang)*8);
    ctx.lineTo(x+Math.cos(ang)*8,y+Math.sin(ang)*8);
    ctx.stroke();
  }
  ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y,1.6,0,Math.PI*2); ctx.fill();
}
function iconBulb(ctx,x,y,color) {
  ctx.fillStyle=color;
  ctx.beginPath(); ctx.arc(x,y-2,6,0,Math.PI*2); ctx.fill();
  ctx.fillRect(x-3,y+3,6,3);
  ctx.strokeStyle='#3d2f26'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(x-3,y+4); ctx.lineTo(x+3,y+4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x-3,y+6); ctx.lineTo(x+3,y+6); ctx.stroke();
}
function iconMakerTool(ctx,x,y,color) {
  ctx.strokeStyle=color; ctx.lineWidth=2.4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x-7,y+7); ctx.lineTo(x+3,y-3); ctx.stroke();
  ctx.fillStyle=color;
  ctx.beginPath(); ctx.arc(x+5,y-5,3.5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=color; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(x-2,y-7); ctx.lineTo(x-2,y-2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x-5,y-4.5); ctx.lineTo(x+1,y-4.5); ctx.stroke();
}
function iconChip(ctx,x,y,color) {
  ctx.fillStyle=color; ctx.fillRect(x-5,y-5,10,10);
  ctx.fillStyle='#0d1620'; ctx.fillRect(x-3,y-3,6,6);
  ctx.strokeStyle=color; ctx.lineWidth=1;
  [-6,-2,2,6].forEach(o=>{
    ctx.beginPath(); ctx.moveTo(x+o*0.8,y-5); ctx.lineTo(x+o*0.8,y-8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+o*0.8,y+5); ctx.lineTo(x+o*0.8,y+8); ctx.stroke();
  });
}
function iconGlobalNet(ctx,x,y,color) {
  ctx.strokeStyle=color; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x,y,7,3,0,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x,y-7); ctx.lineTo(x,y+7); ctx.stroke();
  ctx.fillStyle=color;
  [[x-5,y-4],[x+5,y-4],[x-5,y+4],[x+5,y+4],[x,y]].forEach(([px,py])=>{
    ctx.beginPath(); ctx.arc(px,py,1.3,0,Math.PI*2); ctx.fill();
  });
}
const STATION_ICONS = {
  n1: iconLaptop, n2: iconRuralHouse, n3: iconGearWrench, n4: iconDove, n5: iconSunMask,
  i1: iconSnowflake, i2: iconBulb, i3: iconMakerTool, i4: iconChip, i5: iconGlobalNet
};

function drawStation(ctx,c,r,key,visited) {
  const s = STATIONS[key];
  const isNac = s.zona==='nac';
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  const frameColor = isNac? PAL.olive : PAL.steel;
  const accentColor = isNac? PAL.terracotta : PAL.navy;
  // Sombra proyectada del cuadro
  ctx.fillStyle='rgba(16,26,36,0.22)';
  ctx.beginPath(); ctx.ellipse(x+17,y+18,13,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#3d2f26'; ctx.fillRect(x+1,y-8,TILE-2,TILE-2);
  // Fondo del cuadro distinto segun zona (calido para nacional, frio para internacional)
  ctx.fillStyle = isNac? '#f4ece0' : '#eef2f5';
  ctx.fillRect(x+4,y-5,TILE-8,TILE-6);
  ctx.strokeStyle=frameColor; ctx.lineWidth=2; ctx.strokeRect(x+4,y-5,TILE-8,TILE-6);
  // Icono unico de la estacion, dentro del lienzo
  const iconFn = STATION_ICONS[key];
  if (iconFn) iconFn(ctx, x+TILE/2, y-1.5, accentColor);
  ctx.fillStyle=frameColor; ctx.fillRect(x+7,y-1,TILE-14,7);
  ctx.beginPath(); ctx.arc(x+TILE/2,y+9,5,0,Math.PI*2);
  ctx.fillStyle = isNac? PAL.oliveLight : PAL.steelLight; ctx.fill();
  const glow = ctx.createRadialGradient(x+16,y-10,1,x+16,y-10,16);
  glow.addColorStop(0, isNac?'rgba(169,181,135,0.3)':'rgba(182,199,214,0.3)');
  glow.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(x+16,y-10,16,0,Math.PI*2); ctx.fill();
  if (visited.has(key)) {
    ctx.fillStyle=PAL.gold;
    ctx.beginPath(); ctx.arc(x+TILE-6,y-9,4,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#8a6a2e'; ctx.lineWidth=1; ctx.stroke();
  }
}

function drawExitDoor(ctx,c,r) {
  const isNac=c<15;
  drawFloorTile(ctx,c,r,isNac);
  const x=c*TILE, y=r*TILE;
  ctx.fillStyle='#3d2f26'; ctx.fillRect(x+2,y+4,TILE-4,TILE-4);
  ctx.fillStyle='#5a4636'; ctx.fillRect(x+5,y+6,TILE-10,TILE-8);
  ctx.fillStyle=PAL.gold; ctx.font='8px Georgia'; ctx.textAlign='center';
  ctx.fillText('SALIDA', x+TILE/2, y+TILE-6); ctx.textAlign='left';
}
function drawBanner(ctx,text,colStart,colEnd,row,color) {
  const x=colStart*TILE, w=(colEnd-colStart+1)*TILE, y=row*TILE;
  ctx.fillStyle=color; ctx.fillRect(x,y,w,TILE*0.6);
  ctx.fillStyle='rgba(255,255,255,0.12)'; ctx.fillRect(x,y,w,TILE*0.22);
  ctx.fillStyle='#f3ecd9'; ctx.font='bold 13px Georgia'; ctx.textAlign='center';
  ctx.fillText(text, x+w/2, y+TILE*0.42); ctx.textAlign='left';
}
// Sellos distintivos de cada galería (escudo simplificado / globo)
function drawSealNac(ctx,cx,cy) {
  ctx.save(); ctx.translate(cx,cy);
  ctx.fillStyle=PAL.olive;
  ctx.beginPath();
  ctx.moveTo(0,-14); ctx.lineTo(12,-8); ctx.lineTo(12,6); ctx.lineTo(0,16); ctx.lineTo(-12,6); ctx.lineTo(-12,-8);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle=PAL.gold; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle=PAL.gold;
  ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(5,3); ctx.lineTo(-5,3); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawSealIntl(ctx,cx,cy) {
  ctx.save(); ctx.translate(cx,cy);
  ctx.fillStyle=PAL.steel;
  ctx.beginPath(); ctx.arc(0,0,13,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=PAL.gold; ctx.lineWidth=1.5; ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=0.7;
  ctx.beginPath(); ctx.ellipse(0,0,13,4.5,0,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,-13); ctx.lineTo(0,13); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-11,-6); ctx.lineTo(11,6); ctx.stroke();
  ctx.restore();
}
function drawChandelier(ctx,px,py,t) {
  const pulse = 42 + Math.sin(t*1.5)*4;
  const glow = ctx.createRadialGradient(px,py,2,px,py,pulse);
  glow.addColorStop(0,'rgba(217,169,85,0.28)'); glow.addColorStop(1,'rgba(217,169,85,0)');
  ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(px,py,pulse,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#5a4636'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(px,py-40); ctx.lineTo(px,py-10); ctx.stroke();
  ctx.fillStyle=PAL.gold;
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
  drawBanner(ctx,'GALERIAS NACIONALES', 1, 13, 0, PAL.olive);
  drawBanner(ctx,'GALERIAS INTERNACIONALES', 16, 28, 0, PAL.steel);
  drawSealNac(ctx, 7*TILE, 0.9*TILE);
  drawSealIntl(ctx, 22*TILE, 0.9*TILE);
}

function drawAvatar(ctx, player) {
  const x=player.x, y=player.y;
  const bob = player.moving ? Math.abs(Math.sin(player.animT))*2 : 0;
  const cx=x+TILE/2, cy=y+TILE/2-bob;
  ctx.save();
  ctx.shadowColor=PAL.gold; ctx.shadowBlur=10;
  ctx.fillStyle='rgba(16,26,36,0.25)';
  ctx.beginPath(); ctx.ellipse(cx,y+TILE-4,10,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=PAL.terracotta;
  ctx.beginPath(); ctx.moveTo(cx-9,cy-2); ctx.lineTo(cx-13,cy+12); ctx.lineTo(cx+13,cy+12); ctx.lineTo(cx+9,cy-2); ctx.closePath(); ctx.fill();
  ctx.fillStyle=PAL.navy; ctx.fillRect(cx-8,cy-4,16,14);
  const legSwing = player.moving ? Math.sin(player.animT*2)*4 : 0;
  ctx.fillStyle='#1a1a2e';
  ctx.fillRect(cx-6,cy+9,4,8+legSwing*0.4);
  ctx.fillRect(cx+2,cy+9,4,8-legSwing*0.4);
  ctx.fillStyle='#ffcc80'; ctx.beginPath(); ctx.arc(cx,cy-8,7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#212121'; ctx.fillRect(cx-8,cy-15,16,3);
  ctx.beginPath(); ctx.moveTo(cx-1,cy-15); ctx.lineTo(cx+9,cy-19); ctx.lineTo(cx-1,cy-19); ctx.closePath(); ctx.fill();
  ctx.fillStyle=PAL.gold; ctx.beginPath(); ctx.arc(cx+9,cy-19,1.6,0,Math.PI*2); ctx.fill();
  ctx.restore();
  
}
