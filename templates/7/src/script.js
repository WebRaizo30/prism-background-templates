const defaults = {
  color1: '#cc4444',
  color2: '#313131',
  stripeSizePx: 100,
  durationSec: 2,
  labelText: 'RAIZO',
};

let state = { ...defaults };
if (typeof window !== 'undefined' && window.__PRISM_BOOTSTRAP && typeof window.__PRISM_BOOTSTRAP === 'object') {
  Object.assign(state, window.__PRISM_BOOTSTRAP);
}

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function applyRoot() {
  const root = document.documentElement;
  root.style.setProperty('--color1', state.color1);
  root.style.setProperty('--color2', state.color2);
  root.style.setProperty('--stripe-size', `${clamp(Number(state.stripeSizePx), 20, 240)}px`);
  root.style.setProperty('--duration', `${clamp(Number(state.durationSec), 0.3, 15)}s`);
  const label = document.getElementById('stripe-label');
  if (label) {
    label.textContent = String(state.labelText).slice(0, 48);
  }
}

window.__prismWarningStripe = {
  defaults: { ...defaults },
  getState() {
    return { ...state };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    if (partial.color1 !== undefined && hexRe.test(String(partial.color1))) {
      state.color1 = String(partial.color1);
    }
    if (partial.color2 !== undefined && hexRe.test(String(partial.color2))) {
      state.color2 = String(partial.color2);
    }
    if (partial.stripeSizePx !== undefined) {
      state.stripeSizePx = clamp(Number(partial.stripeSizePx), 20, 240);
    }
    if (partial.durationSec !== undefined) {
      state.durationSec = clamp(Number(partial.durationSec), 0.3, 15);
    }
    if (partial.labelText !== undefined) {
      state.labelText = String(partial.labelText).slice(0, 48);
    }
    applyRoot();
  },
  reset() {
    state = { ...defaults };
    applyRoot();
  },
};

applyRoot();
