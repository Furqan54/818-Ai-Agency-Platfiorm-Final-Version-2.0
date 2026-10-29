/* Home: "How we work" cards stack on top of each other (sticky) and shrink as the next one covers them */
import { $, $$, view, clamp, r2, docRect } from '../core/env.js';
import { add } from '../core/loop.js';

export function initStack() {
  const stackEl = $('#stack'); if (!stackEl) return;
  let steps = [], natural = [], sticky = [], H = 0, lasts = [];
  add({
    measure() {
      steps = $$('.step', stackEl); if (!steps.length) return;
      const stackTop = docRect(stackEl).y;
      H = steps[0].offsetHeight;
      const gap = parseFloat(getComputedStyle(steps[0]).marginBottom) || 0;
      natural = steps.map((_, i) => stackTop + i * (H + gap));     // where each card sits before it sticks
      sticky = steps.map(s => parseFloat(getComputedStyle(s).top) || 0);
      lasts = steps.map(() => '');
    },
    update({ y }) {
      for (let i = 0; i < steps.length - 1; i++) {
        const nextTop = natural[i + 1] - y;                        // where the next card is on screen
        const q = clamp((sticky[i] + H - nextTop) / H);            // 0 = not covered, 1 = fully covered
        const key = r2(q);
        if (key === lasts[i]) continue;
        lasts[i] = key;
        steps[i].style.transform = `scale(${r2(1 - q * 0.07)})`;
        steps[i].style.setProperty('--shade', r2(q * 0.6));
      }
    },
  });
}
