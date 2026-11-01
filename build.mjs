/* Builds the website into ./site
     1. writes every HTML page from src/templates + src/data
     2. bundles src/js (+ three.js + Lenis) into site/assets/app.js
     3. copies src/styles.css to site/assets/styles.css
     4. writes site/sitemap.xml and site/robots.txt (what Google reads to find every page)
   Run:  npm run build        (or  npm run watch  while you edit)       */
import { build as bundle } from 'esbuild';
import { mkdirSync, writeFileSync, copyFileSync, readFileSync, watch, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { services, site } from './src/data/site.js';
import { pageUrl } from './src/templates/seo.js';

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

  // sitemap.xml = the list of every page for Google;  robots.txt = "everything may be read" + where the sitemap is
  const urls = Object.keys(files).map(name => `  <url><loc>${pageUrl(name)}</loc></url>`).join('\n');
  writeFileSync(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  writeFileSync(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
  return Object.keys(files).length;
}

/** A short code taken from a file's contents. It changes only when the file changes (used as ?v=... in the page links). */
function fingerprint(file) {
  return existsSync(file) ? createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 8) : '';
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
  await js();
  // the pages link to app.js / styles.css / bg-image.js with ?v=<fingerprint>, so they are built last
  globalThis.ASSET_VER = {
    'app.js': fingerprint(`${OUT}/assets/app.js`),
    'styles.css': fingerprint(`${OUT}/assets/styles.css`),
    'bg-image.js': fingerprint(`${OUT}/assets/bg-image.js`),
  };
  const n = await pages();
  console.log(`built ${n} pages + sitemap + robots + app.js + styles.css in ${Date.now() - t0} ms`);
}

await all();
if (process.argv.includes('--watch')) {
  let timer;
  for (const dir of ['src']) watch(dir, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(() => all().catch(console.error), 150); });
  console.log('watching src/ ...');
}
