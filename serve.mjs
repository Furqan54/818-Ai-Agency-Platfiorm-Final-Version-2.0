/* Tiny static server for local preview:  npm start   ->  http://localhost:8818 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon' };
const ROOT = resolve(fileURLToPath(new URL('./site/', import.meta.url)));   // works with spaces and drive letters on Windows
createServer(async (req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
  if (p.endsWith('/')) p += 'index.html';
  const file = resolve(ROOT, '.' + p);
  if (file !== ROOT && !file.startsWith(ROOT + sep)) { res.writeHead(403).end(); return; }   // never serve files outside site/
  try { const data = await readFile(file); res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream' }).end(data); }
  catch { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); }
}).listen(Number(process.env.PORT) || 8818, () => console.log('http://localhost:' + (process.env.PORT || 8818)));
