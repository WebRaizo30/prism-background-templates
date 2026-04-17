import type { Template7Config } from './template7Types';

function assetUrl(file: 'style.css' | 'script.js'): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}templates/7/dist/${file}`;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url}: ${res.status}`);
  }
  return res.text();
}

function escapeEmbeddedScript(js: string): string {
  return js.replace(/<\/script>/gi, '<\\/script>');
}

export async function buildTemplate7StandaloneHtml(state: Template7Config): Promise<string> {
  const [css, js] = await Promise.all([fetchText(assetUrl('style.css')), fetchText(assetUrl('script.js'))]);

  const bootstrapJson = JSON.stringify(state).replace(/</g, '\\u003c');

  const label = escapeHtml(state.labelText || 'RAIZO');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Warning stripes — Prism export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet" />
  <style>
${css}
  </style>
</head>
<body>
  <div class="stripe">
    <div class="stripe_inner" id="stripe-label">${label}</div>
  </div>
  <script>window.__PRISM_BOOTSTRAP=${bootstrapJson};</script>
  <script>
${escapeEmbeddedScript(js)}
  </script>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
