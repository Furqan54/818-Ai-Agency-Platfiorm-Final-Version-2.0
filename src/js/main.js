/* =========================================================================
   818 AI Agency — main.js (entry point, bundled to site/assets/app.js)

   core/   env.js (helpers)  ·  loop.js (ONE animation loop + smooth scroll)
   fx/     scroll and hover effects that only touch transform / opacity
   gl/     three.js: stage.js (one canvas), backdrop.js (Dubai night picture), logo.js,
           constel.js (orbit hubs), skyline.js (Dubai), herofx.js (floating cubes + dust)
   ========================================================================= */
import { $, $$, root, view, REDUCED } from './core/env.js';
import { add, start } from './core/loop.js';
import { initReveal } from './fx/reveal.js';
import { initDepth } from './fx/depth.js';
import { initHub } from './fx/hub.js';
import { initTilt } from './fx/tilt.js';
import { initMagnetic, initGlow } from './fx/pointer.js';
import { initChrome } from './fx/chrome.js';
import { initStack } from './fx/stack.js';
import { initFrames, initParallax } from './fx/frame3d.js';
import { initSliders } from './fx/slider.js';
import { initChat } from './fx/chat.js';
import { initForm } from './fx/form.js';
import { createStage } from './gl/stage.js';
import { makeEnv } from './gl/common.js';
import { createLogoView } from './gl/logo.js';
import { createConstelView } from './gl/constel.js';
import { createSkylineView } from './gl/skyline.js';
import { createHeroFxView } from './gl/herofx.js';

root.classList.add('js');

/* ---- page effects ---- */
initChrome(); initReveal(); initDepth(); initHub(); initStack(); initFrames(); initParallax();
initTilt(); initMagnetic(); initGlow(); initSliders(); initChat(); initForm();

/* ---- 3D: one canvas, many scenes ---- */
function useFallback() {
  root.classList.add('no-webgl');
  const fb = $('#bgFallback');
  if (fb && window.BG_IMAGE) fb.style.backgroundImage = `url(${window.BG_IMAGE})`;
}

function initGL() {
  const canvas = $('#gl');
  if (!canvas || !window.BG_IMAGE) return useFallback();
  let stage;
  try { stage = createStage(canvas, window.BG_IMAGE, ok => { if (ok === false) useFallback(); else canvas.classList.add('ready'); }); }
  catch (e) { console.warn('WebGL is not available:', e); return useFallback(); }

  const small = view.w < 760;
  const holes = $$('[data-3d]');
  let env = null;
  const getEnv = () => env || (env = makeEnv(stage.renderer));
  for (const el of holes) {
    const kind = el.dataset['3d'];
    let v = null;
    try {
      if (kind === 'logo') v = createLogoView(getEnv(), { small });
      else if (kind === 'constel') v = createConstelView(el, getEnv(), { small });
      else if (kind === 'skyline') v = createSkylineView({ el, small });
      else if (kind === 'fx') v = createHeroFxView({ small });
    } catch (e) { console.warn('3D scene failed:', kind, e); }
    if (v) stage.addView({ el, ...v });
  }
  add({ measure: stage.measure, update: stage.render });
  window.__stage = stage;                                          // handy for debugging in the console
}
initGL();

start();
