import type { Template1Config } from './template1Types';

function assetUrl(file: 'style.css' | 'script.js'): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}templates/1/dist/${file}`;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url}: ${res.status}`);
  }
  return res.text();
}

/** Avoid closing `</script>` inside inlined JS when embedded in HTML. */
function escapeEmbeddedScript(js: string): string {
  return js.replace(/<\/script>/gi, '<\\/script>');
}

/**
 * Single self-contained HTML file: inlined CSS + bootstrap config + full script.
 * Open locally or host anywhere; no Prism app required.
 */
export async function buildTemplate1StandaloneHtml(state: Template1Config): Promise<string> {
  const [css, js] = await Promise.all([
    fetchText(assetUrl('style.css')),
    fetchText(assetUrl('script.js')),
  ]);

  const bootstrapJson = JSON.stringify(state).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shape Wave — Prism export</title>
  <style>
${css}
  </style>
</head>
<body>
  <canvas></canvas>
  <script>window.__PRISM_BOOTSTRAP=${bootstrapJson};</script>
  <script>
${escapeEmbeddedScript(js)}
  </script>
</body>
</html>
`;
}

export function downloadTextFile(filename: string, content: string, mime = 'text/html;charset=utf-8'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
