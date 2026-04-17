import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';

const SHAPE_PRESETS = ['teapot', 'torus', 'sphere', 'knot', 'icosahedron'];

const defaults = {
  bgColorInner: '#1a0033',
  bgColorOuter: '#000000',
  ambientColor: '#1a0033',
  ambientIntensity: 0.8,
  fogDensity: 0.02,
  cameraFov: 75,
  cameraZ: 12,
  rotationSpeed: 0.005,
  particleSize: 0.03,
  bloomStrength: 1.4,
  bloomRadius: 0.8,
  bloomThreshold: 0.1,
  teapotSize: 5,
  shapePreset: 'teapot',
  particleColorA: '#00ffff',
  particleColorB: '#ff0080',
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
  if (typeof b.bgColorInner === 'string' && hexValid(b.bgColorInner)) state.bgColorInner = b.bgColorInner;
  if (typeof b.bgColorOuter === 'string' && hexValid(b.bgColorOuter)) state.bgColorOuter = b.bgColorOuter;
  if (typeof b.ambientColor === 'string' && hexValid(b.ambientColor)) state.ambientColor = b.ambientColor;
  if (typeof b.ambientIntensity === 'number') state.ambientIntensity = clamp(Number(b.ambientIntensity), 0, 2);
  if (typeof b.fogDensity === 'number') state.fogDensity = clamp(Number(b.fogDensity), 0.002, 0.12);
  if (typeof b.cameraFov === 'number') state.cameraFov = clamp(Number(b.cameraFov), 40, 100);
  if (typeof b.cameraZ === 'number') state.cameraZ = clamp(Number(b.cameraZ), 4, 40);
  if (typeof b.rotationSpeed === 'number') state.rotationSpeed = clamp(Number(b.rotationSpeed), 0, 0.05);
  if (typeof b.particleSize === 'number') state.particleSize = clamp(Number(b.particleSize), 0.005, 0.15);
  if (typeof b.bloomStrength === 'number') state.bloomStrength = clamp(Number(b.bloomStrength), 0, 4);
  if (typeof b.bloomRadius === 'number') state.bloomRadius = clamp(Number(b.bloomRadius), 0, 2);
  if (typeof b.bloomThreshold === 'number') state.bloomThreshold = clamp(Number(b.bloomThreshold), 0, 1);
  if (typeof b.teapotSize === 'number') state.teapotSize = clamp(Number(b.teapotSize), 2, 12);
  if (typeof b.shapePreset === 'string' && SHAPE_PRESETS.includes(b.shapePreset)) state.shapePreset = b.shapePreset;
  if (typeof b.particleColorA === 'string' && hexValid(b.particleColorA)) state.particleColorA = b.particleColorA;
  if (typeof b.particleColorB === 'string' && hexValid(b.particleColorB)) state.particleColorB = b.particleColorB;
}

let scene;
let camera;
let renderer;
let composer;
let controls;
let particles;
let pointsMaterial;
let bloomPass;
let ambientLight;
let clock;
let lastParticleKey = null;

function validShapePreset(s) {
  return SHAPE_PRESETS.includes(String(s));
}

function particleRebuildKey() {
  return `${state.shapePreset}|${state.teapotSize}|${state.particleColorA}|${state.particleColorB}`;
}

function hexToColor(hex) {
  return new THREE.Color(hexValid(hex) ? hex : '#ffffff');
}

function applyBackgroundCss() {
  const root = document.documentElement;
  if (hexValid(state.bgColorInner)) root.style.setProperty('--prism-bg-inner', state.bgColorInner);
  if (hexValid(state.bgColorOuter)) root.style.setProperty('--prism-bg-outer', state.bgColorOuter);
}

/** Sync background with Three.js — the canvas is opaque, so the CSS gradient alone is not visible. */
function applySceneBackground() {
  if (!scene || !renderer) return;
  const inner = hexToColor(state.bgColorInner);
  const outer = hexToColor(state.bgColorOuter);
  scene.background = inner.clone();
  if (scene.fog) scene.fog.color.copy(outer);
  renderer.setClearColor(inner, 1);
}

function applySceneState() {
  if (!scene || !camera) return;
  scene.fog.density = state.fogDensity;
  camera.fov = state.cameraFov;
  camera.position.z = state.cameraZ;
  camera.updateProjectionMatrix();
  if (ambientLight) {
    ambientLight.color.copy(hexToColor(state.ambientColor));
    ambientLight.intensity = state.ambientIntensity;
  }
}

function applyBloomState() {
  if (!bloomPass) return;
  bloomPass.strength = state.bloomStrength;
  bloomPass.radius = state.bloomRadius;
  bloomPass.threshold = state.bloomThreshold;
}

function applyParticleMaterialState() {
  if (pointsMaterial) {
    pointsMaterial.size = state.particleSize;
    pointsMaterial.needsUpdate = true;
  }
}

function buildSourceGeometry(kind, size) {
  let geo;
  switch (kind) {
    case 'torus': {
      const R = size * 0.55;
      const r = size * 0.22;
      geo = new THREE.TorusGeometry(R, r, 32, 48);
      break;
    }
    case 'sphere':
      geo = new THREE.SphereGeometry(size, 48, 32);
      break;
    case 'knot': {
      const R = size * 0.55;
      const r = size * 0.16;
      geo = new THREE.TorusKnotGeometry(R, r, 128, 64, 2, 3);
      break;
    }
    case 'icosahedron':
      geo = new THREE.IcosahedronGeometry(size, 2);
      break;
    case 'teapot':
    default:
      geo = new TeapotGeometry(size, 15, true, true, true, true, true);
      break;
  }
  geo.computeBoundingBox();
  const center = new THREE.Vector3();
  geo.boundingBox.getCenter(center);
  geo.translate(-center.x, -center.y, -center.z);
  return geo;
}

function buildParticlePoints(teapotRadius) {
  const geoSource = buildSourceGeometry(state.shapePreset, teapotRadius);
  const positions = geoSource.attributes.position.array;
  geoSource.dispose();

  const count = positions.length / 3;

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const colArr = new Float32Array(count * 3);
  const origCols = [];
  const twinkle = [];
  const sizes = new Float32Array(count);

  const cA = hexToColor(state.particleColorA);
  const cB = hexToColor(state.particleColorB);

  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    const col = new THREE.Color().lerpColors(cA, cB, t);
    col.multiplyScalar(1.3);
    colArr.set([col.r, col.g, col.b], i * 3);
    origCols.push(col.clone());
    twinkle.push(Math.random() < 0.5 ? Math.random() * 6 + 3 : 0);
    sizes[i] = 0.02 + Math.random() * 0.04;
  }

  geom.setAttribute('color', new THREE.Float32BufferAttribute(colArr, 3));
  geom.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: state.particleSize,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const pts = new THREE.Points(geom, mat);
  pts.userData = { origCols, twinkle };
  return pts;
}

function disposeParticles() {
  if (!scene || !particles) return;
  scene.remove(particles);
  particles.geometry.dispose();
  particles.material.dispose();
  particles = null;
  pointsMaterial = null;
}

function syncParticleGeometry() {
  if (!scene) return;
  const key = particleRebuildKey();
  if (key === lastParticleKey && particles) return;
  lastParticleKey = key;
  disposeParticles();
  particles = buildParticlePoints(state.teapotSize);
  pointsMaterial = particles.material;
  scene.add(particles);
}

function applySparkle(sys, t) {
  const colors = sys.geometry.attributes.color;
  const { origCols, twinkle } = sys.userData;
  for (let i = 0; i < colors.count; i++) {
    if (twinkle[i] > 0) {
      const p = Math.pow(Math.abs(Math.sin(twinkle[i] * t + i * 0.1)), 10);
      const b = 1 + 4 * p;
      const oc = origCols[i];
      colors.setXYZ(i, oc.r * b, oc.g * b, oc.b * b);
    }
  }
  colors.needsUpdate = true;
}

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(hexToColor(state.bgColorOuter).getHex(), state.fogDensity);

  camera = new THREE.PerspectiveCamera(state.cameraFov, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, state.cameraZ);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.5;
  controls.minDistance = 3;
  controls.maxDistance = 25;
  controls.target.set(0, 0, 0);
  controls.update();

  ambientLight = new THREE.AmbientLight(hexToColor(state.ambientColor), state.ambientIntensity);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xff66cc, 0.4);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);
  const dirLight2 = new THREE.DirectionalLight(0x00ffff, 0.3);
  dirLight2.position.set(-5, -10, -7.5);
  scene.add(dirLight2);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.6, 0.9);
  bloomPass.threshold = state.bloomThreshold;
  bloomPass.strength = state.bloomStrength;
  bloomPass.radius = state.bloomRadius;
  composer.addPass(bloomPass);
  composer.addPass(new FilmPass(0.5, 0.4, 1024, false));
  const rgbShift = new ShaderPass(RGBShiftShader);
  rgbShift.uniforms.amount.value = 0.003;
  composer.addPass(rgbShift);

  syncParticleGeometry();
  applyBackgroundCss();
  applySceneBackground();
  applySceneState();
  applyParticleMaterialState();

  clock = new THREE.Clock();
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    time += dt;
    if (particles) {
      particles.rotation.y += state.rotationSpeed;
      applySparkle(particles, time);
    }
    controls.update();
    composer.render();
  }

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  });

  animate();
}

window.__prismParticleTeapot = {
  defaults: { ...defaults },
  getState() {
    return { ...state };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    if (partial.bgColorInner !== undefined && hexValid(partial.bgColorInner)) state.bgColorInner = String(partial.bgColorInner);
    if (partial.bgColorOuter !== undefined && hexValid(partial.bgColorOuter)) state.bgColorOuter = String(partial.bgColorOuter);
    if (partial.ambientColor !== undefined && hexValid(partial.ambientColor)) state.ambientColor = String(partial.ambientColor);
    if (partial.ambientIntensity !== undefined) state.ambientIntensity = clamp(Number(partial.ambientIntensity), 0, 2);
    if (partial.fogDensity !== undefined) state.fogDensity = clamp(Number(partial.fogDensity), 0.002, 0.12);
    if (partial.cameraFov !== undefined) state.cameraFov = clamp(Number(partial.cameraFov), 40, 100);
    if (partial.cameraZ !== undefined) state.cameraZ = clamp(Number(partial.cameraZ), 4, 40);
    if (partial.rotationSpeed !== undefined) state.rotationSpeed = clamp(Number(partial.rotationSpeed), 0, 0.05);
    if (partial.particleSize !== undefined) state.particleSize = clamp(Number(partial.particleSize), 0.005, 0.15);
    if (partial.bloomStrength !== undefined) state.bloomStrength = clamp(Number(partial.bloomStrength), 0, 4);
    if (partial.bloomRadius !== undefined) state.bloomRadius = clamp(Number(partial.bloomRadius), 0, 2);
    if (partial.bloomThreshold !== undefined) state.bloomThreshold = clamp(Number(partial.bloomThreshold), 0, 1);
    if (partial.teapotSize !== undefined) state.teapotSize = clamp(Number(partial.teapotSize), 2, 12);
    if (partial.shapePreset !== undefined && validShapePreset(partial.shapePreset)) state.shapePreset = String(partial.shapePreset);
    if (partial.particleColorA !== undefined && hexValid(partial.particleColorA)) state.particleColorA = String(partial.particleColorA);
    if (partial.particleColorB !== undefined && hexValid(partial.particleColorB)) state.particleColorB = String(partial.particleColorB);

    applyBackgroundCss();
    applySceneBackground();
    if (scene && scene.fog) scene.fog.density = state.fogDensity;
    applySceneState();
    applyBloomState();
    applyParticleMaterialState();
    syncParticleGeometry();
  },
  reset() {
    state = { ...defaults };
    lastParticleKey = null;
    applyBackgroundCss();
    applySceneBackground();
    if (scene && scene.fog) scene.fog.density = state.fogDensity;
    applySceneState();
    applyBloomState();
    syncParticleGeometry();
    applyParticleMaterialState();
  },
};

init();
