/* Big picture frames that live in 3D: [data-frame]
   - they lean back as they arrive from the bottom of the screen
   - they follow the cursor while you hover them, and sway gently when you do not
   - children with translateZ (the floating chips) pop out of the picture */
import { $$, view, mouse, clamp, lerp, r2, docRect, FINE } from '../core/env.js';
import { add } from '../core/loop.js';

export function initFrames() {
  const items = $$('[data-frame]').map((el, i) => ({ el, i, top: 0, h: 0, rx: 0, ry: 0, tx: 0, ty: 0, hover: false, last: '' }));
  if (!items.length) return;
  for (const it of items) {
    if (!FINE) continue;
    it.el.addEventListener('pointerenter', () => { it.hover = true; });
    it.el.addEventListener('pointermove', e => {
      const r = it.el.getBoundingClientRect();
      const px = clamp((e.clientX - r.left) / r.width), py = clamp((e.clientY - r.top) / r.height);
      it.tx = (0.5 - py) * 2 * 7; it.ty = (px - 0.5) * 2 * 10;
    });
    it.el.addEventListener('pointerleave', () => { it.hover = false; });
  }
  add({
    measure() { for (const it of items) { const d = docRect(it.el); it.top = d.y; it.h = d.h; } },
    update({ y, dt, time }) {
      const k = 1 - Math.exp(-dt * 6);
      for (const it of items) {
        const c = (it.top + it.h / 2 - y) / view.h;                // 0.5 = middle of the screen
        if (c < -0.8 || c > 1.8) continue;
        const lean = clamp((c - 0.5) * -14, -9, 9);                // leans back while below the middle
        const sway = Math.sin(time * 0.5 + it.i * 1.7);
        const gx = it.hover ? it.tx : lean + sway * 0.8, gy = it.hover ? it.ty : sway * 2.2;
        it.rx = lerp(it.rx, gx, k); it.ry = lerp(it.ry, gy, k);
        const css = `perspective(1300px) rotateX(${r2(it.rx)}deg) rotateY(${r2(it.ry)}deg)`;
        if (css !== it.last) { it.last = css; it.el.style.transform = css; }
      }
    },
  });
}

/* Inner page hero: the picture sits in 3D, slides slower than the page and turns toward the mouse */
export function initParallax() {
  const els = $$('[data-parallax]');
  if (!els.length) return;
  const items = els.map(el => ({ el, h: 0, mx: 0, my: 0, last: '' }));
  add({
    measure() { for (const it of items) it.h = it.el.parentElement.offsetHeight; },
    update({ y, dt }) {
      const k = 1 - Math.exp(-dt * 4);
      for (const it of items) {
        if (y > it.h + 100) continue;
        it.mx = lerp(it.mx, FINE ? mouse.x : 0, k); it.my = lerp(it.my, FINE ? mouse.y : 0, k);
        const css = `perspective(1400px) translate3d(${r2(-it.mx * 16)}px,${r2(y * 0.2)}px,0) rotateY(${r2(it.mx * 2.6)}deg) rotateX(${r2(-it.my * 1.8)}deg) scale(1.08)`;
        if (css !== it.last) { it.last = css; it.el.style.transform = css; }
      }
    },
  });
}
