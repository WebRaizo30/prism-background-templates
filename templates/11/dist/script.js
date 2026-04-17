const PARTICLE_COUNT = 62;

const defaults = {
  bgColor: '#3e6fa3',
  particleSizePx: 8,
  radiusPx: 80,
  lapDurationSec: 3,
};

let state = {
  bgColor: defaults.bgColor,
  particleSizePx: defaults.particleSizePx,
  radiusPx: defaults.radiusPx,
  lapDurationSec: defaults.lapDurationSec,
};

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function hexValid(h) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(h));
}

if (typeof window !== 'undefined' && window.__PRISM_BOOTSTRAP && typeof window.__PRISM_BOOTSTRAP === 'object') {
  const b = window.__PRISM_BOOTSTRAP;
  if (typeof b.bgColor === 'string' && hexValid(b.bgColor)) state.bgColor = b.bgColor;
  if (typeof b.particleSizePx === 'number') state.particleSizePx = clamp(Math.round(Number(b.particleSizePx)), 2, 32);
  if (typeof b.radiusPx === 'number') state.radiusPx = clamp(Number(b.radiusPx), 20, 200);
  if (typeof b.lapDurationSec === 'number') state.lapDurationSec = clamp(Number(b.lapDurationSec), 0.5, 20);
}

function ensureParticles() {
  const w = document.querySelector('.wrapper');
  if (!w || w.querySelector('i')) return;
  for (let n = 0; n < PARTICLE_COUNT; n++) {
    w.appendChild(document.createElement('i'));
  }
}

function applyParticleTransforms() {
  const items = document.querySelectorAll('.wrapper i');
  const lap = state.lapDurationSec;
  const r = state.radiusPx;
  items.forEach((el, idx) => {
    const i = idx + 1;
    const angle = (i / PARTICLE_COUNT) * 720;
    el.style.transform = `rotate(${angle}deg) translate3d(${r}px, 0, 0)`;
    el.style.animationDelay = `${(i * lap) / PARTICLE_COUNT}s`;
  });
}

function applyToDom() {
  const root = document.documentElement;
  root.style.setProperty('--prism-bg', state.bgColor);
  root.style.setProperty('--prism-particle', `${state.particleSizePx}px`);
  root.style.setProperty('--prism-lap', `${state.lapDurationSec}s`);
  applyParticleTransforms();
}

window.__prismCloudySpiral = {
  defaults: {
    bgColor: defaults.bgColor,
    particleSizePx: defaults.particleSizePx,
    radiusPx: defaults.radiusPx,
    lapDurationSec: defaults.lapDurationSec,
  },
  getState() {
    return {
      bgColor: state.bgColor,
      particleSizePx: state.particleSizePx,
      radiusPx: state.radiusPx,
      lapDurationSec: state.lapDurationSec,
    };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    if (partial.bgColor !== undefined && hexValid(partial.bgColor)) state.bgColor = String(partial.bgColor);
    if (partial.particleSizePx !== undefined) {
      state.particleSizePx = clamp(Math.round(Number(partial.particleSizePx)), 2, 32);
    }
    if (partial.radiusPx !== undefined) state.radiusPx = clamp(Number(partial.radiusPx), 20, 200);
    if (partial.lapDurationSec !== undefined) {
      state.lapDurationSec = clamp(Number(partial.lapDurationSec), 0.5, 20);
    }
    applyToDom();
  },
  reset() {
    state = {
      bgColor: defaults.bgColor,
      particleSizePx: defaults.particleSizePx,
      radiusPx: defaults.radiusPx,
      lapDurationSec: defaults.lapDurationSec,
    };
    applyToDom();
  },
};

ensureParticles();
applyToDom();
