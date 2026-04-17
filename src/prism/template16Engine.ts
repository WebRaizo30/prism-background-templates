/**
 * Engine UI for template 16 (CSS random background cycle) — drives `window.__prismRandomBg` in the iframe.
 */

import { downloadTextFile } from './exportTemplate1';
import { buildTemplate16StandaloneHtml } from './exportTemplate16';
import type { PrismRandomBgApi, Template16Config } from './template16Types';

export type { PrismRandomBgApi, Template16Config } from './template16Types';

function getApi(iframe: HTMLIFrameElement): PrismRandomBgApi | null {
  const win = iframe.contentWindow as Window & { __prismRandomBg?: PrismRandomBgApi };
  return win?.__prismRandomBg ?? null;
}

function el<K extends keyof HTMLElementTagNameMap>(
  parent: ParentNode,
  sel: K,
): HTMLElementTagNameMap[K] | null {
  return parent.querySelector(sel);
}

export function mountTemplate16Engine(host: HTMLElement, iframe: HTMLIFrameElement): void {
  host.innerHTML = `
    <h2 class="engine__title" id="engine-title">Engine</h2>
    <p class="engine__lead">CSS keyframe loop — cycle duration, stop colors (0/100%, 15–75%), and center box.</p>

    <div class="field">
      <label class="field__label" for="t16-dur">Cycle duration (s) <span class="field__val" data-out="animDurationSec"></span></label>
      <input type="range" id="t16-dur" data-key="animDurationSec" min="0.5" max="60" step="0.5" />
    </div>

    <div class="field">
      <label class="field__label" for="t16-e">0% / 100% (edge)</label>
      <input type="color" id="t16-e" data-key="edgeColor" value="#ffffff" />
    </div>
    <div class="field">
      <label class="field__label" for="t16-15">15%</label>
      <input type="color" id="t16-15" data-key="band15" value="#ff0000" />
    </div>
    <div class="field">
      <label class="field__label" for="t16-30">30%</label>
      <input type="color" id="t16-30" data-key="band30" value="#ffff00" />
    </div>
    <div class="field">
      <label class="field__label" for="t16-45">45%</label>
      <input type="color" id="t16-45" data-key="band45" value="#008000" />
    </div>
    <div class="field">
      <label class="field__label" for="t16-60">60%</label>
      <input type="color" id="t16-60" data-key="band60" value="#0000ff" />
    </div>
    <div class="field">
      <label class="field__label" for="t16-75">75%</label>
      <input type="color" id="t16-75" data-key="band75" value="#ffffff" />
    </div>

    <div class="field">
      <label class="field__label" for="t16-cb">Center box</label>
      <input type="color" id="t16-cb" data-key="centerBg" value="#debe94" />
    </div>
    <div class="field">
      <label class="field__label" for="t16-cs">Center size (px) <span class="field__val" data-out="centerSizePx"></span></label>
      <input type="range" id="t16-cs" data-key="centerSizePx" min="40" max="400" step="5" />
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

  function syncUIFromState(s: Template16Config): void {
    host.querySelectorAll<HTMLInputElement>('[data-key]').forEach((input) => {
      const key = input.dataset.key as keyof Template16Config;
      if (!key) return;
      input.value = String(s[key]);
    });
    host.querySelectorAll<HTMLElement>('[data-out]').forEach((out) => {
      const key = out.dataset.out as keyof Template16Config;
      if (!key || !(key in s)) return;
      const v = s[key];
      if (typeof v === 'number') {
        out.textContent = key === 'centerSizePx' ? String(Math.round(v)) : Number(v).toFixed(1);
      }
    });
  }

  let state: Template16Config = {
    animDurationSec: 5,
    edgeColor: '#ffffff',
    band15: '#ff0000',
    band30: '#ffff00',
    band45: '#008000',
    band60: '#0000ff',
    band75: '#ffffff',
    centerBg: '#debe94',
    centerSizePx: 100,
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
        const key = input.dataset.key as keyof Template16Config;
        if (!key) return;
        if (input.type === 'color') {
          api2.applyConfig({ [key]: input.value } as Partial<Template16Config>);
        } else {
          api2.applyConfig({ [key]: Number(input.value) } as Partial<Template16Config>);
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
        const html = await buildTemplate16StandaloneHtml(api2.getState());
        downloadTextFile('prism-random-bg.html', html);
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
