/**
 * Engine UI for template 17 (CSS rays) — drives `window.__prismRaysBg` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate17StandaloneHtml } from './exportTemplate17';
import type { PrismRaysBgApi, Template17Config } from './template17Types';

export type { PrismRaysBgApi, Template17Config } from './template17Types';

function getApi(iframe: HTMLIFrameElement): PrismRaysBgApi | null {
  const win = iframe.contentWindow as Window & { __prismRaysBg?: PrismRaysBgApi };
  return win?.__prismRaysBg ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

function formatOut(key: keyof Template17Config, v: number): string {
  if (key === 'animDurationSec' || key === 'iconBlinkSec') return Number(v).toFixed(1);
  return String(Math.round(v));
}

export function mountTemplate17Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Rays layer — stripe colors, motion, blur, title, and alternate “switch bg” mode.</p>

    <div class="field">
      <label class="field__label" for="t17-s1">Stripe (normal)</label>
      <input type="color" id="t17-s1" data-key="stripeColor" value="#ffffff" />
    </div>
    <div class="field">
      <label class="field__label" for="t17-s2">Stripe (switch)</label>
      <input type="color" id="t17-s2" data-key="stripeColorAlt" value="#000000" />
    </div>

    <div class="field">
      <label class="field__label" for="t17-ad">Background motion (s) <span class="field__val" data-out="animDurationSec"></span></label>
      <input type="range" id="t17-ad" data-key="animDurationSec" min="2" max="300" step="1" />
    </div>
    <div class="field">
      <label class="field__label" for="t17-bl">Hero blur (px) <span class="field__val" data-out="heroBlurPx"></span></label>
      <input type="range" id="t17-bl" data-key="heroBlurPx" min="0" max="40" step="1" />
    </div>
    <div class="field">
      <label class="field__label" for="t17-ic">Icon blink (s) <span class="field__val" data-out="iconBlinkSec"></span></label>
      <input type="range" id="t17-ic" data-key="iconBlinkSec" min="0.2" max="10" step="0.1" />
    </div>

    <div class="field">
      <label class="field__label" for="t17-title">Title</label>
      <input type="text" id="t17-title" data-key="titleText" maxlength="180" class="field__text" />
    </div>

    <div class="field">
      <label class="field__label">
        <input type="checkbox" id="t17-sw" data-key="switchOn" />
        Switch bg (alternate look)
      </label>
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

  function syncUIFromState(s: Template17Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template17Config;
      if (!key) return;
      const v = s[key];
      if (input.type === 'checkbox') {
        input.checked = Boolean(v);
      } else {
        input.value = String(v);
      }
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template17Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      if (typeof v === 'number') {
        out.textContent = formatOut(key, v);
      }
    });
  }

  let state: Template17Config = {
    stripeColor: '#ffffff',
    stripeColorAlt: '#000000',
    animDurationSec: 60,
    heroBlurPx: 10,
    iconBlinkSec: 2,
    switchOn: false,
    titleText: 'RAIZO',
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
        const key = input.dataset.key as keyof Template17Config;
        if (!key) return;
        if (input.type === 'checkbox') {
          api2.applyConfig({ [key]: input.checked } as Partial<Template17Config>);
        } else if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template17Config>);
        } else if (input.type === 'text') {
          api2.applyConfig({ [key]: input.value } as Partial<Template17Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template17Config>);
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
        const html = await buildTemplate17StandaloneHtml(api2.getState());
        downloadTextFile('prism-rays-bg.html', html);
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
