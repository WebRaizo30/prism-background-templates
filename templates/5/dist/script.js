function hexToRgbParts(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex).trim());
  if (!m) return [255, 255, 255];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbCss(hex) {
  const [r, g, b] = hexToRgbParts(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

function rgbTuple(hex) {
  return hexToRgbParts(hex).join(', ');
}

const defaults = {
  colorBg1: '#6c00a2',
  colorBg2: '#001152',
  color1: '#1271ff',
  color2: '#dd4aff',
  color3: '#64dcff',
  color4: '#c83232',
  color5: '#b4b432',
  colorInteractive: '#8c64ff',
  circleSizePercent: 80,
  mouseSmooth: 20,
};

let state = { ...defaults };
if (typeof window !== 'undefined' && window.__PRISM_BOOTSTRAP && typeof window.__PRISM_BOOTSTRAP === 'object') {
  Object.assign(state, window.__PRISM_BOOTSTRAP);
}

function applyRoot() {
  const root = document.documentElement;
  root.style.setProperty('--color-bg1', rgbCss(state.colorBg1));
  root.style.setProperty('--color-bg2', rgbCss(state.colorBg2));
  root.style.setProperty('--color1', rgbTuple(state.color1));
  root.style.setProperty('--color2', rgbTuple(state.color2));
  root.style.setProperty('--color3', rgbTuple(state.color3));
  root.style.setProperty('--color4', rgbTuple(state.color4));
  root.style.setProperty('--color5', rgbTuple(state.color5));
  root.style.setProperty('--color-interactive', rgbTuple(state.colorInteractive));
  root.style.setProperty('--circle-size', `${state.circleSizePercent}%`);
}

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

window.__prismBubbles = {
  defaults: { ...defaults },
  getState() {
    return { ...state };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    const keys = [
      'colorBg1',
      'colorBg2',
      'color1',
      'color2',
      'color3',
      'color4',
      'color5',
      'colorInteractive',
    ];
    for (const k of keys) {
      if (partial[k] !== undefined && hexRe.test(String(partial[k]))) {
        state[k] = String(partial[k]);
      }
    }
    if (partial.circleSizePercent !== undefined) {
      state.circleSizePercent = clamp(Number(partial.circleSizePercent), 30, 120);
    }
    if (partial.mouseSmooth !== undefined) {
      state.mouseSmooth = clamp(Number(partial.mouseSmooth), 4, 80);
    }
    applyRoot();
  },
  reset() {
    state = { ...defaults };
    applyRoot();
  },
};

applyRoot();

const interBubble = document.querySelector('.interactive');
let curX = 0;
let curY = 0;
let tgX = 0;
let tgY = 0;

function move() {
  if (!interBubble) return;
  const k = Math.max(1, state.mouseSmooth);
  curX += (tgX - curX) / k;
  curY += (tgY - curY) / k;
  interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
  requestAnimationFrame(move);
}

window.addEventListener('mousemove', (event) => {
  tgX = event.clientX;
  tgY = event.clientY;
});

move();
