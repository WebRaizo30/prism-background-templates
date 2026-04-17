/**
 * Engine UI for template 4 (Neon Strings shader) — drives `window.__prismNeonStrings` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate4StandaloneHtml } from './exportTemplate4';
import type { PrismNeonStringsApi, Template4Config } from './template4Types';

export type { PrismNeonStringsApi, Template4Config } from './template4Types';

function getApi(iframe: HTMLIFrameElement): PrismNeonStringsApi | null {
  const win = iframe.contentWindow as Window & { __prismNeonStrings?: PrismNeonStringsApi };
  return win?.__prismNeonStrings ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

export function mountTemplate4Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Neon Strings — time scale, pause, and color tint.</p>

    <div class="field">
      <label class="field__label" for="t4-tint">Color tint</label>
      <input type="color" id="t4-tint" data-key="tint" value="#ffffff" />
    </div>

    <div class="field">
      <label class="field__label" for="t4-timeScale">Time scale <span class="field__val" data-out="timeScale"></span></label>
      <input type="range" id="t4-timeScale" data-key="timeScale" min="0.1" max="3" step="0.05" />
    </div>

    <div class="field">
      <label class="field__label" for="t4-paused">Pause</label>
      <input type="checkbox" id="t4-paused" data-key="paused" />
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

  function syncUIFromState(s: Template4Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template4Config;
      if (!key) return;
      const v = s[key];
      if (input.type === 'checkbox') {
        input.checked = Boolean(v);
      } else if (input.type === 'color') {
        input.value = String(v);
      } else {
        input.value = String(v);
      }
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template4Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      out.textContent = typeof v === 'number' ? Number(v).toFixed(2) : String(v);
    });
  }

  let state: Template4Config = {
    timeScale: 1,
    paused: false,
    tint: '#ffffff',
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
      input.addEventListener('input', () => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const key = input.dataset.key as keyof Template4Config;
        if (!key) return;
        if (input.type === 'checkbox') {
          api2.applyConfig({ [key]: input.checked } as Partial<Template4Config>);
        } else if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template4Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template4Config>);
        }
        state = api2.getState();
        syncUIFromState(state);
      });
      input.addEventListener('change', () => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const key = input.dataset.key as keyof Template4Config;
        if (!key) return;
        if (input.type === 'checkbox') {
          api2.applyConfig({ [key]: input.checked } as Partial<Template4Config>);
        } else if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template4Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template4Config>);
        }
        state = api2.getState();
        syncUIFromState(state);
      });
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
        const html = await buildTemplate4StandaloneHtml(api2.getState());
        downloadTextFile('prism-neon-strings.html', html);
        setFeedback('Standalone HTML downloaded.');
      } catch {
        setFeedback('Could not build standalone HTML — try again.');
      }
    });

    setFeedback('');
  }

  iframe.addEventListener('load', wire);
  if (iframe.contentDocument?.readyState === 'complete') {
    queueMicrotask(wire);
  }
}
