/* Cards fly in through 3D space as they scroll into view: [data-fly] (data-side = -1 left, 0 middle, 1 right) */
import { $$, view, clamp, smooth, r2, docRect } from '../core/env.js';
import { add } from '../core/loop.js';

export function initDepth() {
  let items = [];
  add({
    measure() {
      items = $$('[data-fly]').map(el => { const d = docRect(el); return { el, top: d.y, h: d.h, side: Number(el.dataset.side || 0), last: '' }; });
    },
    update({ y }) {
      const small = view.w < 760;
      const dz = small ? 150 : 340, rx = small ? 16 : 26, ry = small ? 4 : 13;
      for (const it of items) {
        const c = (it.top + it.h / 2 - y) / view.h;               // 0.5 = card is in the middle of the screen
        const stagger = (it.side + 1) * 0.045;                    // left cards first, right cards last
        const e = smooth(clamp((c - 0.55 - stagger) / 0.5));      // 1 = still below the screen, 0 = arrived
        const x = smooth(clamp((0.42 - c) / 0.6));                // 1 = gone off the top
        let css, op;
        if (e === 0 && x === 0) { css = 'none'; op = '1'; }
        else {
          css = `perspective(1400px) translate3d(${r2(it.side * e * 40)}px,${r2(e * 70)}px,${r2(-e * dz - x * 180)}px) ` +
                `rotateX(${r2(e * rx + x * 12)}deg) rotateY(${r2(it.side * e * ry)}deg)`;
          op = String(r2((1 - e * 0.97) * (1 - x * x)));
        }
        const key = css + op;
        if (key !== it.last) { it.last = key; it.el.style.transform = css; it.el.style.opacity = op; }
      }
    },
  });
}
