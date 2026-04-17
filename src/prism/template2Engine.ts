/**
 * Engine UI for template 2 (WebGL Shader Hero) — drives `window.__prismWebglHero` inside the iframe.
 */

import { buildTemplate2StandaloneHtml } from './exportTemplate2';
import { downloadTextFile } from './exportTemplate1';
import type { PrismWebglHeroApi, Template2Config } from './template2Types';

export type { PrismWebglHeroApi, Template2Config } from './template2Types';

function getApi(iframe: HTMLIFrameElement): PrismWebglHeroApi | null {
  const win = iframe.contentWindow as Window & { __prismWebglHero?: PrismWebglHeroApi };
  return win?.__prismWebglHero ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

export function mountTemplate2Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">WebGL hero — time, pointer smoothing, and scene colors. Pause freezes animation.</p>

    <div class="field">
      <label class="field__label" for="t2-nebula1">Nebula A</label>
      <input type="color" id="t2-nebula1" data-key="nebula1" value="#4d267f" />
    </div>
    <div class="field">
      <label class="field__label" for="t2-nebula2">Nebula B</label>
      <input type="color" id="t2-nebula2" data-key="nebula2" value="#264d99" />
    </div>
    <div class="field">
      <label class="field__label" for="t2-edgeTint">Rim glow</label>
      <input type="color" id="t2-edgeTint" data-key="edgeTint" value="#99b3ff" />
    </div>
    <div class="field">
      <label class="field__label" for="t2-sssTint">Soft light (SSS)</label>
      <input type="color" id="t2-sssTint" data-key="sssTint" value="#ff99cc" />
    </div>
    <div class="field">
      <label class="field__label" for="t2-grade">Final grade</label>
      <input type="color" id="t2-grade" data-key="grade" value="#f5fcff" />
    </div>

    <div class="field">
      <label class="field__label" for="t2-timeScale">Time scale <span class="field__val" data-out="timeScale"></span></label>
      <input type="range" id="t2-timeScale" data-key="timeScale" min="0.25" max="2" step="0.05" />
    </div>

    <div class="field">
      <label class="field__label" for="t2-mouseSmooth">Pointer smoothing <span class="field__val" data-out="mouseSmooth"></span></label>
      <input type="range" id="t2-mouseSmooth" data-key="mouseSmooth" min="0.02" max="0.3" step="0.01" />
    </div>

    <div class="field">
      <label class="field__label" for="t2-paused">Pause</label>
      <input type="checkbox" id="t2-paused" data-key="paused" />
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

  function syncUIFromState(state: Template2Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template2Config;
      if (!key) return;
      const v = state[key];
      if (input.type === 'checkbox') {
        input.checked = Boolean(v);
      } else if (input.type === 'color') {
        input.value = String(v);
      } else {
        input.value = String(v);
      }
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template2Config;
      if (!key || !(key in state)) return;
      const v = state[key];
      out.textContent = typeof v === 'number' ? Number(v).toFixed(2) : String(v);
    });
  }

  let state: Template2Config = {
    timeScale: 1,
    mouseSmooth: 0.05,
    paused: false,
    nebula1: '#4d267f',
    nebula2: '#264d99',
    edgeTint: '#99b3ff',
    sssTint: '#ff99cc',
    grade: '#f5fcff',
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
        const key = input.dataset.key as keyof Template2Config;
        if (!key) return;
        if (input.type === 'checkbox') {
          api2.applyConfig({ [key]: input.checked } as Partial<Template2Config>);
        } else if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template2Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template2Config>);
        }
        state = api2.getState();
        syncUIFromState(state);
      });
      input.addEventListener('change', () => {
        const api2 = getApi(iframe);
        if (!api2) return;
        const key = input.dataset.key as keyof Template2Config;
        if (!key) return;
        if (input.type === 'checkbox') {
          api2.applyConfig({ [key]: input.checked } as Partial<Template2Config>);
        } else if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template2Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template2Config>);
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
        const html = await buildTemplate2StandaloneHtml(api2.getState());
        downloadTextFile('prism-webgl-hero.html', html);
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
