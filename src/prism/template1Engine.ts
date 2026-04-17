/**
 * Engine UI for template 1 (Shape Wave) — drives `window.__prismShapeWave` inside the iframe.
 */

import { buildTemplate1StandaloneHtml, downloadTextFile } from './exportTemplate1';
import type { PrismShapeWaveApi, Template1Config } from './template1Types';

export type { PrismShapeWaveApi, Template1Config } from './template1Types';

function getApi(iframe: HTMLIFrameElement): PrismShapeWaveApi | null {
  const win = iframe.contentWindow as Window & { __prismShapeWave?: PrismShapeWaveApi };
  return win?.__prismShapeWave ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

export function mountTemplate1Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">Shape Wave — grid, waves, and backdrop. Move the pointer over the preview; click spawns a wave.</p>

    <div class="field">
      <label class="field__label" for="t1-bg">Backdrop</label>
      <input type="color" id="t1-bg" data-key="bgColor" value="#080808" />
    </div>

    <div class="field">
      <label class="field__label" for="t1-gap">Grid gap <span class="field__val" data-out="gap"></span>px</label>
      <input type="range" id="t1-gap" data-key="gap" min="16" max="96" step="1" />
    </div>

    <div class="field">
      <label class="field__label" for="t1-waveSpeed">Wave speed <span class="field__val" data-out="waveSpeed"></span></label>
      <input type="range" id="t1-waveSpeed" data-key="waveSpeed" min="200" max="4000" step="50" />
    </div>

    <div class="field">
      <label class="field__label" for="t1-waveWidth">Wave width <span class="field__val" data-out="waveWidth"></span></label>
      <input type="range" id="t1-waveWidth" data-key="waveWidth" min="40" max="500" step="5" />
    </div>

    <div class="field">
      <label class="field__label" for="t1-radius">Pointer radius <span class="field__val" data-out="radiusVmin"></span>%</label>
      <input type="range" id="t1-radius" data-key="radiusVmin" min="10" max="60" step="1" />
    </div>

    <details class="engine__advanced">
      <summary>Motion</summary>
      <div class="field">
        <label class="field__label" for="t1-speedIn">Ease in <span class="field__val" data-out="speedIn"></span></label>
        <input type="range" id="t1-speedIn" data-key="speedIn" min="5" max="95" step="1" />
      </div>
      <div class="field">
        <label class="field__label" for="t1-speedOut">Ease out <span class="field__val" data-out="speedOut"></span></label>
        <input type="range" id="t1-speedOut" data-key="speedOut" min="5" max="95" step="1" />
      </div>
      <div class="field">
        <label class="field__label" for="t1-rest">Rest scale <span class="field__val" data-out="restScale"></span></label>
        <input type="range" id="t1-rest" data-key="restScale" min="2" max="25" step="1" />
      </div>
    </details>

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

  function readSliderToConfig(key: string, input: HTMLInputElement): number | string {
    if (key === 'bgColor') return input.value;
    if (key === 'speedIn' || key === 'speedOut' || key === 'restScale') {
      const n = Number(input.value);
      if (key === 'restScale') return n / 100;
      return n / 100;
    }
    return Number(input.value);
  }

  function syncUIFromState(state: Template1Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template1Config;
      if (!key) return;
      const v = state[key];
      if (key === 'bgColor') {
        input.value = String(v);
      } else if (key === 'speedIn' || key === 'speedOut') {
        input.value = String(Math.round(Number(v) * 100));
      } else if (key === 'restScale') {
        input.value = String(Math.round(Number(v) * 100));
      } else {
        input.value = String(v);
      }
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template1Config;
      if (!key || !(key in state)) return;
      const v = state[key];
      if (key === 'speedIn' || key === 'speedOut' || key === 'restScale') {
        out.textContent = Number(v).toFixed(2);
      } else if (key === 'gap' || key === 'waveSpeed' || key === 'waveWidth' || key === 'radiusVmin') {
        out.textContent = String(Math.round(Number(v)));
      } else {
        out.textContent = String(v);
      }
    });
  }

  function pushFromInputs(): void {
    const api = getApi(iframe);
    if (!api) return;
    const partial: Partial<Template1Config> = {};
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template1Config;
      if (!key) return;
      const raw = readSliderToConfig(key, input);
      (partial as Record<string, number | string>)[key] = raw;
    });
    api.applyConfig(partial);
    syncUIFromState(api.getState());
  }

  function wire(): void {
    const api = getApi(iframe);
    if (!api) {
      setFeedback('Preview not ready — wait a moment.');
      return;
    }
    syncUIFromState(api.getState());

    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      input.addEventListener('input', () => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const key = input.dataset.key as keyof Template1Config;
        if (!key) return;
        (api2.applyConfig as (p: Partial<Template1Config>) => void)({
          [key]: readSliderToConfig(key, input),
        });
        syncUIFromState(api2.getState());
      });
    });

    el(host, '[data-action="reset"]')?.addEventListener('click', () => {
      const api2 = getApi(iframe);
      api2?.reset();
      const api3 = getApi(iframe);
      if (api3) syncUIFromState(api3.getState());
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
        setFeedback('Clipboard failed — copy manually from console.');
      }
    });

    el(host, '[data-action="download-html"]')?.addEventListener('click', async () => {
      const api2 = getApi(iframe);
      if (!api2) return;
      try {
        const html = await buildTemplate1StandaloneHtml(api2.getState());
        downloadTextFile('prism-shape-wave.html', html);
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
