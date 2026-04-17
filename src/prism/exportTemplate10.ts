import type { Template10Config } from './template10Types';

function assetUrl(file: 'style.css' | 'script.js' | 'index.html'): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}templates/10/dist/${file}`;
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

export async function buildTemplate10StandaloneHtml(state: Template10Config): Promise<string> {
  const [htmlRaw, css, js] = await Promise.all([
    fetchText(assetUrl('index.html')),
    fetchText(assetUrl('style.css')),
    fetchText(assetUrl('script.js')),
  ]);

  const bootstrapJson = JSON.stringify(state).replace(/</g, '\\u003c');

  return htmlRaw
    .replace(/<link rel="stylesheet" href="\.\/style\.css">/, `<style>\n${css}\n</style>`)
    .replace(
      /<script src="\.\/script\.js"><\/script>/,
      `<script>window.__PRISM_BOOTSTRAP=${bootstrapJson};</script>\n<script>\n${escapeEmbeddedScript(js)}\n</script>`,
    );
}
