const defaults = {
  bgColor: '#111111',
  noiseOpacity: 0.9,
  animDurationSec: 0.2,
};

let state = {
  bgColor: defaults.bgColor,
  noiseOpacity: defaults.noiseOpacity,
  animDurationSec: defaults.animDurationSec,
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
  if (typeof b.noiseOpacity === 'number') state.noiseOpacity = clamp(Number(b.noiseOpacity), 0.05, 1);
  if (typeof b.animDurationSec === 'number') state.animDurationSec = clamp(Number(b.animDurationSec), 0.05, 3);
}

function applyToDom() {
  const root = document.documentElement;
  if (hexValid(state.bgColor)) root.style.setProperty('--prism-bg', state.bgColor);
  root.style.setProperty('--prism-noise-opacity', String(state.noiseOpacity));
  root.style.setProperty('--prism-anim-duration', `${state.animDurationSec}s`);
}

window.__prismStaticNoise = {
  defaults: {
    bgColor: defaults.bgColor,
    noiseOpacity: defaults.noiseOpacity,
    animDurationSec: defaults.animDurationSec,
  },
  getState() {
    return {
      bgColor: state.bgColor,
      noiseOpacity: state.noiseOpacity,
      animDurationSec: state.animDurationSec,
    };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    if (partial.bgColor !== undefined && hexValid(partial.bgColor)) state.bgColor = String(partial.bgColor);
    if (partial.noiseOpacity !== undefined) state.noiseOpacity = clamp(Number(partial.noiseOpacity), 0.05, 1);
    if (partial.animDurationSec !== undefined) state.animDurationSec = clamp(Number(partial.animDurationSec), 0.05, 3);
    applyToDom();
  },
  reset() {
    state = {
      bgColor: defaults.bgColor,
      noiseOpacity: defaults.noiseOpacity,
      animDurationSec: defaults.animDurationSec,
    };
    applyToDom();
  },
};

applyToDom();
