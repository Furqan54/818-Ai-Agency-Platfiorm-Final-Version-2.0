/* Home: services hub. The whole block starts as a tilted floor and flattens as it arrives,
   and glowing lines run from the centre orb to every card. */
import { $, $$, view, clamp, smooth, r2, docRect } from '../core/env.js';
import { add } from '../core/loop.js';

export function initHub() {
  const hub = $('#hub'), core = $('#hubCore'), svg = $('#hubLines');
  if (!hub) return;
  let top = 0, last = '';

  function buildLines() {
    const w = core.offsetWidth, h = core.offsetHeight;
    if (!w || core.offsetParent === null) { svg.innerHTML = ''; return; }     // hidden on small screens
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const cx = w / 2, cy = h / 2;
    let out = '', n = 0;
    $$('.hub__side', hub).forEach((side, s) => {
      const dir = s === 0 ? -1 : 1, xEnd = s === 0 ? 0 : w;
      $$('.svc', side).forEach(card => {
        const wrap = card.parentElement;
        const y = wrap.offsetTop + wrap.offsetHeight / 2 - core.offsetTop;
        const d = `M${cx} ${cy} C${r2(cx + dir * w * .3)} ${cy} ${r2(xEnd - dir * w * .3)} ${r2(y)} ${xEnd} ${r2(y)}`;
        out += `<path class="hub__base" d="${d}"/>` +
               `<path class="hub__pulse" pathLength="100" d="${d}" style="animation-delay:-${(n++ * 0.53).toFixed(2)}s"/>` +
               `<path class="hub__pulse hub__pulse--in" pathLength="100" d="${d}" style="animation-delay:-${(n * 0.37).toFixed(2)}s"/>`;
      });
    });
    svg.innerHTML = out;
  }

  add({
    measure() { top = docRect(hub).y; buildLines(); },
    update({ y }) {
      const small = view.w < 760;
      const p = smooth(clamp(1 - (top - y - view.h * 0.05) / (view.h * 0.95)));    // 0 = far below, 1 = arrived
      const k = 1 - p;
      const css = p >= 1 ? 'none' : `rotateX(${r2(k * (small ? 26 : 46))}deg) scale(${r2(1 - k * 0.08)})`;
      const op = r2(0.1 + 0.9 * clamp(p * 1.6));
      const key = css + op;
      if (key !== last) { last = key; hub.style.transform = css; hub.style.opacity = op; }
    },
  });
}
