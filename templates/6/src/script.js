function hexToRgbParts(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex).trim());
  if (!m) return [255, 255, 255];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

const defaults = {
  bgColor: '#171717',
  lineColor: '#ffffff',
  lineOpacity: 0.1,
  dropHighlight: '#ffffff',
  dropDurationSec: 7,
  delayLine1: 2,
  delayLine2: 0,
  delayLine3: 2.5,
  linesWidthPercent: 90,
  lineWidthPx: 1,
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
  const [lr, lg, lb] = hexToRgbParts(state.lineColor);
  const lo = clamp(Number(state.lineOpacity), 0, 1);
  root.style.setProperty('--prism-bg', state.bgColor);
  root.style.setProperty('--line-color', `rgba(${lr}, ${lg}, ${lb}, ${lo})`);
  root.style.setProperty('--drop-highlight', state.dropHighlight);
  root.style.setProperty('--drop-duration', `${clamp(Number(state.dropDurationSec), 1, 30)}s`);
  root.style.setProperty('--delay-line-1', `${clamp(Number(state.delayLine1), 0, 10)}s`);
  root.style.setProperty('--delay-line-2', `${clamp(Number(state.delayLine2), 0, 10)}s`);
  root.style.setProperty('--delay-line-3', `${clamp(Number(state.delayLine3), 0, 10)}s`);
  root.style.setProperty('--lines-width', `${clamp(Number(state.linesWidthPercent), 40, 100)}vw`);
  root.style.setProperty('--line-width', `${clamp(Number(state.lineWidthPx), 1, 8)}px`);
}

window.__prismCssLines = {
  defaults: { ...defaults },
  getState() {
    return { ...state };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    if (partial.bgColor !== undefined && hexRe.test(String(partial.bgColor))) {
      state.bgColor = String(partial.bgColor);
    }
    if (partial.lineColor !== undefined && hexRe.test(String(partial.lineColor))) {
      state.lineColor = String(partial.lineColor);
    }
    if (partial.dropHighlight !== undefined && hexRe.test(String(partial.dropHighlight))) {
      state.dropHighlight = String(partial.dropHighlight);
    }
    if (partial.lineOpacity !== undefined) {
      state.lineOpacity = clamp(Number(partial.lineOpacity), 0, 1);
    }
    if (partial.dropDurationSec !== undefined) {
      state.dropDurationSec = clamp(Number(partial.dropDurationSec), 1, 30);
    }
    if (partial.delayLine1 !== undefined) {
      state.delayLine1 = Number(partial.delayLine1);
    }
    if (partial.delayLine2 !== undefined) {
      state.delayLine2 = Number(partial.delayLine2);
    }
    if (partial.delayLine3 !== undefined) {
      state.delayLine3 = Number(partial.delayLine3);
    }
    if (partial.linesWidthPercent !== undefined) {
      state.linesWidthPercent = clamp(Number(partial.linesWidthPercent), 40, 100);
    }
    if (partial.lineWidthPx !== undefined) {
      state.lineWidthPx = clamp(Number(partial.lineWidthPx), 1, 8);
    }
    applyRoot();
  },
  reset() {
    state = { ...defaults };
    applyRoot();
  },
};

applyRoot();
