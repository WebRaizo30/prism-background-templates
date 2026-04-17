import type { Template13Config } from './template13Types';

const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';

function assetUrl(file: 'style.css' | 'script.js'): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}templates/13/dist/${file}`;
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

export async function buildTemplate13StandaloneHtml(state: Template13Config): Promise<string> {
  const [css, js] = await Promise.all([fetchText(assetUrl('style.css')), fetchText(assetUrl('script.js'))]);

  const bootstrapJson = JSON.stringify(state).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Beesandbombs / davidope — Prism export</title>
  <style>
${css}
  </style>
</head>
<body>
  <script src="${THREE_CDN}"></script>
  <script>window.__PRISM_BOOTSTRAP=${bootstrapJson};</script>
  <script>
${escapeEmbeddedScript(js)}
  </script>
</body>
</html>
`;
}
