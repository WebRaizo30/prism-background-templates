/**
 * Engine UI for template 8 (SVG hearts) — drives `window.__prismHearts` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate8StandaloneHtml } from './exportTemplate8';
import type { PrismHeartsApi, Template8Config } from './template8Types';

export type { PrismHeartsApi, Template8Config } from './template8Types';

function getApi(iframe: HTMLIFrameElement): PrismHeartsApi | null {
  const win = iframe.contentWindow as Window & { __prismHearts?: PrismHeartsApi };
  return win?.__prismHearts ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

export function mountTemplate8Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Hearts background — six palette colors, pulse speed, and max scale.</p>

    <div class="field">
      <label class="field__label" for="t8-c0">Color 1</label>
      <input type="color" id="t8-c0" data-color-index="0" />
    </div>
    <div class="field">
      <label class="field__label" for="t8-c1">Color 2</label>
      <input type="color" id="t8-c1" data-color-index="1" />
    </div>
    <div class="field">
      <label class="field__label" for="t8-c2">Color 3</label>
      <input type="color" id="t8-c2" data-color-index="2" />
    </div>
    <div class="field">
      <label class="field__label" for="t8-c3">Color 4</label>
      <input type="color" id="t8-c3" data-color-index="3" />
    </div>
    <div class="field">
      <label class="field__label" for="t8-c4">Color 5</label>
      <input type="color" id="t8-c4" data-color-index="4" />
    </div>
    <div class="field">
      <label class="field__label" for="t8-c5">Color 6</label>
      <input type="color" id="t8-c5" data-color-index="5" />
    </div>

    <div class="field">
      <label class="field__label" for="t8-step">Pulse step <span class="field__val" data-out="step"></span></label>
      <input type="range" id="t8-step" data-key="step" min="0.002" max="0.08" step="0.001" />
    </div>
    <div class="field">
      <label class="field__label" for="t8-max">Max scale <span class="field__val" data-out="maxScale"></span></label>
      <input type="range" id="t8-max" data-key="maxScale" min="8" max="40" step="1" />
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

  function syncUIFromState(s: Template8Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-color-index]').forEach((input) => {
      const i = Number(input.dataset.colorIndex);
      if (Number.isFinite(i) && i >= 0 && i < 6) {
        input.value = s.colors[i];
      }
    });
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template8Config;
      if (!key || key === 'colors') return;
      const v = s[key];
      input.value = String(v);
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as 'step' | 'maxScale';
      if (key === 'step') {
        out.textContent = Number(s.step).toFixed(3);
      } else if (key === 'maxScale') {
        out.textContent = String(s.maxScale);
      }
    });
  }

  let state: Template8Config = {
    colors: ['#e03776', '#8f3e98', '#4687bf', '#3bab6f', '#f9c25e', '#f47274'],
    step: 0.01,
    maxScale: 18,
  };

  function wire(): void {
    const api = getApi(iframe);
    if (!api) {
      setFeedback('Preview not ready — wait a moment.');
      return;
    }
    state = api.getState();
    syncUIFromState(state);

    host.querySelectorAll<HTMLInputElement>('[data-color-index]').forEach((input) => {
      const onColor = (): void => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const idx = Number(input.dataset.colorIndex);
        if (!Number.isFinite(idx) || idx < 0 || idx > 5) return;
        const next = [...api2.getState().colors] as string[];
        next[idx] = input.value;
        api2.applyConfig({ colors: next as Template8Config['colors'] });
        state = api2.getState();
        syncUIFromState(state);
      };
      input.addEventListener('input', onColor);
      input.addEventListener('change', onColor);
    });

    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const onRange = (): void => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const key = input.dataset.key as keyof Template8Config;
        if (!key || key === 'colors') return;
        api2.applyConfig({ [key]: Number(input.value) } as Partial<Template8Config>);
        state = api2.getState();
        syncUIFromState(state);
      };
      input.addEventListener('input', onRange);
      input.addEventListener('change', onRange);
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
        const html = await buildTemplate8StandaloneHtml(api2.getState());
        downloadTextFile('prism-hearts.html', html);
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
