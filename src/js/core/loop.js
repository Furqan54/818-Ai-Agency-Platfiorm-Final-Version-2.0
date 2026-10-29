/* ONE requestAnimationFrame loop for the whole site, plus Lenis smooth scrolling.
   Every effect registers a "task":  { measure(), update(frame) }
     measure()      called when the window size / layout changes (the only place layout is read)
     update(frame)  called every frame; frame = { dt, y, velocity, time }
   Effects only write transform / opacity, so scrolling stays smooth. */
import Lenis from 'lenis';
import { $, view, root, REDUCED } from './env.js';

const tasks = [];
export const frame = { dt: 0, y: 0, velocity: 0, time: 0 };
let lenis = null, started = false;

export function add(task) {
  tasks.push(task);
  if (started && task.measure) task.measure();
  return task;
}

export function measureAll() {
  view.w = innerWidth; view.h = innerHeight; view.docH = root.scrollHeight;
  for (const t of tasks) t.measure && t.measure();
}

/* smooth scroll to #id links on the same page */
function bindAnchors() {
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id.length > 1 ? $(id) : null;
    if (id !== '#top' && !target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, { offset: -70, duration: 1.6 });
    else (target || document.body).scrollIntoView({ behavior: 'auto' });
  });
}

export function start() {
  if (!REDUCED) {
    // lerp = how "buttery" it feels: lower = longer glide. 0.085 is soft but still responsive.
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, touchMultiplier: 1.4 });
    // when the mobile menu is open the page must not scroll behind it
    root.addEventListener('menu:toggle', e => (e.detail ? lenis.stop() : lenis.start()));
  }
  bindAnchors();

  started = true;
  measureAll();
  let timer = 0;
  addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(measureAll, 120); });
  // fonts, images and the DOM changing size all change the layout
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureAll);
  addEventListener('load', measureAll);
  if ('ResizeObserver' in window) { let h = 0; new ResizeObserver(() => { if (document.body.scrollHeight !== h) { h = document.body.scrollHeight; measureAll(); } }).observe(document.body); }

  if (REDUCED) {
    /* reduced motion: no animation loop. The picture is redrawn only when something changes: scrolling, resizing,
       and a few times while the page's pictures finish loading (they arrive after the first draw). */
    const redraw = () => { frame.y = scrollY; for (const t of tasks) t.update && t.update({ ...frame, still: true }); };
    let queued = false;
    const ask = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; redraw(); }); };
    redraw();
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask);
    addEventListener('load', ask);
    let n = 0; const iv = setInterval(() => { ask(); if (++n > 40) clearInterval(iv); }, 250);
    return;
  }

  let prev = performance.now(), prevY = scrollY;
  function tick(now) {
    frame.dt = Math.min(0.05, (now - prev) / 1000); prev = now;
    frame.time += frame.dt;
    if (lenis) lenis.raf(now);
    frame.y = lenis ? lenis.scroll : scrollY;
    frame.velocity = lenis ? lenis.velocity : frame.y - prevY; prevY = frame.y;
    for (const t of tasks) t.update && t.update(frame);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
