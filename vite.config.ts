import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesRoot = path.resolve(__dirname, 'templates');

function mimeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const m: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.map': 'application/json',
    '.scss': 'text/plain; charset=utf-8',
    '.sass': 'text/plain; charset=utf-8',
    '.ts': 'text/plain; charset=utf-8',
    '.pug': 'text/plain; charset=utf-8',
    '.haml': 'text/plain; charset=utf-8',
  };
  return m[ext] ?? 'application/octet-stream';
}

function serveTemplates(): Plugin {
  return {
    name: 'prism-serve-templates',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url?.split('?')[0] ?? '';
        if (!raw.startsWith('/templates/')) {
          next();
          return;
        }
        const rel = decodeURIComponent(raw.slice('/templates/'.length));
        const abs = path.normalize(path.join(templatesRoot, rel));
        if (!abs.startsWith(templatesRoot)) {
          res.statusCode = 403;
          res.end();
          return;
        }
        if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
          next();
          return;
        }
        res.setHeader('Content-Type', mimeFor(abs));
        fs.createReadStream(abs).pipe(res);
      });
    },
    closeBundle() {
      const out = path.resolve(__dirname, 'dist/templates');
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.cpSync(templatesRoot, out, { recursive: true });
    },
  };
}

export default defineConfig({
  root: __dirname,
  plugins: [serveTemplates()],
});
