/** Beesandbombs/davidope inspired torus — Prism API for Engine + export. */
const STRIPE_TEXTURE_URL =
  'https://res.cloudinary.com/dspq4okwt/image/upload/v1496611611/stripe_359fc47827b0fe1149670218060be91a_k2d6kd.png';

const defaults = {
  clearColor: '#000000',
  torusColor: '#ffffff',
  fov: 75,
  cameraZ: 13,
  rotationSpeed: 0.003375,
  torusMajorRadius: 10,
  tubeRadius: 7,
  radialSegments: 60,
  tubularSegments: 100,
  textureRepeat: 25,
};

let state = {
  clearColor: defaults.clearColor,
  torusColor: defaults.torusColor,
  fov: defaults.fov,
  cameraZ: defaults.cameraZ,
  rotationSpeed: defaults.rotationSpeed,
  torusMajorRadius: defaults.torusMajorRadius,
  tubeRadius: defaults.tubeRadius,
  radialSegments: defaults.radialSegments,
  tubularSegments: defaults.tubularSegments,
  textureRepeat: defaults.textureRepeat,
};

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function hexValid(h) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(h));
}

function hexToColorInt(hex) {
  if (!hexValid(hex)) return 0xffffff;
  const n = parseInt(String(hex).replace(/^#/, ''), 16);
  return Number.isNaN(n) ? 0xffffff : n;
}

if (typeof window !== 'undefined' && window.__PRISM_BOOTSTRAP && typeof window.__PRISM_BOOTSTRAP === 'object') {
  const b = window.__PRISM_BOOTSTRAP;
  if (typeof b.clearColor === 'string' && hexValid(b.clearColor)) state.clearColor = b.clearColor;
  if (typeof b.torusColor === 'string' && hexValid(b.torusColor)) state.torusColor = b.torusColor;
  if (typeof b.fov === 'number') state.fov = clamp(Number(b.fov), 30, 120);
  if (typeof b.cameraZ === 'number') state.cameraZ = clamp(Number(b.cameraZ), 5, 50);
  if (typeof b.rotationSpeed === 'number') state.rotationSpeed = clamp(Number(b.rotationSpeed), 0.0001, 0.02);
  if (typeof b.torusMajorRadius === 'number') state.torusMajorRadius = clamp(Number(b.torusMajorRadius), 3, 40);
  if (typeof b.tubeRadius === 'number') state.tubeRadius = clamp(Number(b.tubeRadius), 1, 20);
  if (typeof b.radialSegments === 'number') state.radialSegments = clamp(Math.round(Number(b.radialSegments)), 8, 128);
  if (typeof b.tubularSegments === 'number') state.tubularSegments = clamp(Math.round(Number(b.tubularSegments)), 8, 200);
  if (typeof b.textureRepeat === 'number') state.textureRepeat = clamp(Number(b.textureRepeat), 1, 80);
}

let scene;
let camera;
let renderer;
let mesh;
let texture;
let textureLoaded = false;
let lastGeomKey = '';
let loopStarted = false;

function initThree() {
  const THREE = window.THREE;
  if (!THREE) {
    console.error('THREE.js not loaded');
    return;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(state.fov, window.innerWidth / window.innerHeight, 0.1, 50);
  camera.position.z = state.cameraZ;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const cc = hexValid(state.clearColor) ? parseInt(state.clearColor.replace(/^#/, ''), 16) : 0x000000;
  renderer.setClearColor(Number.isNaN(cc) ? 0x000000 : cc, 1);
  document.body.appendChild(renderer.domElement);

  const lights = [];
  lights[0] = new THREE.PointLight(0xffffff, 1.25, 0, 100);
  lights[1] = new THREE.PointLight(0xffffff, 1.5, 0, 100);
  lights[2] = new THREE.PointLight(0xffffff, 1.35, 0, 100);
  lights[0].position.set(0, 0, 0);
  lights[1].position.set(0, 0, 300);
  lights[2].position.set(-100, -200, -100);
  scene.add(lights[0], lights[1], lights[2]);

  window.addEventListener(
    'resize',
    function onResize() {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false,
  );

  const loader = new THREE.TextureLoader();
  loader.crossOrigin = '';
  loader.load(STRIPE_TEXTURE_URL, function onTex(tex) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(state.textureRepeat, state.textureRepeat);
    texture = tex;
    textureLoaded = true;
    syncMeshGeometry();
    applyToDom();
    startLoop();
  });
}

function syncMeshGeometry() {
  const THREE = window.THREE;
  if (!THREE || !scene || !textureLoaded || !texture) return;

  const k = `${state.torusMajorRadius}|${state.tubeRadius}|${state.radialSegments}|${state.tubularSegments}`;
  if (mesh && k === lastGeomKey) return;
  lastGeomKey = k;

  if (mesh) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    mesh = null;
  }

  mesh = new THREE.Mesh(
    new THREE.TorusGeometry(state.torusMajorRadius, state.tubeRadius, state.radialSegments, state.tubularSegments),
    new THREE.MeshPhongMaterial({
      color: hexToColorInt(state.torusColor),
      map: texture,
      side: THREE.DoubleSide,
    }),
  );
  mesh.rotation.x = Math.PI / 2;
  scene.add(mesh);
}

function applyToDom() {
  if (!renderer || !camera) return;

  if (hexValid(state.clearColor)) {
    const c = parseInt(state.clearColor.replace(/^#/, ''), 16);
    renderer.setClearColor(Number.isNaN(c) ? 0x000000 : c, 1);
  }
  camera.fov = state.fov;
  camera.updateProjectionMatrix();
  camera.position.z = state.cameraZ;

  if (texture && textureLoaded) {
    texture.repeat.set(state.textureRepeat, state.textureRepeat);
    texture.needsUpdate = true;
  }

  if (mesh && mesh.material) {
    mesh.material.color.setHex(hexToColorInt(state.torusColor));
  }
}

function startLoop() {
  if (loopStarted || !renderer || !scene || !camera) return;
  loopStarted = true;

  function tick() {
    requestAnimationFrame(tick);
    if (mesh) mesh.rotation.z += state.rotationSpeed;
    renderer.render(scene, camera);
  }
  tick();
}

window.__prismBeesThree = {
  defaults: {
    clearColor: defaults.clearColor,
    torusColor: defaults.torusColor,
    fov: defaults.fov,
    cameraZ: defaults.cameraZ,
    rotationSpeed: defaults.rotationSpeed,
    torusMajorRadius: defaults.torusMajorRadius,
    tubeRadius: defaults.tubeRadius,
    radialSegments: defaults.radialSegments,
    tubularSegments: defaults.tubularSegments,
    textureRepeat: defaults.textureRepeat,
  },
  getState() {
    return {
      clearColor: state.clearColor,
      torusColor: state.torusColor,
      fov: state.fov,
      cameraZ: state.cameraZ,
      rotationSpeed: state.rotationSpeed,
      torusMajorRadius: state.torusMajorRadius,
      tubeRadius: state.tubeRadius,
      radialSegments: state.radialSegments,
      tubularSegments: state.tubularSegments,
      textureRepeat: state.textureRepeat,
    };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    if (partial.clearColor !== undefined && hexValid(partial.clearColor)) state.clearColor = String(partial.clearColor);
    if (partial.torusColor !== undefined && hexValid(partial.torusColor)) state.torusColor = String(partial.torusColor);
    if (partial.fov !== undefined) state.fov = clamp(Number(partial.fov), 30, 120);
    if (partial.cameraZ !== undefined) state.cameraZ = clamp(Number(partial.cameraZ), 5, 50);
    if (partial.rotationSpeed !== undefined) state.rotationSpeed = clamp(Number(partial.rotationSpeed), 0.0001, 0.02);
    if (partial.torusMajorRadius !== undefined) state.torusMajorRadius = clamp(Number(partial.torusMajorRadius), 3, 40);
    if (partial.tubeRadius !== undefined) state.tubeRadius = clamp(Number(partial.tubeRadius), 1, 20);
    if (partial.radialSegments !== undefined) state.radialSegments = clamp(Math.round(Number(partial.radialSegments)), 8, 128);
    if (partial.tubularSegments !== undefined)
      state.tubularSegments = clamp(Math.round(Number(partial.tubularSegments)), 8, 200);
    if (partial.textureRepeat !== undefined) state.textureRepeat = clamp(Number(partial.textureRepeat), 1, 80);
    syncMeshGeometry();
    applyToDom();
  },
  reset() {
    state = {
      clearColor: defaults.clearColor,
      torusColor: defaults.torusColor,
      fov: defaults.fov,
      cameraZ: defaults.cameraZ,
      rotationSpeed: defaults.rotationSpeed,
      torusMajorRadius: defaults.torusMajorRadius,
      tubeRadius: defaults.tubeRadius,
      radialSegments: defaults.radialSegments,
      tubularSegments: defaults.tubularSegments,
      textureRepeat: defaults.textureRepeat,
    };
    lastGeomKey = '';
    syncMeshGeometry();
    applyToDom();
  },
};

initThree();
