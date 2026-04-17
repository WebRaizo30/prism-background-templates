import type { Template17Config } from './template17Types';

function assetUrl(file: 'style.css' | 'script.js'): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}templates/17/dist/${file}`;
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

export async function buildTemplate17StandaloneHtml(state: Template17Config): Promise<string> {
  const [css, js] = await Promise.all([fetchText(assetUrl('style.css')), fetchText(assetUrl('script.js'))]);

  const bootstrapJson = JSON.stringify(state).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rays background — Prism export</title>
  <style>
${css}
  </style>
</head>
<body>
  <section class="wrapper" id="rays-wrapper">
    <div class="hero"></div>
    <div class="content">
      <h1 class="h1--scalingSize" id="rays-title" data-text="RAIZO">RAIZO</h1>
      <input type="checkbox" id="switch" />
      <label for="switch"><span><span class="icon">→</span> switch bg</span></label>
    </div>
  </section>
  <script>window.__PRISM_BOOTSTRAP=${bootstrapJson};</script>
  <script>
${escapeEmbeddedScript(js)}
  </script>
</body>
</html>
`;
}
