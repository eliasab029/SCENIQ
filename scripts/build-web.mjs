/**
 * Builds the SCENIQ web app into ./dist.
 *
 *   node scripts/build-web.mjs                    → served from the domain root
 *   EXPO_BASE_URL=/sceniq node scripts/...     → served from a sub-path (GitHub Pages)
 *
 * Steps: expo export (web) → add PWA / iOS meta tags → 404.html fallback → .nojekyll
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const base = (process.env.EXPO_BASE_URL ?? '').replace(/\/+$/, '');

const result = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', 'dist', '--clear'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, CI: '1' },
});
if (result.status !== 0) process.exit(result.status ?? 1);

const indexPath = join(dist, 'index.html');
let html = readFileSync(indexPath, 'utf8');

const head = `
    <meta name="description" content="Die passende Musik für deine Instagram Story." />
    <meta name="color-scheme" content="dark" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="SCENIQ" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="manifest" href="${base}/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="${base}/apple-touch-icon.png" />
    <style>html, body { background: #0A0A0C; }</style>
  </head>`;

html = html
  .replace('<html lang="en">', '<html lang="de">')
  // viewport-fit=cover lets the app draw under the notch; safe areas are handled in React
  .replace(
    /<meta name="viewport" content="[^"]*"\s*\/?>/,
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />',
  )
  .replace('</head>', head);

writeFileSync(indexPath, html);
// GitHub Pages serves 404.html for unknown paths → deep links (e.g. /settings) still open the app
copyFileSync(indexPath, join(dist, '404.html'));
// Without this, GitHub Pages (Jekyll) would hide the "_expo" folder
writeFileSync(join(dist, '.nojekyll'), '');

console.log(`\n✓ Web build ready in dist/ (base URL: "${base || '/'}")`);
