const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
if (!gl) {
  console.error('WebGL 2 not supported');
  document.body.innerHTML = 'WebGL 2 is not supported in your browser.';
}

function hexToRgb01(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex).trim());
  if (!m) return [1, 1, 1];
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
}

const defaults = {
  timeScale: 1,
  paused: false,
  tint: '#ffffff',
};

let state = { ...defaults };
if (typeof window !== 'undefined' && window.__PRISM_BOOTSTRAP && typeof window.__PRISM_BOOTSTRAP === 'object') {
  Object.assign(state, window.__PRISM_BOOTSTRAP);
}

const vertexShaderSource = `#version 300 es
in vec4 aPosition;
void main() {
    gl_Position = aPosition;
}`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;
uniform vec3 uTint;
out vec4 fragColor;

/*--- BEGIN OF SHADERTOY ---*/

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    vec3 r = vec3(uv, 1.0);
    vec4 o = vec4(0.0);
    float t = 4.0 * iTime;
    vec3 p;

    for (float i = 0.0, z = 0.0, d; i < 60.0; i++) {
        p = z * normalize(vec3(uv, 0.95));
        p.z += t;

        float len = length(p.xy);
        float swirl = 0.1 * sin(len * 1.0 - t * 0.5);
        mat2 rot = mat2(cos(swirl), -sin(swirl),
                        sin(swirl),  cos(swirl));
        p.xy *= rot;

        vec4 angle = vec4(0.0, 33.0, 11.0, 0.0);
        vec4 a = z * 0.3 + t * 0.2 - angle;
        p.xy *= mat2(cos(a.x), -sin(a.x), sin(a.x), cos(a.x));
        z += d = length(cos(p + cos(p.yzx + p.z - t * 0.2)).xy) / 5.0;
        o += (sin(p.x + t + vec4(0.0, 2.0, 3.0, 0.0)) + 0.8) / d;
	  }

    o = 3.0 * tanh(o / 6000.0);
    fragColor = vec4(o.rgb, 1.0);
}

/*--- END OF SHADERTOY ---*/

void main() {
    mainImage(fragColor, gl_FragCoord.xy);
    fragColor.rgb *= uTint;
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

let program = null;
let resolutionUniformLocation = null;
let timeUniformLocation = null;
let mouseUniformLocation = null;
let tintUniformLocation = null;
let positionBuffer = null;

if (gl) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  program = createProgram(gl, vertexShader, fragmentShader);

  const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');
  resolutionUniformLocation = gl.getUniformLocation(program, 'iResolution');
  timeUniformLocation = gl.getUniformLocation(program, 'iTime');
  mouseUniformLocation = gl.getUniformLocation(program, 'iMouse');
  tintUniformLocation = gl.getUniformLocation(program, 'uTint');

  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
}

let mouseX = 0;
let mouseY = 0;
canvas.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = canvas.height - e.clientY;
});

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function pushUniforms() {
  if (!gl || !program) return;
  const c = hexToRgb01(state.tint);
  gl.uniform3f(tintUniformLocation, c[0], c[1], c[2]);
}

let accumulatedTime = 0;
let lastFrame = performance.now();

function render(now) {
  if (!gl || !program) return;
  const dt = (now - lastFrame) * 0.001;
  lastFrame = now;
  if (!state.paused) {
    accumulatedTime += dt * state.timeScale;
  }

  gl.uniform3f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height, 1.0);
  gl.uniform1f(timeUniformLocation, accumulatedTime);
  gl.uniform4f(mouseUniformLocation, mouseX, mouseY, 0.0, 0.0);
  pushUniforms();

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
}

if (gl) {
  pushUniforms();
  requestAnimationFrame(render);
}

window.__prismNeonStrings = {
  defaults: { ...defaults },
  getState() {
    return { ...state };
  },
  applyConfig(partial) {
    if (!partial || typeof partial !== 'object') return;
    if (partial.timeScale !== undefined) {
      state.timeScale = clamp(Number(partial.timeScale), 0.05, 5);
    }
    if (partial.paused !== undefined) {
      state.paused = Boolean(partial.paused);
    }
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    if (partial.tint !== undefined && hexRe.test(String(partial.tint))) {
      state.tint = String(partial.tint);
    }
    pushUniforms();
  },
  reset() {
    state = { ...defaults };
    accumulatedTime = 0;
    lastFrame = performance.now();
    pushUniforms();
  },
};
