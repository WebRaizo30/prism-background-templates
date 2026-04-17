const defaults = {
  colorLow: '#0014ff',
  colorHigh: '#64149b',
  trailOpacity: 0.5,
  particleSizePx: 2,
  maxAmplitude: 1500,
  fov: 100,
  dist: 100,
  rotSpeed: 0.005,
  waveSpeed: 0.03,
  sideLength: 50,
  spacingPx: 200,
};

let state = { ...defaults };

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function hexValid(h) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(h));
}

function hexToRgb(hex) {
  if (!hexValid(hex)) return { r: 0, g: 20, b: 255 };
  const n = parseInt(String(hex).slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

if (typeof window !== 'undefined' && window.__PRISM_BOOTSTRAP && typeof window.__PRISM_BOOTSTRAP === 'object') {
  const b = window.__PRISM_BOOTSTRAP;
  if (typeof b.colorLow === 'string' && hexValid(b.colorLow)) state.colorLow = b.colorLow;
  if (typeof b.colorHigh === 'string' && hexValid(b.colorHigh)) state.colorHigh = b.colorHigh;
  if (typeof b.trailOpacity === 'number') state.trailOpacity = clamp(Number(b.trailOpacity), 0.05, 1);
  if (typeof b.particleSizePx === 'number') state.particleSizePx = clamp(Number(b.particleSizePx), 1, 16);
  if (typeof b.maxAmplitude === 'number') state.maxAmplitude = clamp(Number(b.maxAmplitude), 100, 4000);
  if (typeof b.fov === 'number') state.fov = clamp(Number(b.fov), 40, 240);
  if (typeof b.dist === 'number') state.dist = clamp(Number(b.dist), 30, 400);
  if (typeof b.rotSpeed === 'number') state.rotSpeed = clamp(Number(b.rotSpeed), 0.001, 0.03);
  if (typeof b.waveSpeed === 'number') state.waveSpeed = clamp(Number(b.waveSpeed), 0.005, 0.15);
  if (typeof b.sideLength === 'number') state.sideLength = clamp(Math.round(Number(b.sideLength)), 8, 80);
  if (typeof b.spacingPx === 'number') state.spacingPx = clamp(Number(b.spacingPx), 40, 500);
}

const canvas = document.getElementById('can');
const ctx = canvas && canvas.getContext('2d');
if (!canvas || !ctx) {
  throw new Error('Canvas not available');
}
const points = [];

let rotXCounter = 0;
let rotYCounter = 0;
let counter = 0;

function Vector3(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.color = '#0D0';
}

Vector3.prototype.rotateX = function (angle) {
  const z = this.z * Math.cos(angle) - this.x * Math.sin(angle);
  const x = this.z * Math.sin(angle) + this.x * Math.cos(angle);
  return new Vector3(x, this.y, z);
};

Vector3.prototype.rotateY = function (angle) {
  const y = this.y * Math.cos(angle) - this.z * Math.sin(angle);
  const z = this.y * Math.sin(angle) + this.z * Math.cos(angle);
  return new Vector3(this.x, y, z);
};

Vector3.prototype.rotateZ = function (angle) {
  const x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
  const y = this.x * Math.sin(angle) + this.y * Math.cos(angle);
  return new Vector3(x, y, this.z);
};

Vector3.prototype.perspectiveProjection = function (fov, viewDistance) {
  const factor = fov / (viewDistance + this.z);
  const x = this.x * factor + canvas.width / 2;
  const y = this.y * factor + canvas.height / 2;
  return new Vector3(x, y, this.z);
};

Vector3.prototype.draw = function () {
  const ma = Math.max(state.maxAmplitude, 1);
  const frac = Math.min(1, Math.max(0, this.y / ma));
  const c0 = hexToRgb(state.colorLow);
  const c1 = hexToRgb(state.colorHigh);
  const r = Math.round(lerp(c0.r, c1.r, frac));
  const g = Math.round(lerp(c0.g, c1.g, frac));
  const b = Math.round(lerp(c0.b, c1.b, frac));
  const vec = this.rotateX(rotXCounter)
    .rotateY(rotYCounter)
    .rotateZ(0)
    .perspectiveProjection(state.fov, state.dist);

  this.color = `rgb(${r}, ${g}, ${b})`;
  ctx.fillStyle = this.color;
  const ps = state.particleSizePx;
  ctx.fillRect(vec.x, vec.y, ps, ps);
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function rebuildPoints() {
  points.length = 0;
  const sl = state.sideLength;
  const sp = state.spacingPx;
  for (let z = 0; z < sl; z++) {
    for (let x = 0; x < sl; x++) {
      const xStart = -(sl * sp) / 2;
      points.push(new Vector3(xStart + x * sp, 0, xStart + z * sp));
    }
  }
}

function loop() {
  const o = state.trailOpacity;
  ctx.fillStyle = `rgba(0, 0, 0, ${o})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sl = state.sideLength;
  const max = points.length;
  const ma = state.maxAmplitude;

  for (let i = 0; i < max; i++) {
    const x = i % sl;
    const z = Math.floor(i / sl);
    const xFinal = Math.sin((x / sl) * 4 * Math.PI + counter);
    const zFinal = Math.cos((z / sl) * 4 * Math.PI + counter);
    const gap = ma * 0.3;
    const amp = ma - gap;

    points[z * sl + x].y = ma + xFinal * zFinal * amp;
    points[i].draw();
  }

  counter += state.waveSpeed;
  rotXCounter += state.rotSpeed;
  rotYCounter += state.rotSpeed;

  window.requestAnimationFrame(loop);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

rebuildPoints();

window.__prismParallelDimension = {
  defaults: {
    colorLow: defaults.colorLow,
    colorHigh: defaults.colorHigh,
    trailOpacity: defaults.trailOpacity,
    particleSizePx: defaults.particleSizePx,
    maxAmplitude: defaults.maxAmplitude,
    fov: defaults.fov,
    dist: defaults.dist,
    rotSpeed: defaults.rotSpeed,
    waveSpeed: defaults.waveSpeed,
    sideLength: defaults.sideLength,
    spacingPx: defaults.spacingPx,
  },
  getState() {
    return {
      colorLow: state.colorLow,
      colorHigh: state.colorHigh,
      trailOpacity: state.trailOpacity,
      particleSizePx: state.particleSizePx,
      maxAmplitude: state.maxAmplitude,
      fov: state.fov,
      dist: state.dist,
      rotSpeed: state.rotSpeed,
      waveSpeed: state.waveSpeed,
      sideLength: state.sideLength,
      spacingPx: state.spacingPx,
    };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    const prevSl = state.sideLength;
    const prevSp = state.spacingPx;
    if (partial.colorLow !== undefined && hexValid(partial.colorLow)) state.colorLow = String(partial.colorLow);
    if (partial.colorHigh !== undefined && hexValid(partial.colorHigh)) state.colorHigh = String(partial.colorHigh);
    if (partial.trailOpacity !== undefined) state.trailOpacity = clamp(Number(partial.trailOpacity), 0.05, 1);
    if (partial.particleSizePx !== undefined) state.particleSizePx = clamp(Number(partial.particleSizePx), 1, 16);
    if (partial.maxAmplitude !== undefined) state.maxAmplitude = clamp(Number(partial.maxAmplitude), 100, 4000);
    if (partial.fov !== undefined) state.fov = clamp(Number(partial.fov), 40, 240);
    if (partial.dist !== undefined) state.dist = clamp(Number(partial.dist), 30, 400);
    if (partial.rotSpeed !== undefined) state.rotSpeed = clamp(Number(partial.rotSpeed), 0.001, 0.03);
    if (partial.waveSpeed !== undefined) state.waveSpeed = clamp(Number(partial.waveSpeed), 0.005, 0.15);
    if (partial.sideLength !== undefined) state.sideLength = clamp(Math.round(Number(partial.sideLength)), 8, 80);
    if (partial.spacingPx !== undefined) state.spacingPx = clamp(Number(partial.spacingPx), 40, 500);
    if (state.sideLength !== prevSl || state.spacingPx !== prevSp) {
      rebuildPoints();
    }
  },
  reset() {
    state = { ...defaults };
    rebuildPoints();
  },
};

loop();
