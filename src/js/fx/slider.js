/* 3D slider ([data-slider]): the slides sit on a curved stage. The active slide faces you,
   the others turn away into the depth. Arrows, dots, keyboard and swipe all work. */
import { $, $$, clamp, lerp, r2 } from '../core/env.js';
import { add } from '../core/loop.js';

export function initSliders() {
  $$('[data-slider]').forEach(setup);
}

function setup(el) {
  const stage = $('.slider__stage', el), slides = $$('.slide', stage), n = slides.length;
  if (n < 2) return;
  const peek = el.hasAttribute('data-peek');            // neighbours stay visible at the sides
  const dotsEl = $('[data-dots]', el), cur = $('[data-cur]', el), total = $('[data-total]', el);
  let index = 0, pos = 0, S = 0, lastKey = [];
  const pad = v => String(v).padStart(2, '0');
  total.textContent = pad(n);

  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => go(i));
    dotsEl.appendChild(b); return b;
  });

  function go(i) {
    index = ((i % n) + n) % n;
    cur.textContent = pad(index + 1);
    dots.forEach((d, k) => d.classList.toggle('on', k === index));
    slides.forEach((s, k) => { s.toggleAttribute('inert', k !== index); s.setAttribute('aria-hidden', String(k !== index)); });
  }
  $('[data-prev]', el).addEventListener('click', () => go(index - 1));
  $('[data-next]', el).addEventListener('click', () => go(index + 1));
  el.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') go(index - 1); else if (e.key === 'ArrowRight') go(index + 1);
  });

  /* swipe / drag */
  let sx = null;
  stage.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button === 0) sx = e.clientX; });
  addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => { sx = null; });

  go(0);
  add({
    measure() { S = peek ? slides[0].offsetWidth : stage.offsetWidth; lastKey = []; },
    update({ dt, still }) {
      // shortest way round the circle, so going from the last slide to the first slides forward
      let diff = index - pos; diff -= Math.round(diff / n) * n;
      pos = still ? index : (Math.abs(diff) < 0.001 ? index : pos + diff * (1 - Math.exp(-dt * 6.5)));
      for (let i = 0; i < n; i++) {
        let o = i - pos; o -= Math.round(o / n) * n;             // offset from the front: -2 .. 2
        const a = Math.abs(o);
        let css, op, vis = a < 2.6;
        if (peek) {
          css = `translate3d(${r2(o * S * 0.8)}px,0,${r2(-a * 150)}px) rotateY(${r2(-o * 30)}deg) scale(${r2(1 - Math.min(a, 2) * 0.07)})`;
          op = clamp(1 - a * 0.58);
        } else {
          css = `translate3d(${r2(o * S * 0.16)}px,0,${r2(-a * 240)}px) rotateY(${r2(-o * 38)}deg)`;
          op = clamp(1 - a * 1.25);
        }
        const key = css + op + vis;
        if (key === lastKey[i]) continue;
        lastKey[i] = key;
        const s = slides[i].style;
        s.transform = css; s.opacity = String(r2(op)); s.visibility = vis && op > 0.01 ? 'visible' : 'hidden';
        s.zIndex = String(10 - Math.round(a * 2));
        s.pointerEvents = a < 0.5 ? 'auto' : 'none';
      }
    },
  });
}
