/* Header and progress bar: scroll progress, darker bar after scrolling, mobile menu */
import { $, view, clamp, r2, root } from '../core/env.js';
import { add } from '../core/loop.js';

export function initChrome() {
  const bar = $('#progress'), nav = $('#nav');
  let lastBar = '', scrolled = false;
  add({
    update({ y }) {
      const max = Math.max(1, view.docH - view.h);
      const css = `scaleX(${r2(clamp(y / max))})`;
      if (css !== lastBar) { lastBar = css; bar.style.transform = css; }
      const s = y > 30;
      if (s !== scrolled) { scrolled = s; nav.classList.toggle('scrolled', s); }
    },
  });

  /* mobile menu */
  const burger = $('#burger'), menu = $('#menu');
  if (!burger) return;
  const set = open => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open; nav.classList.toggle('menu-open', open);
    root.dispatchEvent(new CustomEvent('menu:toggle', { detail: open }));
  };
  burger.addEventListener('click', () => set(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { set(false); burger.focus(); } });
  matchMedia('(min-width: 861px)').addEventListener('change', e => { if (e.matches && !menu.hidden) set(false); });
}
