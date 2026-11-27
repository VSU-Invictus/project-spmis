import { defineConfig, type Connect, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const MOCKUP_ROOT = fileURLToPath(new URL('../mockup', import.meta.url));

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

/** Serves the static M1 mockup under /mockup/* (dev + preview) so React routes can embed it unchanged. */
function serveMockup(): Plugin {
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url?.startsWith('/mockup/')) return next();
    const pathname = decodeURIComponent(req.url.split('?')[0].slice('/mockup/'.length));
    const file = resolve(MOCKUP_ROOT, pathname);
    if (!file.startsWith(MOCKUP_ROOT + sep) || !existsSync(file) || !statSync(file).isFile()) return next();
    res.setHeader('Content-Type', MIME[extname(file).toLowerCase()] ?? 'application/octet-stream');
    createReadStream(file).pipe(res);
  };
  return {
    name: 'serve-mockup',
    configureServer: (server) => void server.middlewares.use(handler),
    configurePreviewServer: (server) => void server.middlewares.use(handler)
  };
}

/** Serve the worker that ships with the installed MSW version, only in Vite dev. */
function serveMockWorker(): Plugin {
  return {
    name: 'serve-mock-worker',
    configureServer(server) {
      const workerPath = createRequire(import.meta.url).resolve('msw/mockServiceWorker.js');
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' || req.url !== '/mockServiceWorker.js') return next();
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        createReadStream(workerPath).pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serveMockup(), serveMockWorker()],
  test: {
    environment: 'node',
    setupFiles: ['./src/mocks/setupTests.ts'],
  },
  server: {
    // Allow importing the shared design tokens from ../mockup/assets/css.
    fs: { allow: ['..'] }
  }
});
