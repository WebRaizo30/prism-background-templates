import type { Template8Config } from './template8Types';

function assetUrl(file: 'style.css' | 'script.js'): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}templates/8/dist/${file}`;
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

export async function buildTemplate8StandaloneHtml(state: Template8Config): Promise<string> {
  const [css, js] = await Promise.all([fetchText(assetUrl('style.css')), fetchText(assetUrl('script.js'))]);

  const bootstrapJson = JSON.stringify(state).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hearts — Prism export</title>
  <style>
${css}
  </style>
</head>
<body>
  <svg id="hearts" viewBox="-600 -400 1200 800" preserveAspectRatio="xMidYMid slice">
    <defs>
      <symbol id="heart" viewBox="-69 -16 138 138">
        <path d="M0,12
                 C 50,-30 110,50  0,120
                 C-110,50 -50,-30 0,12z"/>
      </symbol>
    </defs>
  </svg>
  <script>window.__PRISM_BOOTSTRAP=${bootstrapJson};</script>
  <script>
${escapeEmbeddedScript(js)}
  </script>
</body>
</html>
`;
}
