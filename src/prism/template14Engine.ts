/**
 * Engine UI for template 14 (Three.js particle teapot + bloom) — drives `window.__prismParticleTeapot` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate14StandaloneHtml } from './exportTemplate14';
import type { PrismParticleTeapotApi, Template14Config } from './template14Types';

export type { PrismParticleTeapotApi, Template14Config } from './template14Types';

function getApi(iframe: HTMLIFrameElement): PrismParticleTeapotApi | null {
  const win = iframe.contentWindow as Window & { __prismParticleTeapot?: PrismParticleTeapotApi };
  return win?.__prismParticleTeapot ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

function formatOut(key: keyof Template14Config, v: number): string {
  if (key === 'cameraFov' || key === 'teapotSize') return String(Math.round(v));
  if (
    key === 'fogDensity' ||
    key === 'rotationSpeed' ||
    key === 'bloomThreshold' ||
    key === 'ambientIntensity'
  ) {
    return Number(v).toFixed(3);
  }
  return Number(v).toFixed(2);
}

export function mountTemplate14Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Particle shape, particle colors, background, ambient, fog, camera, spin, bloom.</p>

    <div class="field">
      <label class="field__label" for="t14-shape">Shape</label>
      <select id="t14-shape" data-key="shapePreset">
        <option value="teapot">Teapot</option>
        <option value="torus">Torus</option>
        <option value="sphere">Sphere</option>
        <option value="knot">Torus knot</option>
        <option value="icosahedron">Icosahedron</option>
      </select>
    </div>
    <div class="field">
      <label class="field__label" for="t14-pca">Particle color A</label>
      <input type="color" id="t14-pca" data-key="particleColorA" value="#00ffff" />
    </div>
    <div class="field">
      <label class="field__label" for="t14-pcb">Particle color B</label>
      <input type="color" id="t14-pcb" data-key="particleColorB" value="#ff0080" />
    </div>

    <div class="field">
      <label class="field__label" for="t14-bgi">Background inner</label>
      <input type="color" id="t14-bgi" data-key="bgColorInner" value="#1a0033" />
    </div>
    <div class="field">
      <label class="field__label" for="t14-bgo">Background outer</label>
      <input type="color" id="t14-bgo" data-key="bgColorOuter" value="#000000" />
    </div>
    <div class="field">
      <label class="field__label" for="t14-amb">Ambient light</label>
      <input type="color" id="t14-amb" data-key="ambientColor" value="#1a0033" />
    </div>

    <div class="field">
      <label class="field__label" for="t14-ambi">Ambient intensity <span class="field__val" data-out="ambientIntensity"></span></label>
      <input type="range" id="t14-ambi" data-key="ambientIntensity" min="0" max="2" step="0.05" />
    </div>
    <div class="field">
      <label class="field__label" for="t14-fog">Fog density <span class="field__val" data-out="fogDensity"></span></label>
      <input type="range" id="t14-fog" data-key="fogDensity" min="0.002" max="0.12" step="0.002" />
    </div>
    <div class="field">
      <label class="field__label" for="t14-fov">Camera FOV <span class="field__val" data-out="cameraFov"></span></label>
      <input type="range" id="t14-fov" data-key="cameraFov" min="40" max="100" step="1" />
    </div>
    <div class="field">
      <label class="field__label" for="t14-z">Camera Z <span class="field__val" data-out="cameraZ"></span></label>
      <input type="range" id="t14-z" data-key="cameraZ" min="4" max="40" step="0.5" />
    </div>
    <div class="field">
      <label class="field__label" for="t14-rot">Rotation speed <span class="field__val" data-out="rotationSpeed"></span></label>
      <input type="range" id="t14-rot" data-key="rotationSpeed" min="0" max="0.05" step="0.0005" />
    </div>
    <div class="field">
      <label class="field__label" for="t14-ps">Particle size <span class="field__val" data-out="particleSize"></span></label>
      <input type="range" id="t14-ps" data-key="particleSize" min="0.005" max="0.15" step="0.005" />
    </div>
    <div class="field">
      <label class="field__label" for="t14-bs">Bloom strength <span class="field__val" data-out="bloomStrength"></span></label>
      <input type="range" id="t14-bs" data-key="bloomStrength" min="0" max="4" step="0.05" />
    </div>
    <div class="field">
      <label class="field__label" for="t14-br">Bloom radius <span class="field__val" data-out="bloomRadius"></span></label>
      <input type="range" id="t14-br" data-key="bloomRadius" min="0" max="2" step="0.02" />
    </div>
    <div class="field">
      <label class="field__label" for="t14-bt">Bloom threshold <span class="field__val" data-out="bloomThreshold"></span></label>
      <input type="range" id="t14-bt" data-key="bloomThreshold" min="0" max="1" step="0.02" />
    </div>
    <div class="field">
      <label class="field__label" for="t14-tea">Shape scale <span class="field__val" data-out="teapotSize"></span></label>
      <input type="range" id="t14-tea" data-key="teapotSize" min="2" max="12" step="0.25" />
    </div>

    <div class="engine__actions">
      <button type="button" class="btn btn--ghost" data-action="reset">Reset to defaults</button>
      <button type="button" class="btn btn--primary" data-action="copy-json">Copy config JSON</button>
      <button type="button" class="btn btn--primary" data-action="download-html">Download .html (standalone)</button>
    </div>
    <p class="engine__ok" data-feedback role="status" aria-live="polite"></p>
  `;

  const feedback = el(host, '[data-feedback]');

  function setFeedback(text: string): void {
    if (feedback) feedback.textContent = text;
  }

  function syncUIFromState(s: Template14Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template14Config;
      if (!key) return;
      input.value = String(s[key]);
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template14Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      if (typeof v === 'number') {
        out.textContent = formatOut(key, v);
      }
    });
  }

  let state: Template14Config = {
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

  let wired = false;

  function wire(): void {
    if (wired) return;
    const api = getApi(iframe);
    if (!api) {
      setFeedback('Preview not ready — wait a moment.');
      return;
    }
    wired = true;
    state = api.getState();
    syncUIFromState(state);

    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const onInput = (): void => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const key = input.dataset.key as keyof Template14Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template14Config>);
        } else if (input instanceof HTMLSelectElement) {
          api2.applyConfig({ [key]: input.value } as Partial<Template14Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template14Config>);
        }
        state = api2.getState();
        syncUIFromState(state);
      };
      input.addEventListener('input', onInput);
      input.addEventListener('change', onInput);
    });

    el(host, '[data-action="reset"]')?.addEventListener('click', () => {
      const api2 = getApi(iframe);
      api2?.reset();
      const api3 = getApi(iframe);
      if (api3) {
        state = api3.getState();
        syncUIFromState(state);
      }
      setFeedback('Defaults restored.');
    });

    el(host, '[data-action="copy-json"]')?.addEventListener('click', async () => {
      const api2 = getApi(iframe);
      if (!api2) return;
      const json = JSON.stringify(api2.getState(), null, 2);
      try {
        await navigator.clipboard.writeText(json);
        setFeedback('Config JSON copied.');
      } catch {
        setFeedback('Clipboard failed — copy manually.');
      }
    });

    el(host, '[data-action="download-html"]')?.addEventListener('click', async () => {
      const api2 = getApi(iframe);
      if (!api2) return;
      try {
        const html = await buildTemplate14StandaloneHtml(api2.getState());
        downloadTextFile('prism-particle-teapot.html', html);
        setFeedback('Standalone HTML downloaded.');
      } catch (err) {
        console.error(err);
        setFeedback('Download failed — see console.');
      }
    });

    setFeedback('');
  }

  function tryWire(attempt: number): void {
    const api = getApi(iframe);
    if (api) {
      wire();
      return;
    }
    if (attempt < 60) {
      setTimeout(() => tryWire(attempt + 1), 50);
    } else {
      setFeedback('Could not reach preview script — reload the page.');
    }
  }

  iframe.addEventListener('load', () => tryWire(0));
  if (iframe.contentDocument?.readyState === 'complete') {
    queueMicrotask(() => tryWire(0));
  }
}
