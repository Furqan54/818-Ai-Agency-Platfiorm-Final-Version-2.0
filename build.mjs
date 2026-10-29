/* Builds the website into ./site
     1. writes every HTML page from src/templates + src/data
     2. bundles src/js (+ three.js + Lenis) into site/assets/app.js
     3. copies src/styles.css to site/assets/styles.css
   Run:  npm run build        (or  npm run watch  while you edit)       */
import { build as bundle } from 'esbuild';
import { mkdirSync, writeFileSync, copyFileSync, watch, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { services } from './src/data/site.js';

// always work from the project folder, wherever the command is run from (also fine with spaces in the path on Windows)
const HERE = fileURLToPath(new URL('.', import.meta.url));
process.chdir(HERE);
const OUT = 'site';

async function pages() {
  // re-import templates with a cache-buster so --watch picks up edits
  const v = '?v=' + Date.now();
  const t = await import(new URL('./src/templates/pages.js', import.meta.url).href + v);
  const files = {
    'index.html': t.home(),
    'about.html': t.about(),
    'services.html': t.servicesPage(),
    'contact.html': t.contact(),
  };
  services.forEach((s, i) => { files[`services/${s.slug}.html`] = t.servicePage(s, i); });
  mkdirSync(`${OUT}/services`, { recursive: true });
  for (const [name, html] of Object.entries(files)) writeFileSync(`${OUT}/${name}`, html);
  return Object.keys(files).length;
}

async function js() {
  await bundle({
    absWorkingDir: HERE, entryPoints: ['src/js/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020',
    outfile: `${OUT}/assets/app.js`, legalComments: 'none', logLevel: 'warning',
  });
}

async function all() {
  const t0 = Date.now();
  mkdirSync(`${OUT}/assets`, { recursive: true });
  copyFileSync('src/styles.css', `${OUT}/assets/styles.css`);
  const n = await pages();
  await js();
  console.log(`built ${n} pages + app.js + styles.css in ${Date.now() - t0} ms`);
}

await all();
if (process.argv.includes('--watch')) {
  let timer;
  for (const dir of ['src']) watch(dir, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(() => all().catch(console.error), 150); });
  console.log('watching src/ ...');
}
