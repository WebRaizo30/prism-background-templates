/**
 * Engine UI for template 11 (cloudy spiral) — drives `window.__prismCloudySpiral` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate11StandaloneHtml } from './exportTemplate11';
import type { PrismCloudySpiralApi, Template11Config } from './template11Types';

export type { PrismCloudySpiralApi, Template11Config } from './template11Types';

function getApi(iframe: HTMLIFrameElement): PrismCloudySpiralApi | null {
  const win = iframe.contentWindow as Window & { __prismCloudySpiral?: PrismCloudySpiralApi };
  return win?.__prismCloudySpiral ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

export function mountTemplate11Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Cloudy spiral — background, particle size, orbit radius, and lap duration.</p>

    <div class="field">
      <label class="field__label" for="t11-bg">Background</label>
      <input type="color" id="t11-bg" data-key="bgColor" value="#3e6fa3" />
    </div>

    <div class="field">
      <label class="field__label" for="t11-ps">Particle size (px) <span class="field__val" data-out="particleSizePx"></span></label>
      <input type="range" id="t11-ps" data-key="particleSizePx" min="2" max="32" step="1" />
    </div>

    <div class="field">
      <label class="field__label" for="t11-r">Orbit radius (px) <span class="field__val" data-out="radiusPx"></span></label>
      <input type="range" id="t11-r" data-key="radiusPx" min="20" max="200" step="1" />
    </div>

    <div class="field">
      <label class="field__label" for="t11-lap">Lap duration (s) <span class="field__val" data-out="lapDurationSec"></span></label>
      <input type="range" id="t11-lap" data-key="lapDurationSec" min="0.5" max="20" step="0.1" />
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

  function syncUIFromState(s: Template11Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template11Config;
      if (!key) return;
      const v = s[key];
      if (input.type === 'color') {
        input.value = String(v);
      } else {
        input.value = String(v);
      }
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template11Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      if (typeof v === 'number') {
        out.textContent = key === 'particleSizePx' || key === 'radiusPx' ? String(Math.round(v)) : Number(v).toFixed(2);
      } else {
        out.textContent = String(v);
      }
    });
  }

  let state: Template11Config = {
    bgColor: '#3e6fa3',
    particleSizePx: 8,
    radiusPx: 80,
    lapDurationSec: 3,
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
      const onChange = (): void => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const key = input.dataset.key as keyof Template11Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template11Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template11Config>);
        }
        state = api2.getState();
        syncUIFromState(state);
      };
      input.addEventListener('input', onChange);
      input.addEventListener('change', onChange);
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
        const html = await buildTemplate11StandaloneHtml(api2.getState());
        downloadTextFile('prism-cloudy-spiral.html', html);
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
