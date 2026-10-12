'use strict';
// Load core modules (CommonJS) into browser scope
async function loadCore(name) {
  const src = await (await fetch(`../core/${name}.js`)).text();
  const module = { exports: {} }; new Function('module', 'exports', 'require', src)(module, module.exports, () => ({})); return module.exports;
}
(async () => {
  const { parseCoordinates, gameToMap, mapToGame } = await loadCore('coords');
  const { MarkerStore } = await loadCore('markers');
  const $ = id => document.getElementById(id);
  let lang = localStorage.getItem('lang') || 'en', T = I18N[lang];
  const profiles = await window.overlay.profiles();
  let profile, store, map, layer, me, bgLayer, ocrTimer = null, worker = null, interactive = false;

  function texts() { T = I18N[lang]; $('here').textContent = T.here; $('ocr').textContent = ocrTimer ? T.ocrOff : T.ocrOn; $('exp').textContent = T.exp; $('imp').textContent = T.imp; $('mapimg').textContent = T.mapImg; status(); }
  function status(extra = '') { $('status').textContent = `${interactive ? T.interact : T.clickThrough} — ${T.hint} ${extra}`; }
  function catOf(id) { return profile.categories.find(c => c.id === id) || profile.categories[0]; }

  function drawBackground() {
    if (bgLayer) bgLayer.remove();
    const { width: w, height: h, gridSize: g = 256 } = profile.map; const b = [[0, 0], [h, w]];
    const img = localStorage.getItem('mapimg:' + profile.id);
    if (img) bgLayer = L.imageOverlay(img, b).addTo(map);
    else { bgLayer = L.layerGroup().addTo(map); for (let x = 0; x <= w; x += g) L.polyline([[0, x], [h, x]], { color: '#5a4a30', weight: 1 }).addTo(bgLayer); for (let y = 0; y <= h; y += g) L.polyline([[y, 0], [y, w]], { color: '#5a4a30', weight: 1 }).addTo(bgLayer); }
    map.fitBounds(b);
  }
  function render() {
    layer.clearLayers();
    for (const m of store.all()) {
      const c = catOf(m.category);
      const mk = L.circleMarker([m.y, m.x], { radius: 7, color: c.color, fillOpacity: .8 }).addTo(layer);
      const div = document.createElement('div');
      div.innerHTML = `<input value="" style="width:150px"><br><textarea rows=2 style="width:150px"></textarea><br><button data-a=s>${T.save}</button> <button data-a=d>${T.del}</button>`;
      div.querySelector('input').value = m.title; div.querySelector('textarea').value = m.note;
      div.querySelector('[data-a=s]').onclick = () => { store.update(m.id, { title: div.querySelector('input').value, note: div.querySelector('textarea').value }); render(); };
      div.querySelector('[data-a=d]').onclick = () => { store.remove(m.id); render(); };
      mk.bindPopup(div).bindTooltip(m.title || c.label);
    }
  }
  let hereMode = false;
  function setPlayer(mp) { if (me) me.setLatLng([mp.y, mp.x]); else me = L.marker([mp.y, mp.x]).addTo(map); }
  function selectProfile(id) {
    profile = profiles.find(p => p.id === id) || profiles[0]; store = new MarkerStore({ get: k => localStorage.getItem(k), set: (k, v) => localStorage.setItem(k, v) }, profile.id);
    $('cat').innerHTML = profile.categories.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
    if (me) { me.remove(); me = null; } drawBackground(); render();
  }
  map = L.map('map', { crs: L.CRS.Simple, minZoom: -4, maxZoom: 4, attributionControl: false }); layer = L.layerGroup().addTo(map);
  map.on('click', e => {
    const p = { x: e.latlng.lng, y: e.latlng.lat };
    if (hereMode) { hereMode = false; setPlayer(p); const g = mapToGame(p, profile.transform); status(`(game ${g.x.toFixed(0)}, ${g.y.toFixed(0)})`); return; }
    store.add({ ...p, category: $('cat').value, title: '' }); render();
  });
  $('profile').innerHTML = profiles.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  $('profile').onchange = e => selectProfile(e.target.value);
  $('lang').value = lang; $('lang').onchange = e => { lang = e.target.value; localStorage.setItem('lang', lang); texts(); render(); };
  $('here').onclick = () => { hereMode = true; };
  $('exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([store.exportJSON()], { type: 'application/json' })); a.download = `markers-${profile.id}.json`; a.click(); };
  $('imp').onclick = () => $('file').click();
  $('file').onchange = async e => { const f = e.target.files[0]; if (f) { try { store.importJSON(await f.text()); render(); } catch (err) { status('Import error: ' + err.message); } } e.target.value = ''; };
  $('mapimg').onclick = () => $('imgfile').click();
  $('imgfile').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { localStorage.setItem('mapimg:' + profile.id, r.result); } catch { status('Image too large for localStorage'); } drawBackground(); }; r.readAsDataURL(f); };
  $('ocr').onclick = async () => {
    if (ocrTimer) { clearInterval(ocrTimer); ocrTimer = null; texts(); return; }
    worker = worker || await Tesseract.createWorker('eng');
    ocrTimer = setInterval(async () => {
      try {
        const img = await window.overlay.capture(profile.ocr.region);
        const { data } = await worker.recognize(img); const g = parseCoordinates(data.text, profile.ocr.pattern);
        if (g) { setPlayer(gameToMap(g, profile.transform)); status(`OCR ${g.x}, ${g.y}`); }
      } catch (err) { status('OCR: ' + err.message); }
    }, profile.ocr.intervalMs || 1500); texts();
  };
  window.overlay.onMode(m => { interactive = m.interactive; document.body.classList.toggle('passive', !interactive); status(); });
  selectProfile(profiles[0].id); texts();
})();
