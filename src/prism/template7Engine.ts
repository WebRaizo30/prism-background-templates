/**
 * Engine UI for template 7 (striped text mask) — drives `window.__prismWarningStripe` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate7StandaloneHtml } from './exportTemplate7';
import type { PrismWarningStripeApi, Template7Config } from './template7Types';

export type { PrismWarningStripeApi, Template7Config } from './template7Types';

function getApi(iframe: HTMLIFrameElement): PrismWarningStripeApi | null {
  const win = iframe.contentWindow as Window & { __prismWarningStripe?: PrismWarningStripeApi };
  return win?.__prismWarningStripe ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

export function mountTemplate7Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Striped text mask — two stripe colors, tile size, speed, and label.</p>

    <div class="field">
      <label class="field__label" for="t7-label">Label text</label>
      <input type="text" id="t7-label" data-key="labelText" maxlength="48" autocomplete="off" />
    </div>

    <div class="field">
      <label class="field__label" for="t7-c1">Stripe color A</label>
      <input type="color" id="t7-c1" data-key="color1" value="#cc4444" />
    </div>
    <div class="field">
      <label class="field__label" for="t7-c2">Stripe color B</label>
      <input type="color" id="t7-c2" data-key="color2" value="#313131" />
    </div>

    <div class="field">
      <label class="field__label" for="t7-size">Stripe tile (px) <span class="field__val" data-out="stripeSizePx"></span></label>
      <input type="range" id="t7-size" data-key="stripeSizePx" min="20" max="240" step="2" />
    </div>
    <div class="field">
      <label class="field__label" for="t7-dur">Duration (s) <span class="field__val" data-out="durationSec"></span></label>
      <input type="range" id="t7-dur" data-key="durationSec" min="0.3" max="15" step="0.1" />
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

  function syncUIFromState(s: Template7Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template7Config;
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
      const key = out.dataset.out as keyof Template7Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      out.textContent = typeof v === 'number' ? Number(v).toFixed(2) : String(v);
    });
  }

  let state: Template7Config = {
    color1: '#cc4444',
    color2: '#313131',
    stripeSizePx: 100,
    durationSec: 2,
    labelText: 'RAIZO',
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
        const key = input.dataset.key as keyof Template7Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template7Config>);
        } else if (input.type === 'text') {
          api2.applyConfig({ [key]: input.value } as Partial<Template7Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template7Config>);
        }
        state = api2.getState();
        syncUIFromState(state);
      });
      input.addEventListener('change', () => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const key = input.dataset.key as keyof Template7Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template7Config>);
        } else if (input.type === 'text') {
          api2.applyConfig({ [key]: input.value } as Partial<Template7Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template7Config>);
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
        const html = await buildTemplate7StandaloneHtml(api2.getState());
        downloadTextFile('prism-warning-stripes.html', html);
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
