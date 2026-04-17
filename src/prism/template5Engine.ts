/**
 * Engine UI for template 5 (Bubbles) — drives `window.__prismBubbles` in the iframe.
 */

import { buildTemplate5StandaloneHtml } from './exportTemplate5';
import { downloadTextFile } from './exportTemplate1';
import type { PrismBubblesApi, Template5Config } from './template5Types';

export type { PrismBubblesApi, Template5Config } from './template5Types';

function getApi(iframe: HTMLIFrameElement): PrismBubblesApi | null {
  const win = iframe.contentWindow as Window & { __prismBubbles?: PrismBubblesApi };
  return win?.__prismBubbles ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

export function mountTemplate5Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Bubbles — gradient backdrop, blob colors, and pointer-follow smoothing.</p>

    <details class="engine__advanced" open>
      <summary>Background</summary>
      <div class="field">
        <label class="field__label" for="t5-bg1">Background A</label>
        <input type="color" id="t5-bg1" data-key="colorBg1" value="#6c00a2" />
      </div>
      <div class="field">
        <label class="field__label" for="t5-bg2">Background B</label>
        <input type="color" id="t5-bg2" data-key="colorBg2" value="#001152" />
      </div>
    </details>

    <details class="engine__advanced" open>
      <summary>Blob colors</summary>
      <div class="field">
        <label class="field__label" for="t5-c1">Blob 1</label>
        <input type="color" id="t5-c1" data-key="color1" value="#1271ff" />
      </div>
      <div class="field">
        <label class="field__label" for="t5-c2">Blob 2</label>
        <input type="color" id="t5-c2" data-key="color2" value="#dd4aff" />
      </div>
      <div class="field">
        <label class="field__label" for="t5-c3">Blob 3</label>
        <input type="color" id="t5-c3" data-key="color3" value="#64dcff" />
      </div>
      <div class="field">
        <label class="field__label" for="t5-c4">Blob 4</label>
        <input type="color" id="t5-c4" data-key="color4" value="#c83232" />
      </div>
      <div class="field">
        <label class="field__label" for="t5-c5">Blob 5</label>
        <input type="color" id="t5-c5" data-key="color5" value="#b4b432" />
      </div>
      <div class="field">
        <label class="field__label" for="t5-ci">Interactive</label>
        <input type="color" id="t5-ci" data-key="colorInteractive" value="#8c64ff" />
      </div>
    </details>

    <div class="field">
      <label class="field__label" for="t5-circle">Circle size % <span class="field__val" data-out="circleSizePercent"></span></label>
      <input type="range" id="t5-circle" data-key="circleSizePercent" min="30" max="120" step="1" />
    </div>
    <div class="field">
      <label class="field__label" for="t5-smooth">Mouse smooth <span class="field__val" data-out="mouseSmooth"></span></label>
      <input type="range" id="t5-smooth" data-key="mouseSmooth" min="4" max="80" step="1" />
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

  function syncUIFromState(s: Template5Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template5Config;
      if (!key) return;
      const v = s[key];
      if (input.type === 'color') {
        input.value = String(v);
      } else {
        input.value = String(v);
      }
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template5Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      out.textContent = typeof v === 'number' ? String(Math.round(Number(v))) : String(v);
    });
  }

  let state: Template5Config = {
    colorBg1: '#6c00a2',
    colorBg2: '#001152',
    color1: '#1271ff',
    color2: '#dd4aff',
    color3: '#64dcff',
    color4: '#c83232',
    color5: '#b4b432',
    colorInteractive: '#8c64ff',
    circleSizePercent: 80,
    mouseSmooth: 20,
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
        const key = input.dataset.key as keyof Template5Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template5Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template5Config>);
        }
        state = api2.getState();
        syncUIFromState(state);
      });
      input.addEventListener('change', () => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const key = input.dataset.key as keyof Template5Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template5Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template5Config>);
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
        const html = await buildTemplate5StandaloneHtml(api2.getState());
        downloadTextFile('prism-bubbles.html', html);
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
