import './styles.css';
import { TEMPLATE_CATALOG, previewUrl } from './catalog';
import { mountTemplate1Engine } from './prism/template1Engine';
import { mountTemplate2Engine } from './prism/template2Engine';
import { mountTemplate3Engine } from './prism/template3Engine';
import { mountTemplate4Engine } from './prism/template4Engine';
import { mountTemplate5Engine } from './prism/template5Engine';
import { mountTemplate6Engine } from './prism/template6Engine';
import { mountTemplate7Engine } from './prism/template7Engine';
import { mountTemplate8Engine } from './prism/template8Engine';
import { mountTemplate9Engine } from './prism/template9Engine';
import { mountTemplate10Engine } from './prism/template10Engine';
import { mountTemplate11Engine } from './prism/template11Engine';
import { mountTemplate12Engine } from './prism/template12Engine';
import { mountTemplate13Engine } from './prism/template13Engine';
import { mountTemplate14Engine } from './prism/template14Engine';
import { mountTemplate15Engine } from './prism/template15Engine';
import { mountTemplate16Engine } from './prism/template16Engine';
import { mountTemplate17Engine } from './prism/template17Engine';
import { buildShareableUrl, parseRoute, syncPreviewUrl } from './route';

function render(): void {
  const root = document.querySelector<HTMLDivElement>('#app');
  if (!root) return;

  const route = parseRoute();
  /* Only the template preview page locks the document; gallery scrolls naturally */
  document.body.classList.toggle('prism-no-doc-scroll', route.view === 'preview');

  if (route.view === 'gallery') {
    root.classList.remove('app--preview');
    const u = new URL(window.location.href);
    if (u.searchParams.has('id')) {
      u.searchParams.delete('id');
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    }

    const preview = (id: number) => previewUrl(id);
    root.innerHTML = `
      <div class="shell shell--home">
        <header class="home-hero">
          <div class="home-brand">
            <img
              class="home-brand__logo"
              src="/prism-logo.svg"
              width="48"
              height="48"
              alt=""
            />
            <div class="home-brand__text">
              <h1 class="home-brand__title">Prism</h1>
              <p class="home-brand__tagline">Background templates · Engine · JSON</p>
            </div>
          </div>
          <p class="home-lead">
            <strong>${TEMPLATE_CATALOG.length} base templates</strong> — each is a starting point. Use the
            <strong>Engine</strong> to tune colors, motion, and parameters and generate effectively
            <strong>unlimited</strong> variants. <strong>#1 Shape Wave</strong> also exports a single offline
            <span class="home-lead__mono">.html</span>.
          </p>
        </header>

        <ul class="home-grid" role="list">
          ${TEMPLATE_CATALOG.map(
            (t) => `
            <li class="home-card">
              <div class="home-card__preview">
                <iframe
                  class="home-card__iframe"
                  title="${escapeHtml(t.title)} preview"
                  src="${preview(t.id)}"
                  loading="lazy"
                  scrolling="no"
                  sandbox="allow-scripts allow-same-origin"
                ></iframe>
              </div>
              <a
                class="home-card__link"
                href="?id=${t.id}#/preview/${t.id}"
                title="${escapeHtml(t.description)}"
              >
                <span class="home-card__row">
                  <span class="home-card__id">${String(t.id).padStart(2, '0')}</span>
                  <span class="home-card__stack">${escapeHtml(t.stack)}</span>
                </span>
                <span class="home-card__title">${escapeHtml(t.title)}</span>
                <span class="home-card__cta">Open <span aria-hidden="true">→</span></span>
              </a>
            </li>`,
          ).join('')}
        </ul>

        <footer class="home-footer">
          <a
            class="home-footer__link"
            href="https://x.com/WebRaizo"
            target="_blank"
            rel="noopener noreferrer"
          >powered by RAIZO</a>
        </footer>
      </div>`;
    return;
  }

  root.classList.add('app--preview');

  const templateId = route.id;
  syncPreviewUrl(templateId);

  const src = previewUrl(templateId);
  const entry = TEMPLATE_CATALOG.find((t) => t.id === templateId);
  const title = entry?.title ?? `Template ${templateId}`;
  const shareUrl = buildShareableUrl(templateId);

  root.innerHTML = `
    <div class="shell shell--preview">
      <header class="preview-bar">
        <a class="back" href="?#/">← Gallery</a>
        <span class="preview-bar__title">${escapeHtml(title)}</span>
        <span class="preview-bar__hint">#${templateId}</span>
      </header>
      <div class="preview-layout">
        <div class="preview-frame-wrap">
          <iframe
            class="preview-frame"
            data-prism-preview
            title="${escapeHtml(title)}"
            src="${src}"
            scrolling="no"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
        </div>
        <aside class="engine" aria-labelledby="engine-title">
          <div class="engine__toolbar">
            <button type="button" class="btn btn--primary btn--sm" data-action="copy-link">
              Copy preview link
            </button>
            <a class="btn btn--ghost btn--sm" href="${src}" target="_blank" rel="noopener noreferrer">
              Open raw HTML
            </a>
          </div>
          <div id="prism-engine-root" class="engine__body"></div>
        </aside>
      </div>
    </div>`;

  const iframe =
    root.querySelector<HTMLIFrameElement>('iframe[data-prism-preview]') ??
    root.querySelector<HTMLIFrameElement>('.preview-frame-wrap iframe') ??
    root.querySelector<HTMLIFrameElement>('iframe.preview-frame');
  const engineRoot = root.querySelector<HTMLDivElement>('#prism-engine-root');

  if (templateId === 1 && iframe && engineRoot) {
    mountTemplate1Engine(engineRoot, iframe);
  } else if (templateId === 2 && iframe && engineRoot) {
    mountTemplate2Engine(engineRoot, iframe);
  } else if (templateId === 3 && iframe && engineRoot) {
    mountTemplate3Engine(engineRoot, iframe);
  } else if (templateId === 4 && iframe && engineRoot) {
    mountTemplate4Engine(engineRoot, iframe);
  } else if (templateId === 5 && iframe && engineRoot) {
    mountTemplate5Engine(engineRoot, iframe);
  } else if (templateId === 6 && iframe && engineRoot) {
    mountTemplate6Engine(engineRoot, iframe);
  } else if (templateId === 7 && iframe && engineRoot) {
    mountTemplate7Engine(engineRoot, iframe);
  } else if (templateId === 8 && iframe && engineRoot) {
    mountTemplate8Engine(engineRoot, iframe);
  } else if (templateId === 9 && iframe && engineRoot) {
    mountTemplate9Engine(engineRoot, iframe);
  } else if (templateId === 10 && iframe && engineRoot) {
    mountTemplate10Engine(engineRoot, iframe);
  } else if (templateId === 11 && iframe && engineRoot) {
    mountTemplate11Engine(engineRoot, iframe);
  } else if (templateId === 12 && iframe && engineRoot) {
    mountTemplate12Engine(engineRoot, iframe);
  } else if (templateId === 13 && iframe && engineRoot) {
    mountTemplate13Engine(engineRoot, iframe);
  } else if (templateId === 14 && iframe && engineRoot) {
    mountTemplate14Engine(engineRoot, iframe);
  } else if (templateId === 15 && iframe && engineRoot) {
    mountTemplate15Engine(engineRoot, iframe);
  } else if (templateId === 16 && iframe && engineRoot) {
    mountTemplate16Engine(engineRoot, iframe);
  } else if (templateId === 17 && iframe && engineRoot) {
    mountTemplate17Engine(engineRoot, iframe);
  } else if (engineRoot) {
    engineRoot.innerHTML = `
      <h2 class="engine__title" id="engine-title">Engine</h2>
      <p class="engine__hint">Controls for this template are not wired yet. Try <strong>#1 · Shape Wave</strong> for the full Engine.</p>
    `;
  }

  const copyBtn = root.querySelector<HTMLButtonElement>('[data-action="copy-link"]');
  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy preview link';
      }, 1600);
    } catch {
      copyBtn.textContent = 'Copy failed';
      setTimeout(() => {
        copyBtn.textContent = 'Copy preview link';
      }, 2000);
    }
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.addEventListener('hashchange', render);
window.addEventListener('popstate', render);
render();
