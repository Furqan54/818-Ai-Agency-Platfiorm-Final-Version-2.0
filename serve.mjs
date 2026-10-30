/* Tiny static server for local preview:  npm start   ->  http://localhost:8818 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg' };
const ROOT = resolve(fileURLToPath(new URL('./site/', import.meta.url)));   // works with spaces and drive letters on Windows
createServer(async (req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
  if (p.endsWith('/')) p += 'index.html';
  const file = resolve(ROOT, '.' + p);
  if (file !== ROOT && !file.startsWith(ROOT + sep)) { res.writeHead(403).end(); return; }   // never serve files outside site/
  try {
    const data = await readFile(file);
    const head = { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Accept-Ranges': 'bytes' };
    // audio needs "partial content" answers, otherwise the browser cannot jump around inside the clip
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m && (m[1] || m[2])) {
      let a = m[1] === '' ? Math.max(0, data.length - Number(m[2])) : Number(m[1]);
      let b = m[1] === '' || m[2] === '' ? data.length - 1 : Math.min(Number(m[2]), data.length - 1);
      if (a > b || a >= data.length) { res.writeHead(416, { 'Content-Range': `bytes */${data.length}` }).end(); return; }
      res.writeHead(206, { ...head, 'Content-Range': `bytes ${a}-${b}/${data.length}`, 'Content-Length': b - a + 1 }).end(data.subarray(a, b + 1));
      return;
    }
    res.writeHead(200, { ...head, 'Content-Length': data.length }).end(data);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); }
}).listen(Number(process.env.PORT) || 8818, () => console.log('http://localhost:' + (process.env.PORT || 8818)));
