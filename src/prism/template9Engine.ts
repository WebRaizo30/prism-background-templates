/**
 * Engine UI for template 9 (infinite CSS grid scroll) — drives `window.__prismInfinityBg` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate9StandaloneHtml } from './exportTemplate9';
import type { PrismInfinityBgApi, Template9Config } from './template9Types';

export type { PrismInfinityBgApi, Template9Config } from './template9Types';

function getApi(iframe: HTMLIFrameElement): PrismInfinityBgApi | null {
  const win = iframe.contentWindow as Window & { __prismInfinityBg?: PrismInfinityBgApi };
  return win?.__prismInfinityBg ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

export function mountTemplate9Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Infinite scrolling grid — label, colors, timing, and layout.</p>

    <div class="field">
      <label class="field__label" for="t9-label">Label text</label>
      <input type="text" id="t9-label" data-key="labelText" maxlength="48" autocomplete="off" />
    </div>

    <div class="field">
      <label class="field__label" for="t9-color">Text color</label>
      <input type="color" id="t9-color" data-key="textColor" value="#999999" />
    </div>

    <div class="field">
      <label class="field__label" for="t9-dur">Scroll duration (s) <span class="field__val" data-out="durationSec"></span></label>
      <input type="range" id="t9-dur" data-key="durationSec" min="0.1" max="10" step="0.02" />
    </div>

    <div class="field">
      <label class="field__label" for="t9-tile">Grid tile (px) <span class="field__val" data-out="tileSizePx"></span></label>
      <input type="range" id="t9-tile" data-key="tileSizePx" min="10" max="200" step="1" />
    </div>

    <div class="field">
      <label class="field__label" for="t9-lsize">Label size (rem) <span class="field__val" data-out="labelSizeRem"></span></label>
      <input type="range" id="t9-lsize" data-key="labelSizeRem" min="2" max="16" step="0.1" />
    </div>

    <div class="field">
      <label class="field__label" for="t9-mt">Body margin top (rem) <span class="field__val" data-out="bodyMarginTopRem"></span></label>
      <input type="range" id="t9-mt" data-key="bodyMarginTopRem" min="0" max="30" step="0.1" />
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

  function syncUIFromState(s: Template9Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template9Config;
      if (!key) return;
      const v = s[key];
      if (input.type === 'color') {
        input.value = String(v);
      } else if (input.type === 'text') {
        input.value = String(v);
      } else {
        input.value = String(v);
      }
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template9Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      if (typeof v === 'number') {
        out.textContent = Number.isInteger(v) ? String(v) : Number(v).toFixed(2);
      } else {
        out.textContent = String(v);
      }
    });
  }

  let state: Template9Config = {
    labelText: 'RAIZO',
    textColor: '#999999',
    durationSec: 0.92,
    tileSizePx: 50,
    labelSizeRem: 8,
    bodyMarginTopRem: 13.5,
  };

  function wire(): void {
    const api = getApi(iframe);
    if (!api) {
      setFeedback('Preview not ready — wait a moment.');
      return;
    }
    state = api.getState();
    syncUIFromState(state);

    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const onInput = (): void => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const key = input.dataset.key as keyof Template9Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template9Config>);
        } else if (input.type === 'text') {
          api2.applyConfig({ [key]: input.value } as Partial<Template9Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template9Config>);
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
        const html = await buildTemplate9StandaloneHtml(api2.getState());
        downloadTextFile('prism-infinity-bg.html', html);
        setFeedback('Standalone HTML downloaded.');
      } catch (err) {
        console.error(err);
        setFeedback('Download failed — see console.');
      }
    });

    setFeedback('');
  }

  iframe.addEventListener('load', wire);
  if (iframe.contentDocument?.readyState === 'complete') {
    queueMicrotask(wire);
  }
}
