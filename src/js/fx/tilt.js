/* Hover: a card tilts toward the cursor, with a white spotlight and a neon edge: [data-tilt] */
import { $$, clamp, lerp, r2, FINE } from '../core/env.js';
import { add } from '../core/loop.js';

export function initTilt() {
  if (!FINE) return;
  const active = new Set();
  const MAX = 9;                                                  // max tilt in degrees

  $$('[data-tilt]').forEach(el => {
    // every tilting card needs an un-tilted wrapper, so its box stays stable while it moves
    let frame = el.parentElement;
    if (!frame.classList.contains('card-wrap')) {
      frame = document.createElement('div'); frame.className = 'card-wrap';
      el.replaceWith(frame); frame.appendChild(el);
    }
    const s = { el, tx: 0, ty: 0, rx: 0, ry: 0, sc: 1, tsc: 1, mx: 50, my: 50, hover: false };
    el.addEventListener('pointerenter', () => { s.hover = true; s.tsc = 1.025; active.add(s); });
    el.addEventListener('pointermove', e => {
      const r = frame.getBoundingClientRect();
      const px = clamp((e.clientX - r.left) / r.width), py = clamp((e.clientY - r.top) / r.height);
      s.tx = (0.5 - py) * 2 * MAX; s.ty = (px - 0.5) * 2 * MAX; s.mx = px * 100; s.my = py * 100;
    });
    el.addEventListener('pointerleave', () => { s.hover = false; s.tx = 0; s.ty = 0; s.tsc = 1; });
  });

  add({
    update({ dt }) {
      if (!active.size) return;
      const k = 1 - Math.exp(-dt * 9);
      for (const s of active) {
        s.rx = lerp(s.rx, s.tx, k); s.ry = lerp(s.ry, s.ty, k); s.sc = lerp(s.sc, s.tsc, k);
        const st = s.el.style;
        st.transform = `perspective(900px) rotateX(${r2(s.rx)}deg) rotateY(${r2(s.ry)}deg) scale3d(${r2(s.sc)},${r2(s.sc)},1)`;
        st.setProperty('--mx', r2(s.mx) + '%'); st.setProperty('--my', r2(s.my) + '%');
        if (!s.hover && Math.abs(s.rx) < 0.02 && Math.abs(s.ry) < 0.02 && Math.abs(s.sc - 1) < 0.001) { st.transform = ''; active.delete(s); }
      }
    },
  });
}
