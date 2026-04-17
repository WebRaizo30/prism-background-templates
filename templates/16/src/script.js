const defaults = {
  animDurationSec: 5,
  edgeColor: '#ffffff',
  band15: '#ff0000',
  band30: '#ffff00',
  band45: '#008000',
  band60: '#0000ff',
  band75: '#ffffff',
  centerBg: '#debe94',
  centerSizePx: 100,
};

let state = { ...defaults };

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function hexValid(h) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(h));
}

if (typeof window !== 'undefined' && window.__PRISM_BOOTSTRAP && typeof window.__PRISM_BOOTSTRAP === 'object') {
  const b = window.__PRISM_BOOTSTRAP;
  if (typeof b.animDurationSec === 'number') state.animDurationSec = clamp(Number(b.animDurationSec), 0.5, 60);
  const colorKeys = ['edgeColor', 'band15', 'band30', 'band45', 'band60', 'band75', 'centerBg'];
  for (const k of colorKeys) {
    if (typeof b[k] === 'string' && hexValid(b[k])) state[k] = b[k];
  }
  if (typeof b.centerSizePx === 'number') state.centerSizePx = clamp(Math.round(Number(b.centerSizePx)), 40, 400);
}

function applyToDom() {
  const root = document.documentElement;
  const setColor = (name, val) => {
    if (hexValid(val)) root.style.setProperty(name, val);
  };
  setColor('--prism-edge', state.edgeColor);
  setColor('--prism-15', state.band15);
  setColor('--prism-30', state.band30);
  setColor('--prism-45', state.band45);
  setColor('--prism-60', state.band60);
  setColor('--prism-75', state.band75);
  setColor('--prism-center-bg', state.centerBg);
  root.style.setProperty('--prism-anim-dur', `${state.animDurationSec}s`);
  root.style.setProperty('--prism-center-size', `${state.centerSizePx}px`);
}

window.__prismRandomBg = {
  defaults: { ...defaults },
  getState() {
    return { ...state };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    if (partial.animDurationSec !== undefined) state.animDurationSec = clamp(Number(partial.animDurationSec), 0.5, 60);
    const colors = ['edgeColor', 'band15', 'band30', 'band45', 'band60', 'band75', 'centerBg'];
    for (const k of colors) {
      if (partial[k] !== undefined && hexValid(partial[k])) state[k] = String(partial[k]);
    }
    if (partial.centerSizePx !== undefined) state.centerSizePx = clamp(Math.round(Number(partial.centerSizePx)), 40, 400);
    applyToDom();
  },
  reset() {
    state = { ...defaults };
    applyToDom();
  },
};

applyToDom();
