/**
 * Engine UI for template 3 (Sparkling Boxes) — drives `window.__prismSparklingBoxes` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate3StandaloneHtml } from './exportTemplate3';
import type { PrismSparklingBoxesApi, Template3Config } from './template3Types';

export type { PrismSparklingBoxesApi, Template3Config } from './template3Types';

function getApi(iframe: HTMLIFrameElement): PrismSparklingBoxesApi | null {
  const win = iframe.contentWindow as Window & { __prismSparklingBoxes?: PrismSparklingBoxesApi };
  return win?.__prismSparklingBoxes ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

export function mountTemplate3Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Sparkling Boxes — attraction, size, speed, and two light colors.</p>

    <div class="field">
      <label class="field__label" for="t3-light1">Light 1</label>
      <input type="color" id="t3-light1" data-key="light1" value="#ffaa80" />
    </div>
    <div class="field">
      <label class="field__label" for="t3-light2">Light 2</label>
      <input type="color" id="t3-light2" data-key="light2" value="#607fff" />
    </div>

    <div class="field">
      <label class="field__label" for="t3-attraction">Attraction <span class="field__val" data-out="attractionIntensity"></span></label>
      <input type="range" id="t3-attraction" data-key="attractionIntensity" min="0.1" max="2" step="0.05" />
    </div>
    <div class="field">
      <label class="field__label" for="t3-size">Particle size <span class="field__val" data-out="size"></span></label>
      <input type="range" id="t3-size" data-key="size" min="0.5" max="4" step="0.05" />
    </div>
    <div class="field">
      <label class="field__label" for="t3-maxVel">Max velocity <span class="field__val" data-out="maxVelocity"></span></label>
      <input type="range" id="t3-maxVel" data-key="maxVelocity" min="0.1" max="1.5" step="0.05" />
    </div>

    <div class="engine__actions">
      <button type="button" class="btn btn--ghost" data-action="reset">Reset to defaults</button>
      <button type="button" class="btn btn--primary" data-action="random-colors">Random colors</button>
      <button type="button" class="btn btn--primary" data-action="copy-json">Copy config JSON</button>
      <button type="button" class="btn btn--primary" data-action="download-html">Download .html (standalone)</button>
    </div>
    <p class="engine__ok" data-feedback role="status" aria-live="polite"></p>
  `;

  const feedback = el(host, '[data-feedback]');

  function setFeedback(text: string): void {
    if (feedback) feedback.textContent = text;
  }

  function syncUIFromState(s: Template3Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template3Config;
      if (!key) return;
      const v = s[key];
      if (input.type === 'color') {
        input.value = String(v);
      } else {
        input.value = String(v);
      }
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template3Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      out.textContent = typeof v === 'number' ? Number(v).toFixed(2) : String(v);
    });
  }

  let state: Template3Config = {
    attractionIntensity: 0.75,
    size: 1.5,
    maxVelocity: 0.5,
    light1: '#ffaa80',
    light2: '#607fff',
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
        const key = input.dataset.key as keyof Template3Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template3Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template3Config>);
        }
        state = api2.getState();
        syncUIFromState(state);
      });
      input.addEventListener('change', () => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const key = input.dataset.key as keyof Template3Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template3Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template3Config>);
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

    el(host, '[data-action="random-colors"]')?.addEventListener('click', () => {
      const api2 = getApi(iframe);
      api2?.randomizeColors();
      const api3 = getApi(iframe);
      if (api3) {
        state = api3.getState();
        syncUIFromState(state);
      }
      setFeedback('Random colors applied.');
    });

    el(host, '[data-action="copy-json"]')?.addEventListener('click', async () => {
      const api2 = getApi(iframe);
      if (!api2) return;
      const json = JSON.stringify(api2.getState(), null, 2);
      try {
        await navigator.clipboard.writeText(json);
        setFeedback('Config JSON copied.');
      } catch {
        setFeedback('Clipboard failed.');
      }
    });

    el(host, '[data-action="download-html"]')?.addEventListener('click', async () => {
      const api2 = getApi(iframe);
      if (!api2) return;
      try {
        const html = await buildTemplate3StandaloneHtml(api2.getState());
        downloadTextFile('prism-sparkling-boxes.html', html);
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
