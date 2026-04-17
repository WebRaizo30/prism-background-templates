/**
 * Engine UI for template 12 (canvas parallel dimension) — drives `window.__prismParallelDimension` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate12StandaloneHtml } from './exportTemplate12';
import type { PrismParallelDimensionApi, Template12Config } from './template12Types';

export type { PrismParallelDimensionApi, Template12Config } from './template12Types';

function getApi(iframe: HTMLIFrameElement): PrismParallelDimensionApi | null {
  const win = iframe.contentWindow as Window & { __prismParallelDimension?: PrismParallelDimensionApi };
  return win?.__prismParallelDimension ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

function formatOut(key: keyof Template12Config, v: number): string {
  if (key === 'sideLength') return String(Math.round(v));
  if (key === 'trailOpacity' || key === 'rotSpeed' || key === 'waveSpeed') return Number(v).toFixed(3);
  return Number(v).toFixed(1);
}

export function mountTemplate12Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Canvas particle grid — gradient colors, trail, size, camera, rotation, wave, and grid density.</p>

    <div class="field">
      <label class="field__label" for="t12-c0">Particle color (low)</label>
      <input type="color" id="t12-c0" data-key="colorLow" value="#0014ff" />
    </div>
    <div class="field">
      <label class="field__label" for="t12-c1">Particle color (high)</label>
      <input type="color" id="t12-c1" data-key="colorHigh" value="#64149b" />
    </div>

    <div class="field">
      <label class="field__label" for="t12-trail">Trail opacity <span class="field__val" data-out="trailOpacity"></span></label>
      <input type="range" id="t12-trail" data-key="trailOpacity" min="0.05" max="1" step="0.01" />
    </div>
    <div class="field">
      <label class="field__label" for="t12-ps">Particle size (px) <span class="field__val" data-out="particleSizePx"></span></label>
      <input type="range" id="t12-ps" data-key="particleSizePx" min="1" max="16" step="1" />
    </div>
    <div class="field">
      <label class="field__label" for="t12-ma">Max amplitude <span class="field__val" data-out="maxAmplitude"></span></label>
      <input type="range" id="t12-ma" data-key="maxAmplitude" min="100" max="4000" step="10" />
    </div>
    <div class="field">
      <label class="field__label" for="t12-fov">FOV <span class="field__val" data-out="fov"></span></label>
      <input type="range" id="t12-fov" data-key="fov" min="40" max="240" step="1" />
    </div>
    <div class="field">
      <label class="field__label" for="t12-dist">View distance <span class="field__val" data-out="dist"></span></label>
      <input type="range" id="t12-dist" data-key="dist" min="30" max="400" step="1" />
    </div>
    <div class="field">
      <label class="field__label" for="t12-rot">Rotation speed <span class="field__val" data-out="rotSpeed"></span></label>
      <input type="range" id="t12-rot" data-key="rotSpeed" min="0.001" max="0.03" step="0.0005" />
    </div>
    <div class="field">
      <label class="field__label" for="t12-wave">Wave speed <span class="field__val" data-out="waveSpeed"></span></label>
      <input type="range" id="t12-wave" data-key="waveSpeed" min="0.005" max="0.15" step="0.005" />
    </div>
    <div class="field">
      <label class="field__label" for="t12-sl">Grid side (particles) <span class="field__val" data-out="sideLength"></span></label>
      <input type="range" id="t12-sl" data-key="sideLength" min="8" max="80" step="1" />
    </div>
    <div class="field">
      <label class="field__label" for="t12-sp">Spacing (px) <span class="field__val" data-out="spacingPx"></span></label>
      <input type="range" id="t12-sp" data-key="spacingPx" min="40" max="500" step="5" />
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

  function syncUIFromState(s: Template12Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template12Config;
      if (!key) return;
      const v = s[key];
      input.value = String(v);
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template12Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      if (typeof v === 'number') {
        out.textContent = formatOut(key, v);
      }
    });
  }

  let state: Template12Config = {
    colorLow: '#0014ff',
    colorHigh: '#64149b',
    trailOpacity: 0.5,
    particleSizePx: 2,
    maxAmplitude: 1500,
    fov: 100,
    dist: 100,
    rotSpeed: 0.005,
    waveSpeed: 0.03,
    sideLength: 50,
    spacingPx: 200,
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
        const key = input.dataset.key as keyof Template12Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template12Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template12Config>);
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
        const html = await buildTemplate12StandaloneHtml(api2.getState());
        downloadTextFile('prism-parallel-dimension.html', html);
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
    if (attempt < 30) {
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
