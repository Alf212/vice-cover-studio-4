// Vice Cover Studio — a multi-panel GTA-style cover maker.
// Everything runs locally: photos are read from the visitor's own machine
// and drawn onto a canvas; nothing is uploaded anywhere.

const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');

const LAYOUTS = {
  trio: [
    { x: 0, y: 0, w: 1, h: 0.58 },
    { x: 0, y: 0.58, w: 0.5, h: 0.42 },
    { x: 0.5, y: 0.58, w: 0.5, h: 0.42 },
  ],
  quad: [
    { x: 0, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ],
  strips: [
    { x: 0, y: 0, w: 0.2, h: 1 },
    { x: 0.2, y: 0, w: 0.2, h: 1 },
    { x: 0.4, y: 0, w: 0.2, h: 1 },
    { x: 0.6, y: 0, w: 0.2, h: 1 },
    { x: 0.8, y: 0, w: 0.2, h: 1 },
  ],
  hero: [
    { x: 0, y: 0, w: 0.66, h: 1 },
    { x: 0.66, y: 0, w: 0.34, h: 0.34 },
    { x: 0.66, y: 0.34, w: 0.34, h: 0.33 },
    { x: 0.66, y: 0.67, w: 0.34, h: 0.33 },
  ],
};

const state = {
  layout: 'trio',
  grade: 'sunset',
  title: 'VICE CITY HEAT',
  subtitle: 'one last score in the neon republic',
  photos: [],          // HTMLImageElement list, in load order
  panels: [],          // per-panel { dx, dy, zoom } in -1..1 / 1..3
  selected: 0,
};

const $ = (id) => document.getElementById(id);
const statusLine = $('statusLine');

function panelCount() { return LAYOUTS[state.layout].length; }

function resetPanels() {
  state.panels = Array.from({ length: panelCount() }, () => ({ dx: 0, dy: 0, zoom: 1 }));
  if (state.selected >= panelCount()) state.selected = 0;
}

function photoForPanel(i) {
  if (!state.photos.length) return null;
  return state.photos[i % state.photos.length];
}

function drawPanel(rect, i) {
  const W = canvas.width, H = canvas.height;
  const g = Math.max(6, Math.round(W * 0.006));
  const x = rect.x * W + g / 2, y = rect.y * H + g / 2;
  const w = rect.w * W - g, h = rect.h * H - g;
  const img = photoForPanel(i);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (img) {
    const p = state.panels[i];
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * p.zoom;
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    const cx = x + (w - dw) / 2 + p.dx * w * 0.35;
    const cy = y + (h - dh) / 2 + p.dy * h * 0.35;
    ctx.drawImage(img, cx, cy, dw, dh);
  } else {
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#3a1560');
    grad.addColorStop(1, '#0d3a5c');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = `600 ${Math.round(w * 0.07)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', x + w / 2, y + h / 2);
  }
  ctx.restore();
  if (i === state.selected && state.photos.length) {
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = Math.max(3, W * 0.004);
    ctx.strokeRect(x, y, w, h);
  }
}

function applyGrade() {
  if (state.grade === 'none') return;
  const W = canvas.width, H = canvas.height;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  if (state.grade === 'sunset') {
    grad.addColorStop(0, 'rgba(43,10,74,0.20)');
    grad.addColorStop(0.55, 'rgba(255,46,136,0.10)');
    grad.addColorStop(1, 'rgba(255,122,26,0.30)');
  } else {
    grad.addColorStop(0, 'rgba(0,229,255,0.14)');
    grad.addColorStop(0.6, 'rgba(20,0,50,0.12)');
    grad.addColorStop(1, 'rgba(255,0,128,0.26)');
  }
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}

function drawTitle() {
  const W = canvas.width, H = canvas.height;
  const title = state.title.trim();
  if (!title) return;
  ctx.save();
  ctx.textAlign = 'center';
  let size = W * 0.105;
  ctx.font = `${size}px Anton, sans-serif`;
  while (ctx.measureText(title).width > W * 0.92 && size > 12) {
    size *= 0.94;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  const ty = H * 0.16;
  ctx.lineWidth = size * 0.16;
  ctx.strokeStyle = '#160a2e';
  ctx.strokeText(title, W / 2, ty);
  const grad = ctx.createLinearGradient(0, ty - size, 0, ty);
  grad.addColorStop(0, '#fff6c9');
  grad.addColorStop(0.55, '#ffd23f');
  grad.addColorStop(1, '#ff7a1a');
  ctx.fillStyle = grad;
  ctx.fillText(title, W / 2, ty);
  const sub = state.subtitle.trim();
  if (sub) {
    ctx.font = `600 ${Math.round(W * 0.026)}px system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(sub.toUpperCase(), W / 2, ty + W * 0.05);
  }
  ctx.restore();
}

function draw() {
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = '#f5eefc';
  ctx.fillRect(0, 0, W, H);
  LAYOUTS[state.layout].forEach((rect, i) => drawPanel(rect, i));
  applyGrade();
  drawTitle();
}

function setStatus(msg) { statusLine.textContent = msg; }

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function addPhotos(sources) {
  for (const src of sources) {
    try { state.photos.push(await loadImage(src)); } catch { /* skip unreadable file */ }
  }
  draw();
  setStatus(state.photos.length
    ? `${state.photos.length} photo(s) loaded across ${panelCount()} panels. Click a panel, drag, zoom, export.`
    : 'That file could not be read as an image.');
}

$('photoInput').addEventListener('change', (e) => {
  const files = [...e.target.files].map((f) => URL.createObjectURL(f));
  if (files.length) addPhotos(files);
});
$('samplePier').addEventListener('click', () => addPhotos(['samples/pier.jpg']));
$('sampleBlvd').addEventListener('click', () => addPhotos(['samples/boulevard.jpg']));
$('shuffleBtn').addEventListener('click', () => {
  if (state.photos.length < 2) {
    setStatus('Load at least two photos (or both samples) to shuffle them.');
    return;
  }
  state.photos.push(state.photos.shift());
  draw();
  setStatus('Photos shuffled: each panel now shows the next photo.');
});

$('layoutSelect').addEventListener('change', (e) => {
  state.layout = e.target.value;
  resetPanels();
  $('zoomRange').value = 1;
  draw();
});
$('sizeSelect').addEventListener('change', (e) => {
  const [w, h] = e.target.value.split('x').map(Number);
  canvas.width = w;
  canvas.height = h;
  draw();
});
$('gradeSelect').addEventListener('change', (e) => { state.grade = e.target.value; draw(); });
$('titleInput').addEventListener('input', (e) => { state.title = e.target.value; draw(); });
$('subtitleInput').addEventListener('input', (e) => { state.subtitle = e.target.value; draw(); });
$('zoomRange').addEventListener('input', (e) => {
  state.panels[state.selected].zoom = Number(e.target.value);
  draw();
});

function panelAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const fx = (clientX - r.left) / r.width, fy = (clientY - r.top) / r.height;
  const rects = LAYOUTS[state.layout];
  for (let i = 0; i < rects.length; i++) {
    const p = rects[i];
    if (fx >= p.x && fx < p.x + p.w && fy >= p.y && fy < p.y + p.h) return i;
  }
  return -1;
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  state.selected = i;
  $('zoomRange').value = state.panels[i].zoom;
  drag = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
  draw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const r = canvas.getBoundingClientRect();
  const p = state.panels[state.selected];
  p.dx = Math.max(-1, Math.min(1, p.dx + (e.clientX - drag.x) / r.width * 2.4));
  p.dy = Math.max(-1, Math.min(1, p.dy + (e.clientY - drag.y) / r.height * 2.4));
  drag = { x: e.clientX, y: e.clientY };
  draw();
});
canvas.addEventListener('pointerup', () => { drag = null; });

$('exportBtn').addEventListener('click', () => {
  const keep = state.selected;
  state.selected = -1;
  draw();
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vice-cover.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    state.selected = keep;
    draw();
    setStatus(`Exported a ${canvas.width} x ${canvas.height} PNG.`);
  }, 'image/png');
});

// Screenshot/demo mode: ?shot=cover|editor&photo=pier|boulevard&caption=Text
// loads a bundled sample into every panel so the app can be photographed
// exactly as a visitor would see it after adding that photo.
async function init() {
  resetPanels();
  const q = new URLSearchParams(location.search);
  const photo = q.get('photo');
  if (photo) {
    await addPhotos([`samples/${photo}.jpg`]);
    if (q.get('caption')) {
      state.title = q.get('caption').toUpperCase();
      $('titleInput').value = state.title;
    }
    if (q.get('layout') && LAYOUTS[q.get('layout')]) {
      state.layout = q.get('layout');
      $('layoutSelect').value = state.layout;
      resetPanels();
    }
  }
  if (q.get('shot') === 'cover') document.body.classList.add('shot-cover');
  await document.fonts.load('100px Anton');
  draw();
}

init();
