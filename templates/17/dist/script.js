const defaults = {
  stripeColor: '#ffffff',
  stripeColorAlt: '#000000',
  animDurationSec: 60,
  heroBlurPx: 10,
  iconBlinkSec: 2,
  switchOn: false,
  titleText: 'RAIZO',
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
  if (typeof b.stripeColor === 'string' && hexValid(b.stripeColor)) state.stripeColor = b.stripeColor;
  if (typeof b.stripeColorAlt === 'string' && hexValid(b.stripeColorAlt)) state.stripeColorAlt = b.stripeColorAlt;
  if (typeof b.animDurationSec === 'number') state.animDurationSec = clamp(Number(b.animDurationSec), 2, 300);
  if (typeof b.heroBlurPx === 'number') state.heroBlurPx = clamp(Number(b.heroBlurPx), 0, 40);
  if (typeof b.iconBlinkSec === 'number') state.iconBlinkSec = clamp(Number(b.iconBlinkSec), 0.2, 10);
  if (typeof b.switchOn === 'boolean') state.switchOn = b.switchOn;
  if (typeof b.titleText === 'string' && b.titleText.length > 0 && b.titleText.length < 200) state.titleText = b.titleText;
}

function applySwitchClass() {
  const wrap = document.getElementById('rays-wrapper');
  if (wrap) wrap.classList.toggle('rays-switch-on', state.switchOn);
  const cb = document.getElementById('switch');
  if (cb && cb instanceof HTMLInputElement) cb.checked = state.switchOn;
}

function applyTitle() {
  const h = document.getElementById('rays-title');
  if (h) {
    const t = state.titleText;
    h.textContent = t;
    h.setAttribute('data-text', t);
  }
}

function applyToDom() {
  const root = document.documentElement;
  if (hexValid(state.stripeColor)) root.style.setProperty('--prism-stripe', state.stripeColor);
  if (hexValid(state.stripeColorAlt)) root.style.setProperty('--prism-stripe-alt', state.stripeColorAlt);
  root.style.setProperty('--prism-bg-anim', `${state.animDurationSec}s`);
  root.style.setProperty('--prism-hero-blur', `${state.heroBlurPx}px`);
  root.style.setProperty('--prism-icon-blink', `${state.iconBlinkSec}s`);
  applySwitchClass();
  applyTitle();
}

function wireSwitch() {
  const cb = document.getElementById('switch');
  if (!cb || !(cb instanceof HTMLInputElement)) return;
  cb.addEventListener('change', () => {
    state.switchOn = cb.checked;
    applySwitchClass();
  });
}

window.__prismRaysBg = {
  defaults: { ...defaults },
  getState() {
    return { ...state };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    if (partial.stripeColor !== undefined && hexValid(partial.stripeColor)) state.stripeColor = String(partial.stripeColor);
    if (partial.stripeColorAlt !== undefined && hexValid(partial.stripeColorAlt)) state.stripeColorAlt = String(partial.stripeColorAlt);
    if (partial.animDurationSec !== undefined) state.animDurationSec = clamp(Number(partial.animDurationSec), 2, 300);
    if (partial.heroBlurPx !== undefined) state.heroBlurPx = clamp(Number(partial.heroBlurPx), 0, 40);
    if (partial.iconBlinkSec !== undefined) state.iconBlinkSec = clamp(Number(partial.iconBlinkSec), 0.2, 10);
    if (partial.switchOn !== undefined) state.switchOn = Boolean(partial.switchOn);
    if (partial.titleText !== undefined && typeof partial.titleText === 'string') {
      const t = String(partial.titleText).trim();
      if (t.length > 0 && t.length < 200) state.titleText = t;
    }
    applyToDom();
  },
  reset() {
    state = { ...defaults };
    applyToDom();
  },
};

applyToDom();
wireSwitch();
