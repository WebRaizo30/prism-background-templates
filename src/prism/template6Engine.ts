/**
 * Engine UI for template 6 (CSS line drops) — drives `window.__prismCssLines` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate6StandaloneHtml } from './exportTemplate6';
import type { PrismCssLinesApi, Template6Config } from './template6Types';

export type { PrismCssLinesApi, Template6Config } from './template6Types';

function getApi(iframe: HTMLIFrameElement): PrismCssLinesApi | null {
  const win = iframe.contentWindow as Window & { __prismCssLines?: PrismCssLinesApi };
  return win?.__prismCssLines ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

export function mountTemplate6Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Animated vertical lines — backdrop, line tint, drop glow, timing, and layout.</p>

    <div class="field">
      <label class="field__label" for="t6-bg">Background</label>
      <input type="color" id="t6-bg" data-key="bgColor" value="#171717" />
    </div>
    <div class="field">
      <label class="field__label" for="t6-line">Line color</label>
      <input type="color" id="t6-line" data-key="lineColor" value="#ffffff" />
    </div>
    <div class="field">
      <label class="field__label" for="t6-lineOp">Line opacity <span class="field__val" data-out="lineOpacity"></span></label>
      <input type="range" id="t6-lineOp" data-key="lineOpacity" min="0" max="1" step="0.05" />
    </div>
    <div class="field">
      <label class="field__label" for="t6-drop">Drop highlight</label>
      <input type="color" id="t6-drop" data-key="dropHighlight" value="#ffffff" />
    </div>

    <div class="field">
      <label class="field__label" for="t6-dur">Drop duration (s) <span class="field__val" data-out="dropDurationSec"></span></label>
      <input type="range" id="t6-dur" data-key="dropDurationSec" min="1" max="30" step="0.5" />
    </div>
    <div class="field">
      <label class="field__label" for="t6-d1">Delay line 1 (s) <span class="field__val" data-out="delayLine1"></span></label>
      <input type="range" id="t6-d1" data-key="delayLine1" min="0" max="10" step="0.1" />
    </div>
    <div class="field">
      <label class="field__label" for="t6-d2">Delay line 2 (s) <span class="field__val" data-out="delayLine2"></span></label>
      <input type="range" id="t6-d2" data-key="delayLine2" min="0" max="10" step="0.1" />
    </div>
    <div class="field">
      <label class="field__label" for="t6-d3">Delay line 3 (s) <span class="field__val" data-out="delayLine3"></span></label>
      <input type="range" id="t6-d3" data-key="delayLine3" min="0" max="10" step="0.1" />
    </div>
    <div class="field">
      <label class="field__label" for="t6-lw">Lines width % <span class="field__val" data-out="linesWidthPercent"></span></label>
      <input type="range" id="t6-lw" data-key="linesWidthPercent" min="40" max="100" step="1" />
    </div>
    <div class="field">
      <label class="field__label" for="t6-lwp">Line width (px) <span class="field__val" data-out="lineWidthPx"></span></label>
      <input type="range" id="t6-lwp" data-key="lineWidthPx" min="1" max="8" step="1" />
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

  function syncUIFromState(s: Template6Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template6Config;
      if (!key) return;
      const v = s[key];
      if (input.type === 'color') {
        input.value = String(v);
      } else {
        input.value = String(v);
      }
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template6Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      out.textContent = typeof v === 'number' ? Number(v).toFixed(2) : String(v);
    });
  }

  let state: Template6Config = {
    bgColor: '#171717',
    lineColor: '#ffffff',
    lineOpacity: 0.1,
    dropHighlight: '#ffffff',
    dropDurationSec: 7,
    delayLine1: 2,
    delayLine2: 0,
    delayLine3: 2.5,
    linesWidthPercent: 90,
    lineWidthPx: 1,
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
        const key = input.dataset.key as keyof Template6Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template6Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template6Config>);
        }
        state = api2.getState();
        syncUIFromState(state);
      });
      input.addEventListener('change', () => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const key = input.dataset.key as keyof Template6Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template6Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template6Config>);
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
        const html = await buildTemplate6StandaloneHtml(api2.getState());
        downloadTextFile('prism-css-lines.html', html);
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
