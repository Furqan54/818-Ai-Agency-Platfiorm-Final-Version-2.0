/* Magnetic buttons + the soft light that follows the mouse */
import { $, $$, view, mouse, lerp, r2, FINE } from '../core/env.js';
import { add } from '../core/loop.js';

export function initMagnetic() {
  if (!FINE) return;
  $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--tx', r2((e.clientX - (r.left + r.width / 2)) * 0.28) + 'px');
      el.style.setProperty('--ty', r2((e.clientY - (r.top + r.height / 2)) * 0.34) + 'px');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0px'); el.style.setProperty('--ty', '0px'); });
  });
}

export function initGlow() {
  const el = $('#cursorGlow'); if (!el || !FINE) return;
  let gx = view.w / 2, gy = view.h / 2, last = '';
  add({
    update({ dt }) {
      if (!mouse.moved) return;
      el.classList.add('on');
      const k = 1 - Math.exp(-dt * 6);
      gx = lerp(gx, mouse.px, k); gy = lerp(gy, mouse.py, k);
      const css = `translate3d(${r2(gx - 260)}px,${r2(gy - 260)}px,0)`;
      if (css !== last) { last = css; el.style.transform = css; }
    },
  });
}
