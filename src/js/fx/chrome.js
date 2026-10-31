/* Header: darker bar after scrolling, mobile menu */
import { $, root } from '../core/env.js';
import { add } from '../core/loop.js';

export function initChrome() {
  const nav = $('#nav');
  let scrolled = false;
  add({
    update({ y }) {
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
