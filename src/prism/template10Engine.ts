/**
 * Engine UI for template 10 (GSAP wave lines) — drives `window.__prismWaveLines` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate10StandaloneHtml } from './exportTemplate10';
import type { PrismWaveLinesApi, Template10Config } from './template10Types';

export type { PrismWaveLinesApi, Template10Config } from './template10Types';

function getApi(iframe: HTMLIFrameElement): PrismWaveLinesApi | null {
  const win = iframe.contentWindow as Window & { __prismWaveLines?: PrismWaveLinesApi };
  return win?.__prismWaveLines ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

export function mountTemplate10Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Wave gradient, background radial, and GSAP time scale. Standalone file: <strong>Download .html</strong> at the bottom of this panel.</p>

    <div class="field">
      <label class="field__label" for="t10-g0">Wave gradient — start</label>
      <input type="color" id="t10-g0" data-key="gradientStop0" value="#1742ff" />
    </div>
    <div class="field">
      <label class="field__label" for="t10-g1">Wave gradient — end</label>
      <input type="color" id="t10-g1" data-key="gradientStop1" value="#22dd8a" />
    </div>
    <div class="field">
      <label class="field__label" for="t10-bg0">Background — center</label>
      <input type="color" id="t10-bg0" data-key="bgRadialInner" value="#0a3cca" />
    </div>
    <div class="field">
      <label class="field__label" for="t10-bg1">Background — edge</label>
      <input type="color" id="t10-bg1" data-key="bgRadialOuter" value="#042e52" />
    </div>

    <div class="field">
      <label class="field__label" for="t10-ts">Time scale <span class="field__val" data-out="timeScale"></span></label>
      <input type="range" id="t10-ts" data-key="timeScale" min="0.25" max="3" step="0.05" />
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

  function syncUIFromState(s: Template10Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template10Config;
      if (!key) return;
      const v = s[key];
      if (input.type === 'color') {
        input.value = String(v);
      } else {
        input.value = String(v);
      }
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template10Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      out.textContent = typeof v === 'number' ? Number(v).toFixed(2) : String(v);
    });
  }

  let state: Template10Config = {
    gradientStop0: '#1742ff',
    gradientStop1: '#22dd8a',
    bgRadialInner: '#0a3cca',
    bgRadialOuter: '#042e52',
    timeScale: 1,
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
        const key = input.dataset.key as keyof Template10Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template10Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template10Config>);
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
        const html = await buildTemplate10StandaloneHtml(api2.getState());
        downloadTextFile('prism-wave-lines.html', html);
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
