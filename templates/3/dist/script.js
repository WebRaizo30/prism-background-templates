// Licence CC BY-NC-SA 4.0 — Attribution required; NonCommercial (original pen / component terms).
import AttractionCursor from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.26/build/cursors/attraction1.min.js';

function hexToInt(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex).trim());
  if (!m) return 0xffffff;
  return parseInt(m[1] + m[2] + m[3], 16);
}

const defaults = {
  attractionIntensity: 0.75,
  size: 1.5,
  maxVelocity: 0.5,
  light1: '#ffaa80',
  light2: '#607fff',
};

let state = { ...defaults };
if (typeof window !== 'undefined' && window.__PRISM_BOOTSTRAP && typeof window.__PRISM_BOOTSTRAP === 'object') {
  Object.assign(state, window.__PRISM_BOOTSTRAP);
}

const ctx = AttractionCursor(document.getElementById('canvas'), {
  particles: {
    attractionIntensity: state.attractionIntensity,
    size: state.size,
    maxVelocity: state.maxVelocity,
  },
});

function pushToApp() {
  if (!ctx?.particles) return;
  const p = ctx.particles;
  p.light1.color.set(hexToInt(state.light1));
  p.light2.color.set(hexToInt(state.light2));
  const u = p.compute?.uniforms;
  if (u?.attractionIntensity?.value !== undefined) {
    u.attractionIntensity.value = state.attractionIntensity;
  }
  if (u?.maxVelocity?.value !== undefined) {
    u.maxVelocity.value = state.maxVelocity;
  }
  if (p.uniforms?.size?.value !== undefined) {
    p.uniforms.size.value = state.size;
  }
}

pushToApp();

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

window.__prismSparklingBoxes = {
  defaults: { ...defaults },
  getState() {
    return { ...state };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    if (partial.attractionIntensity !== undefined) {
      state.attractionIntensity = clamp(Number(partial.attractionIntensity), 0.05, 3);
    }
    if (partial.size !== undefined) {
      state.size = clamp(Number(partial.size), 0.25, 6);
    }
    if (partial.maxVelocity !== undefined) {
      state.maxVelocity = clamp(Number(partial.maxVelocity), 0.05, 2);
    }
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    if (partial.light1 !== undefined && hexRe.test(String(partial.light1))) {
      state.light1 = String(partial.light1);
    }
    if (partial.light2 !== undefined && hexRe.test(String(partial.light2))) {
      state.light2 = String(partial.light2);
    }
    pushToApp();
  },
  reset() {
    state = { ...defaults };
    pushToApp();
  },
  randomizeColors() {
    state.light1 = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    state.light2 = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    pushToApp();
  },
};
