const defaults = {
  gradientStop0: '#1742ff',
  gradientStop1: '#22dd8a',
  bgRadialInner: '#0a3cca',
  bgRadialOuter: '#042e52',
  timeScale: 1,
};

let state = {
  gradientStop0: defaults.gradientStop0,
  gradientStop1: defaults.gradientStop1,
  bgRadialInner: defaults.bgRadialInner,
  bgRadialOuter: defaults.bgRadialOuter,
  timeScale: defaults.timeScale,
};

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function hexValid(h) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(h));
}

if (typeof window !== 'undefined' && window.__PRISM_BOOTSTRAP && typeof window.__PRISM_BOOTSTRAP === 'object') {
  const b = window.__PRISM_BOOTSTRAP;
  if (typeof b.gradientStop0 === 'string' && hexValid(b.gradientStop0)) state.gradientStop0 = b.gradientStop0;
  if (typeof b.gradientStop1 === 'string' && hexValid(b.gradientStop1)) state.gradientStop1 = b.gradientStop1;
  if (typeof b.bgRadialInner === 'string' && hexValid(b.bgRadialInner)) state.bgRadialInner = b.bgRadialInner;
  if (typeof b.bgRadialOuter === 'string' && hexValid(b.bgRadialOuter)) state.bgRadialOuter = b.bgRadialOuter;
  if (typeof b.timeScale === 'number') state.timeScale = clamp(Number(b.timeScale), 0.25, 3);
}

function applyGradientAndBg() {
  const root = document.documentElement;
  root.style.setProperty('--prism-bg-radial-inner', state.bgRadialInner);
  root.style.setProperty('--prism-bg-radial-outer', state.bgRadialOuter);
  const s0 = document.getElementById('prism-gradient-stop-0');
  const s1 = document.getElementById('prism-gradient-stop-1');
  if (s0) s0.setAttribute('stop-color', state.gradientStop0);
  if (s1) s1.setAttribute('stop-color', state.gradientStop1);
}

function applyTimeScale() {
  if (typeof gsap !== 'undefined') {
    gsap.globalTimeline.timeScale(state.timeScale);
  }
}

applyGradientAndBg();

function getState() {
  return {
    gradientStop0: state.gradientStop0,
    gradientStop1: state.gradientStop1,
    bgRadialInner: state.bgRadialInner,
    bgRadialOuter: state.bgRadialOuter,
    timeScale: state.timeScale,
  };
}

function applyConfig(partial) {
  if (!partial || typeof partial !== 'object') return;
  if (partial.gradientStop0 !== undefined && hexValid(partial.gradientStop0)) {
    state.gradientStop0 = String(partial.gradientStop0);
  }
  if (partial.gradientStop1 !== undefined && hexValid(partial.gradientStop1)) {
    state.gradientStop1 = String(partial.gradientStop1);
  }
  if (partial.bgRadialInner !== undefined && hexValid(partial.bgRadialInner)) {
    state.bgRadialInner = String(partial.bgRadialInner);
  }
  if (partial.bgRadialOuter !== undefined && hexValid(partial.bgRadialOuter)) {
    state.bgRadialOuter = String(partial.bgRadialOuter);
  }
  if (partial.timeScale !== undefined) {
    state.timeScale = clamp(Number(partial.timeScale), 0.25, 3);
  }
  applyGradientAndBg();
  applyTimeScale();
}

function reset() {
  state = {
    gradientStop0: defaults.gradientStop0,
    gradientStop1: defaults.gradientStop1,
    bgRadialInner: defaults.bgRadialInner,
    bgRadialOuter: defaults.bgRadialOuter,
    timeScale: defaults.timeScale,
  };
  applyGradientAndBg();
  applyTimeScale();
}

window.__prismWaveLines = {
  defaults: {
    gradientStop0: defaults.gradientStop0,
    gradientStop1: defaults.gradientStop1,
    bgRadialInner: defaults.bgRadialInner,
    bgRadialOuter: defaults.bgRadialOuter,
    timeScale: defaults.timeScale,
  },
  getState,
  applyConfig,
  reset,
};

function Line($el) {
  const $paths = $el.querySelectorAll('.path');
  const tl = gsap.timeline();
  const duration = gsap.utils.random(40, 80);
  const y = gsap.utils.random(-250, 250);
  const rotate = gsap.utils.random(-20, 20);
  const scaleXFrom = gsap.utils.random(2, 2.5);
  const scaleXTo = gsap.utils.random(1.5, 1.75);
  const scaleYFrom = gsap.utils.random(1.5, 2);
  const scaleYTo = gsap.utils.random(0.6, 0.7);
  const opacityFrom = gsap.utils.random(0.75, 0.8);
  const opacityTo = gsap.utils.random(0.85, 1);
  const ease = gsap.utils.random(['power2.inOut', 'power3.inOut', 'power4.inOut', 'sine.inOut']);
  tl.to($paths, {
    xPercent: -100,
    duration: duration,
    ease: 'none',
    repeat: -1,
  });

  tl.fromTo(
    $el,
    {
      y,
      opacity: opacityFrom,
      rotate,
      scaleY: scaleYFrom,
      scaleX: scaleXFrom,
      transformOrigin: '50% 50%',
    },
    {
      y: y * -1,
      opacity: opacityTo,
      rotate: rotate * -1,
      scaleY: scaleYTo,
      scaleX: scaleXTo,
      repeat: -1,
      yoyo: true,
      yoyoEase: ease,
      duration: duration * 0.25,
      ease: ease,
      transformOrigin: '50% 50%',
    },
    0,
  );

  tl.seek(gsap.utils.random(10, 20));
}

function initGsapAnimations() {
  if (typeof gsap === 'undefined') {
    return;
  }
  try {
    gsap.utils.toArray('.g').forEach(($el) => Line($el));
    applyTimeScale();
    gsap.to('svg', { opacity: 1, duration: 1 });
  } catch (e) {
    console.error(e);
  }
}

initGsapAnimations();
