/* Small helpers + shared state (window size, mouse, device capabilities). */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = t => t * t * (3 - 2 * t);
export const r2 = v => Math.round(v * 100) / 100;

/* position of an element in the page (offsetTop/Left ignore CSS transforms, so this stays stable) */
export function docRect(el) {
  let x = 0, y = 0;
  for (let n = el; n; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

export const root = document.documentElement;
export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;

export const view = { w: innerWidth, h: innerHeight, docH: 0 };
export const mouse = { x: 0, y: 0, px: innerWidth / 2, py: innerHeight / 2, moved: false };   // x, y: -1..1

addEventListener('pointermove', e => {
  mouse.px = e.clientX; mouse.py = e.clientY;
  mouse.x = (e.clientX / view.w) * 2 - 1;
  mouse.y = (e.clientY / view.h) * 2 - 1;
  mouse.moved = true;
}, { passive: true });

/* same as docRect, but safe for elements that are hidden (display:none) */
export const docRectSafe = el => (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') ? { x: 0, y: 0, w: 0, h: 0 } : docRect(el);
