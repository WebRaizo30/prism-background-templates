import type { Template2Config } from './template2Types';

function fragmentUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}templates/2/src/index.html`;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url}: ${res.status}`);
  }
  return res.text();
}

/**
 * Single self-contained HTML: full WebGL hero fragment + bootstrap before scripts run.
 */
export async function buildTemplate2StandaloneHtml(state: Template2Config): Promise<string> {
  const fragment = await fetchText(fragmentUrl());
  const bootstrapJson = JSON.stringify(state).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WebGL Hero — Prism export</title>
</head>
<body>
  <script>window.__PRISM_BOOTSTRAP=${bootstrapJson};</script>
${fragment}
</body>
</html>
`;
}
