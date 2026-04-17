/**
 * Engine UI for template 13 (Three.js torus) — drives `window.__prismBeesThree` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate13StandaloneHtml } from './exportTemplate13';
import type { PrismBeesThreeApi, Template13Config } from './template13Types';

export type { PrismBeesThreeApi, Template13Config } from './template13Types';

function getApi(iframe: HTMLIFrameElement): PrismBeesThreeApi | null {
  const win = iframe.contentWindow as Window & { __prismBeesThree?: PrismBeesThreeApi };
  return win?.__prismBeesThree ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

function formatOut(key: keyof Template13Config, v: number): string {
  if (key === 'radialSegments' || key === 'tubularSegments' || key === 'fov') return String(Math.round(v));
  if (key === 'rotationSpeed') return Number(v).toFixed(4);
  if (key === 'textureRepeat' || key === 'cameraZ' || key === 'torusMajorRadius' || key === 'tubeRadius') {
    return Number(v).toFixed(1);
  }
  return Number(v).toFixed(1);
}

export function mountTemplate13Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Three.js striped torus — background (clear), torus tint, camera, rotation, geometry, and texture repeat.</p>

    <div class="field">
      <label class="field__label" for="t13-clear">Background</label>
      <input type="color" id="t13-clear" data-key="clearColor" value="#000000" />
    </div>

    <div class="field">
      <label class="field__label" for="t13-torus">Torus color</label>
      <input type="color" id="t13-torus" data-key="torusColor" value="#ffffff" />
    </div>

    <div class="field">
      <label class="field__label" for="t13-fov">FOV <span class="field__val" data-out="fov"></span></label>
      <input type="range" id="t13-fov" data-key="fov" min="30" max="120" step="1" />
    </div>

    <div class="field">
      <label class="field__label" for="t13-z">Camera Z <span class="field__val" data-out="cameraZ"></span></label>
      <input type="range" id="t13-z" data-key="cameraZ" min="5" max="50" step="0.5" />
    </div>

    <div class="field">
      <label class="field__label" for="t13-rot">Rotation speed <span class="field__val" data-out="rotationSpeed"></span></label>
      <input type="range" id="t13-rot" data-key="rotationSpeed" min="0.0001" max="0.02" step="0.0001" />
    </div>

    <div class="field">
      <label class="field__label" for="t13-maj">Torus major radius <span class="field__val" data-out="torusMajorRadius"></span></label>
      <input type="range" id="t13-maj" data-key="torusMajorRadius" min="3" max="40" step="0.5" />
    </div>

    <div class="field">
      <label class="field__label" for="t13-tube">Tube radius <span class="field__val" data-out="tubeRadius"></span></label>
      <input type="range" id="t13-tube" data-key="tubeRadius" min="1" max="20" step="0.5" />
    </div>

    <div class="field">
      <label class="field__label" for="t13-rad">Radial segments <span class="field__val" data-out="radialSegments"></span></label>
      <input type="range" id="t13-rad" data-key="radialSegments" min="8" max="128" step="1" />
    </div>

    <div class="field">
      <label class="field__label" for="t13-tub">Tubular segments <span class="field__val" data-out="tubularSegments"></span></label>
      <input type="range" id="t13-tub" data-key="tubularSegments" min="8" max="200" step="1" />
    </div>

    <div class="field">
      <label class="field__label" for="t13-tr">Texture repeat <span class="field__val" data-out="textureRepeat"></span></label>
      <input type="range" id="t13-tr" data-key="textureRepeat" min="1" max="80" step="0.5" />
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

  function syncUIFromState(s: Template13Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template13Config;
      if (!key) return;
      const v = s[key];
      if (input.type === 'color') {
        input.value = String(v);
      } else {
        input.value = String(v);
      }
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template13Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      if (typeof v === 'number') {
        out.textContent = formatOut(key, v);
      }
    });
  }

  let state: Template13Config = {
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
        const key = input.dataset.key as keyof Template13Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template13Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template13Config>);
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
        const html = await buildTemplate13StandaloneHtml(api2.getState());
        downloadTextFile('prism-bees-three-torus.html', html);
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
    if (attempt < 40) {
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
