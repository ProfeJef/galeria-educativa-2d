function openStation(key) {
  const s = STATIONS[key];
  const body = document.getElementById('modalBody');
  body.className = s.zona;
  body.innerHTML = `<img src="${s.img}" alt="${s.nombre}">
    <div class="modalText">
    <span class="tag ${s.zona}">${s.zona==='nac'?'Galeria Nacional':'Galeria Internacional'}</span>
    <h2>${s.nombre}</h2>
    <h4>Contexto</h4><p>${s.contexto}</p>
    <h4>Enfoque</h4><p>${s.enfoque}</p>
    <h4>Metodología</h4><p>${s.metodologia}</p>
    <h4>TIC utilizadas</h4><p>${s.tics}</p>
    <h4>Aportes</h4><p>${s.aportes}</p>
    </div>`;
  document.getElementById('modalOverlay').style.display='flex';
  visited.add(key);
}
