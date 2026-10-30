/* "Built for Dubai and the Gulf": the client's photograph with a light, calm movement.

   The picture is drawn on one full-screen shader. What moves:
     - The cursor: the picture glides with the mouse (it shifts here and there, like a camera following your hand),
       and a small depth map (made by tools/make-gulf.py: the skyline far away, the men and the railing close)
       makes near and far parts slide a little against each other.
     - The scroll: as the section passes through the screen the picture slowly pushes in (zooms closer) and drifts,
       like the old 3D skyline did.
     - A very soft shimmer: a few lit windows twinkle and the blue light trails breathe a little.
   No water, fountain, boat or wave movement. The text sits in the dark sky above the picture; the glowing 818 AI on
   the Burj is placed right under the text, and stays there while everything moves.
   The top of the picture dissolves into deep navy and then into the page above, and the bottom melts into the
   footer's colour, so the band has no hard edge. With prefers-reduced-motion everything holds still.
   If WebGL is missing the page shows the plain photo (see styles.css).                                         */
import { Scene, PerspectiveCamera, Mesh, ShaderMaterial, BufferGeometry, Float32BufferAttribute, TextureLoader, LinearFilter, LinearMipmapLinearFilter, Vector2 } from 'three';
import { REDUCED, clamp, lerp } from '../core/env.js';

const IMG_W = 1877, IMG_H = 838;                                       // size of the photograph
const PIV_X = 1000, PIV_Y = 200;                                       // top of the glowing 818 AI tower in the photograph: this point is pinned just below the text

const FRAG = `
  uniform sampler2D uImg; uniform sampler2D uM1; uniform sampler2D uM2;
  uniform float uTime; uniform float uReveal; uniform float uScale; uniform float uTopFade;
  uniform vec2 uBox; uniform vec2 uPivotBand; uniform vec2 uPar; uniform vec2 uSize;
  varying vec2 vU;
  float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  vec3 img(vec2 p){ return texture2D(uImg, vec2(p.x, 1. - p.y)).rgb; }
  vec3 m1(vec2 p){ return texture2D(uM1, vec2(p.x, 1. - p.y)).rgb; }          // water, fountains, light trails (blue channel)
  vec3 m2(vec2 p){ return texture2D(uM2, vec2(p.x, 1. - p.y)).rgb; }          // sky, leaves, depth (blue channel)
  float luma(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
  vec4 px4(float a, float b, float c, float d){ return vec4(a / 1877., b / 838., c / 1877., d / 838.); }
  float box(vec2 p, vec4 b, float f){ vec2 s = smoothstep(vec2(0.), vec2(f), min(p - b.xy, b.zw - p)); return s.x * s.y; }

  void main(){
    float t = uTime;
    vec2 bp = vec2(vU.x * uBox.x, (1. - vU.y) * uBox.y);                  // this pixel's place in the band, in px from the top left
    /* which point of the photograph is here (the tower top is pinned at uPivotBand, everything else follows from the scale) */
    vec2 p0 = (vec2(${PIV_X}., ${PIV_Y}.) + (bp - uPivotBand) / uScale) / uSize;
    vec2 p = p0;
    for (int i = 0; i < 3; i++) p = p0 - uPar * (m2(p).b - .30);          // depth: near things move more than far things

    vec3 col = img(p);
    vec3 a = m1(p);
    float L = luma(col);

    /* a few lit windows twinkle, very softly (not on the 818 AI lettering) */
    vec3 bl = texture2D(uImg, vec2(p.x, 1. - p.y), 3.).rgb;
    float hi = clamp((L - luma(bl)) * 2.6, 0., 1.);
    float cell = h21(floor(p * uSize * .5));
    float zone = smoothstep(.73, .69, p.y) * (1. - a.g) * (1. - box(p, px4(890., 200., 1085., 385.), .01));
    col += col * zone * hi * sin(t * (.6 + 2.6 * fract(cell * 9.7)) + cell * 90.) * .12;
    /* the blue light trails breathe a little */
    col += (vec3(.10, .32, 1.) * .55 + col * .30) * a.b * (.09 + .05 * sin(t * .7));

    vec2 v = bp / uBox - .5;
    col *= 1. - dot(v, v) * .5;                                          // soft vignette
    col += (h21(gl_FragCoord.xy) - .5) / 255.;                          // no banding in the dark sky

    /* Top and bottom: long, soft dissolves (no hard edge, nothing that looks like a border).
       The picture emerges out of deep navy, and the navy itself melts into the page background behind it. */
    float bot = 1. - smoothstep(0., .22, vU.y);
    vec3 navy = mix(vec3(.012, .026, .07), vec3(.0235, .041, .090), bot);     // at the very bottom: exactly the footer's colour
    float photoTop = uPivotBand.y - float(${PIV_Y}.) * uScale;           // where the top edge of the photograph is, in px from the top of the band
    float tp = (bp.y - photoTop) / (uSize.y * uScale);                   // 0 at the top edge of the photograph, 1 at its bottom edge
    float sides = smoothstep(0., .10, p0.x) * smoothstep(0., .10, 1. - p0.x);     // on very wide screens the photograph is narrower than the band: its left and right edges dissolve too
    float show = smoothstep(-.05, .20, tp) * smoothstep(0., .12, vU.y) * sides;  // how much of the picture (rest is navy)
    col = mix(navy, col, show);
    float alpha = uReveal * smoothstep(0., uTopFade, bp.y);              // the navy is solid before the picture starts to show: the page's own background never shows through the photo
    gl_FragColor = vec4(col, alpha);
  }`;

export function createSkylineView({ el, small = false } = {}) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 10);                 // the shader fills the box by itself
  const geo = new BufferGeometry(); geo.setAttribute('position', new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const mat = new ShaderMaterial({
    uniforms: {
      uImg: { value: null }, uM1: { value: null }, uM2: { value: null },
      uTime: { value: 0 }, uReveal: { value: 0 }, uScale: { value: 0.8 }, uTopFade: { value: 150 },
      uBox: { value: new Vector2(1000, 600) }, uPivotBand: { value: new Vector2(500, 300) }, uPar: { value: new Vector2(0, 0) },
      uSize: { value: new Vector2(IMG_W, IMG_H) },
    },
    vertexShader: 'varying vec2 vU; void main(){ vU = position.xy * .5 + .5; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false,
  });
  const mesh = new Mesh(geo, mat); mesh.frustumCulled = false; mesh.visible = false; scene.add(mesh);

  /* load the photograph and its two helper images */
  const base = (el && el.dataset.base) || '', loader = new TextureLoader();
  let loaded = 0, shownAt = 0;
  const load = (url, key, data) => loader.load(url, t => {
    t.minFilter = data ? LinearFilter : LinearMipmapLinearFilter; t.magFilter = LinearFilter; t.generateMipmaps = !data; t.anisotropy = 4;
    mat.uniforms[key].value = t;
    if (++loaded === 3) { mesh.visible = true; shownAt = performance.now(); }
  }, undefined, () => { if (el) el.classList.add('is-fallback'); });
  load(base + '.webp', 'uImg', false); load(base + '-m1.png', 'uM1', true); load(base + '-m2.png', 'uM2', true);

  /* ---- layout: where the photograph sits in the band ---- */
  let W = 1000, H = 600, s0 = 0.8, xb0 = 500, yb0 = 300, vf = 0.9;
  function resize(w, h) {
    W = w; H = h;
    const band = el && el.parentElement, text = band && band.querySelector('.gulf__text');
    const overlay = !el || getComputedStyle(el).position === 'absolute';      // desktop and tablet: the words sit on top of the picture box; phones: the words are above it
    /* vertically: the glowing tower top goes just under the words (desktop, tablet), or near the top of the box (phones) */
    if (overlay && text) { const bb = band.getBoundingClientRect(), tb = text.getBoundingClientRect(); yb0 = (tb.bottom - bb.top) + 22; }
    else yb0 = h * 0.22;
    /* scale: wide enough that the picture can glide sideways without showing an edge, but never so big that the compact box
       cuts off the fountains, the boats and the men (on very wide screens the photograph is then a little narrower than the band
       and its left and right edges dissolve into the dark, like its top and bottom) */
    const sWide = 1.09 * w / IMG_W;
    s0 = sWide;
    if (overlay) s0 = clamp((h - yb0 - 8) / (665 - PIV_Y), 0.55 * sWide, sWide);
    else s0 = Math.max(sWide, h * 0.80 / 560);                                // phones: zoom in on the Burj and the men
    vf = w / (s0 * IMG_W);                                                    // how much of the photograph's width is visible (1 = all of it)
    /* horizontally: the middle of the photograph, or on phones a little to the left so the men and the Burj both fit */
    const fx = vf >= 1 ? 0.5 : clamp(lerp(0.5, 0.40, clamp((0.85 - vf) / 0.35, 0, 1)), vf / 2, 1 - vf / 2);
    xb0 = w / 2 + (PIV_X - fx * IMG_W) * s0;
    mat.uniforms.uBox.value.set(w, h);
    mat.uniforms.uTopFade.value = overlay ? Math.min(0.22 * h, 170) : 0.30 * h;
  }
  function update({ time }, local, { progress }) {
    const u = mat.uniforms;
    u.uTime.value = REDUCED ? 4 : time;                                  // reduced motion: hold one still moment
    let xb = xb0, yb = yb0, s = s0, px = 0, py = 0;
    if (!REDUCED) {
      const pr = clamp(progress, 0, 1);
      /* the cursor: the whole picture glides (this cannot distort anything), and near parts shift a little more than far ones */
      xb = xb0 - local.mx * 0.030 * W + Math.sin(time * 0.10) * 0.006 * W;
      yb = yb0 - local.my * 0.020 * H + (0.5 - pr) * 0.03 * H + Math.cos(time * 0.08) * 0.004 * H;
      /* the scroll: the picture slowly pushes in as the band passes through the screen */
      s = s0 * (1 + 0.06 * pr);
      xb = W / 2 + (xb - W / 2) * (1 + 0.06 * pr);
      px = -local.mx * 0.009 + Math.sin(time * 0.11) * 0.003; py = -local.my * 0.005 + Math.cos(time * 0.09) * 0.002;
    }
    u.uScale.value = s; u.uPivotBand.value.set(xb, yb); u.uPar.value.set(px, py);
    u.uReveal.value = shownAt ? clamp((performance.now() - shownAt) / 1100) : 0;          // fade in after loading
  }
  return { scene, camera, update, resize };
}
