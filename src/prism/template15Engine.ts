/**
 * Engine UI for template 15 (CSS noise background) — drives `window.__prismStaticNoise` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate15StandaloneHtml } from './exportTemplate15';
import type { PrismStaticNoiseApi, Template15Config } from './template15Types';

export type { PrismStaticNoiseApi, Template15Config } from './template15Types';

function getApi(iframe: HTMLIFrameElement): PrismStaticNoiseApi | null {
  const win = iframe.contentWindow as Window & { __prismStaticNoise?: PrismStaticNoiseApi };
  return win?.__prismStaticNoise ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

function formatOut(key: keyof Template15Config, v: number): string {
  if (key === 'animDurationSec') return Number(v).toFixed(2);
  return Number(v).toFixed(2);
}

export function mountTemplate15Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">CSS-only noise layer — background color, noise opacity, and animation speed.</p>

    <div class="field">
      <label class="field__label" for="t15-bg">Background</label>
      <input type="color" id="t15-bg" data-key="bgColor" value="#111111" />
    </div>

    <div class="field">
      <label class="field__label" for="t15-op">Noise opacity <span class="field__val" data-out="noiseOpacity"></span></label>
      <input type="range" id="t15-op" data-key="noiseOpacity" min="0.05" max="1" step="0.05" />
    </div>

    <div class="field">
      <label class="field__label" for="t15-dur">Animation duration (s) <span class="field__val" data-out="animDurationSec"></span></label>
      <input type="range" id="t15-dur" data-key="animDurationSec" min="0.05" max="3" step="0.05" />
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

  function syncUIFromState(s: Template15Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template15Config;
      if (!key) return;
      const v = s[key];
      if (input.type === 'color') {
        input.value = String(v);
      } else {
        input.value = String(v);
      }
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template15Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      if (typeof v === 'number') {
        out.textContent = formatOut(key, v);
      }
    });
  }

  let state: Template15Config = {
    bgColor: '#111111',
    noiseOpacity: 0.9,
    animDurationSec: 0.2,
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
        const key = input.dataset.key as keyof Template15Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template15Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template15Config>);
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
        const html = await buildTemplate15StandaloneHtml(api2.getState());
        downloadTextFile('prism-static-noise.html', html);
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
