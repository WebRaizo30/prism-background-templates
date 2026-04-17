const defaults = {
  labelText: 'RAIZO',
  textColor: '#999999',
  durationSec: 0.92,
  tileSizePx: 50,
  labelSizeRem: 8,
  bodyMarginTopRem: 13.5,
};

let state = {
  labelText: defaults.labelText,
  textColor: defaults.textColor,
  durationSec: defaults.durationSec,
  tileSizePx: defaults.tileSizePx,
  labelSizeRem: defaults.labelSizeRem,
  bodyMarginTopRem: defaults.bodyMarginTopRem,
};

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function hexValid(h) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(h));
}

if (typeof window !== 'undefined' && window.__PRISM_BOOTSTRAP && typeof window.__PRISM_BOOTSTRAP === 'object') {
  const b = window.__PRISM_BOOTSTRAP;
  if (typeof b.labelText === 'string') state.labelText = b.labelText.slice(0, 48);
  if (typeof b.textColor === 'string' && hexValid(b.textColor)) state.textColor = b.textColor;
  if (typeof b.durationSec === 'number') state.durationSec = clamp(Number(b.durationSec), 0.1, 10);
  if (typeof b.tileSizePx === 'number') state.tileSizePx = clamp(Math.round(Number(b.tileSizePx)), 10, 200);
  if (typeof b.labelSizeRem === 'number') state.labelSizeRem = clamp(Number(b.labelSizeRem), 2, 16);
  if (typeof b.bodyMarginTopRem === 'number') state.bodyMarginTopRem = clamp(Number(b.bodyMarginTopRem), 0, 30);
}

function applyToDom() {
  const root = document.documentElement;
  root.style.setProperty('--prism-text-color', state.textColor);
  root.style.setProperty('--prism-duration', `${state.durationSec}s`);
  root.style.setProperty('--prism-tile', `${state.tileSizePx}px`);
  root.style.setProperty('--prism-label-size', `${state.labelSizeRem}rem`);
  root.style.setProperty('--prism-body-margin-top', `${state.bodyMarginTopRem}rem`);
  const el = document.getElementById('infinity-label');
  if (el) el.textContent = state.labelText;
}

applyToDom();

window.__prismInfinityBg = {
  defaults: {
    labelText: defaults.labelText,
    textColor: defaults.textColor,
    durationSec: defaults.durationSec,
    tileSizePx: defaults.tileSizePx,
    labelSizeRem: defaults.labelSizeRem,
    bodyMarginTopRem: defaults.bodyMarginTopRem,
  },
  getState() {
    return {
      labelText: state.labelText,
      textColor: state.textColor,
      durationSec: state.durationSec,
      tileSizePx: state.tileSizePx,
      labelSizeRem: state.labelSizeRem,
      bodyMarginTopRem: state.bodyMarginTopRem,
    };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    if (partial.labelText !== undefined) {
      state.labelText = String(partial.labelText).slice(0, 48);
    }
    if (partial.textColor !== undefined && hexValid(partial.textColor)) {
      state.textColor = String(partial.textColor);
    }
    if (partial.durationSec !== undefined) {
      state.durationSec = clamp(Number(partial.durationSec), 0.1, 10);
    }
    if (partial.tileSizePx !== undefined) {
      state.tileSizePx = clamp(Math.round(Number(partial.tileSizePx)), 10, 200);
    }
    if (partial.labelSizeRem !== undefined) {
      state.labelSizeRem = clamp(Number(partial.labelSizeRem), 2, 16);
    }
    if (partial.bodyMarginTopRem !== undefined) {
      state.bodyMarginTopRem = clamp(Number(partial.bodyMarginTopRem), 0, 30);
    }
    applyToDom();
  },
  reset() {
    state = {
      labelText: defaults.labelText,
      textColor: defaults.textColor,
      durationSec: defaults.durationSec,
      tileSizePx: defaults.tileSizePx,
      labelSizeRem: defaults.labelSizeRem,
      bodyMarginTopRem: defaults.bodyMarginTopRem,
    };
    applyToDom();
  },
};
