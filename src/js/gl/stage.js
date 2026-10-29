/* One WebGL canvas for the whole page (fixed, behind the content).
   Every frame it draws, in this order:
     1. the Dubai night backdrop (full screen)
     2. every 3D scene whose placeholder box ([data-3d]) is on screen, clipped to that box
   Scenes only draw while visible, so a page with several 3D blocks still costs one at a time. */
import { WebGLRenderer, ACESFilmicToneMapping } from 'three';
import { view, mouse, lerp, docRectSafe } from '../core/env.js';
import { createBackdrop } from './backdrop.js';

export function createStage(canvas, bgSrc, onBackdrop) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.autoClear = false;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const maxRatio = view.w < 760 ? 1.25 : 1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxRatio));
  renderer.setSize(view.w, view.h, false);

  const backdrop = createBackdrop(renderer, bgSrc, onBackdrop);
  const views = [];
  const local = { mx: 0, my: 0, time: 0 };

  /** def = { el, scene, camera, update(frame, local, rect), resize(w, h) } */
  function addView(def) { def.rect = { x: 0, y: 0, w: 1, h: 1 }; views.push(def); return def; }

  function measure() {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, view.w < 760 ? 1.25 : 1.5));
    renderer.setSize(view.w, view.h, false);
    backdrop.resize();
    for (const v of views) {
      const r = docRectSafe(v.el);
      v.rect = r; v.visible = r.w > 8 && r.h > 8;
      if (v.visible && v.resize) v.resize(r.w, r.h);
    }
  }

  function render(frame) {
    local.mx = lerp(local.mx, mouse.x, 0.06); local.my = lerp(local.my, mouse.y, 0.06);
    backdrop.render(frame);
    const H = view.h;
    for (const v of views) {
      if (!v.visible) continue;
      const top = v.rect.y - frame.y, left = v.rect.x;
      if (top > H + 40 || top + v.rect.h < -40) continue;          // off screen: draw nothing
      const vp = { x: left, y: H - (top + v.rect.h), w: v.rect.w, h: v.rect.h };
      renderer.setViewport(vp.x, vp.y, vp.w, vp.h);
      renderer.setScissor(vp.x, vp.y, vp.w, vp.h);
      renderer.setScissorTest(true);
      renderer.clearDepth();
      // how far through the screen the box is: 0 = just entering at the bottom, 1 = just leaving at the top
      const progress = (H - top) / (H + v.rect.h);
      v.update && v.update(frame, local, { progress, top });
      renderer.render(v.scene, v.camera);
    }
    renderer.setScissorTest(false);
  }

  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); document.documentElement.classList.add('no-webgl'); });
  return { renderer, addView, measure, render, backdrop };
}
