export const TEMPLATE_ID_MIN = 1;
export const TEMPLATE_ID_MAX = 17;

function isValidTemplateId(n: number): boolean {
  return Number.isInteger(n) && n >= TEMPLATE_ID_MIN && n <= TEMPLATE_ID_MAX;
}

export type AppRoute = { view: 'gallery' } | { view: 'preview'; id: number };

/**
 * If `#...` is present, it wins (explicit navigation).
 * If there is **no** hash, `?id=` can open a preview (share link).
 */
export function parseRoute(): AppRoute {
  const rawHash = window.location.hash.slice(1);

  if (rawHash.length > 0) {
    const h = rawHash.startsWith('/') ? rawHash : `/${rawHash}`;
    const previewFromHash = h.match(/^\/preview\/(\d+)$/);
    if (previewFromHash) {
      const id = Number(previewFromHash[1]);
      if (isValidTemplateId(id)) return { view: 'preview', id };
    }
    if (h === '/' || h === '') {
      return { view: 'gallery' };
    }
  }

  const params = new URLSearchParams(window.location.search);
  const q = params.get('id');
  if (q !== null) {
    const n = Number(q);
    if (isValidTemplateId(n)) return { view: 'preview', id: n };
  }

  return { view: 'gallery' };
}

/** Keep `?id=` and `#/preview/:id` in sync for shareable URLs. */
export function syncPreviewUrl(id: number): void {
  const url = new URL(window.location.href);
  url.searchParams.set('id', String(id));
  url.hash = `/preview/${id}`;
  if (url.toString() !== window.location.href) {
    history.replaceState(null, '', url.toString());
  }
}

export function buildShareableUrl(id: number): string {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('id', String(id));
  url.hash = `/preview/${id}`;
  return url.toString();
}
