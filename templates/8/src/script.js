const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_XLINK = 'http://www.w3.org/1999/xlink';

const defaults = {
  colors: ['#e03776', '#8f3e98', '#4687bf', '#3bab6f', '#f9c25e', '#f47274'],
  step: 0.01,
  maxScale: 18,
};

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function hexValid(h) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(h));
}

let state = {
  colors: [...defaults.colors],
  step: defaults.step,
  maxScale: defaults.maxScale,
};

if (typeof window !== 'undefined' && window.__PRISM_BOOTSTRAP && typeof window.__PRISM_BOOTSTRAP === 'object') {
  const b = window.__PRISM_BOOTSTRAP;
  if (Array.isArray(b.colors) && b.colors.length === 6) {
    state.colors = b.colors.map(String).slice(0, 6).map((c, i) => (hexValid(c) ? c : defaults.colors[i]));
  }
  if (typeof b.step === 'number') state.step = clamp(Number(b.step), 0.002, 0.08);
  if (typeof b.maxScale === 'number') state.maxScale = clamp(Number(b.maxScale), 8, 40);
}

const heartsEl = document.getElementById('hearts');
const heartsRy = [];

function useTheHeart(initialN) {
  const use = document.createElementNS(SVG_NS, 'use');
  use._scale = initialN;
  use._idx = initialN;
  use.setAttributeNS(SVG_XLINK, 'xlink:href', '#heart');
  use.setAttributeNS(null, 'transform', `scale(${use._scale})`);
  use.setAttributeNS(null, 'fill', state.colors[use._idx % state.colors.length]);
  use.setAttributeNS(null, 'x', -69);
  use.setAttributeNS(null, 'y', -69);
  use.setAttributeNS(null, 'width', 138);
  use.setAttributeNS(null, 'height', 138);
  heartsRy.push(use);
  heartsEl.appendChild(use);
}

for (let n = 18; n >= 0; n--) {
  useTheHeart(n);
}

function syncFillsFromState() {
  for (let i = 0; i < heartsRy.length; i++) {
    const use = heartsRy[i];
    use.setAttributeNS(null, 'fill', state.colors[use._idx % state.colors.length]);
  }
}

function frame() {
  window.requestAnimationFrame(frame);
  const maxS = state.maxScale;
  const st = state.step;
  for (let i = 0; i < heartsRy.length; i++) {
    const u = heartsRy[i];
    if (u._scale < maxS) {
      u._scale += st;
    } else {
      u._scale = 0;
      heartsEl.appendChild(u);
    }
    u.setAttributeNS(null, 'transform', `scale(${u._scale})`);
    u.setAttributeNS(null, 'fill', state.colors[u._idx % state.colors.length]);
  }
}

window.__prismHearts = {
  defaults: {
    colors: [...defaults.colors],
    step: defaults.step,
    maxScale: defaults.maxScale,
  },
  getState() {
    return {
      colors: [...state.colors],
      step: state.step,
      maxScale: state.maxScale,
    };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    if (partial.colors !== undefined && Array.isArray(partial.colors)) {
      const next = partial.colors.map(String).slice(0, 6);
      while (next.length < 6) next.push('#ffffff');
      state.colors = next.map((c, i) => (hexValid(c) ? c : state.colors[i] || defaults.colors[i]));
    }
    if (partial.step !== undefined) {
      state.step = clamp(Number(partial.step), 0.002, 0.08);
    }
    if (partial.maxScale !== undefined) {
      state.maxScale = clamp(Number(partial.maxScale), 8, 40);
    }
    syncFillsFromState();
  },
  reset() {
    state = {
      colors: [...defaults.colors],
      step: defaults.step,
      maxScale: defaults.maxScale,
    };
    syncFillsFromState();
  },
};

frame();
