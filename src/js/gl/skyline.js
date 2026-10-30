/* "Built for Dubai and the Gulf": the client's photograph with a light, calm movement.

   The picture is drawn on one full-screen shader and it only does two gentle things:
     1. It follows the mouse (and drifts very slowly on its own). A small helper image holds how far each part of
        the photo is (depth: the skyline far away, the men and the railing close), so when the camera moves, near
        and far parts slide against each other and the photo feels like a real place with depth.
     2. A very soft shimmer: a few lit windows twinkle and the blue light trails breathe a little.
   No water, fountain, boat or wave movement. The top of the picture dissolves into deep navy and then into the page
   above, and the bottom melts into the footer's colour, so the band has no hard edge. With prefers-reduced-motion everything holds still.
   If WebGL is missing the page shows the plain photo (see styles.css).
   The helper images are made by tools/make-gulf.py.                                                            */
import { Scene, PerspectiveCamera, Mesh, ShaderMaterial, BufferGeometry, Float32BufferAttribute, TextureLoader, LinearFilter, LinearMipmapLinearFilter, Vector2 } from 'three';
import { REDUCED, clamp, lerp } from '../core/env.js';

const IMG_W = 1877, IMG_H = 838;                                       // size of the photograph
const FEATHER = 0.24;                                                  // top part of the box (as a fraction) that is only the soft dissolve above the picture; styles.css makes the box taller by the same amount

const FRAG = `
  uniform sampler2D uImg; uniform sampler2D uM1; uniform sampler2D uM2;
  uniform float uTime; uniform float uReveal; uniform float uFeather;
  uniform vec2 uCenter; uniform vec2 uSpan; uniform vec2 uPar; uniform vec2 uSize;
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
    float F = uFeather;
    /* the picture sits in the lower part of the box; above it is the soft dissolve */
    vec2 pv = vec2(vU.x, min(vU.y / (1. - F), 1.));
    /* where on the picture is this pixel, after the camera has moved (near things move more than far things) */
    vec2 p0 = uCenter + vec2(pv.x - .5, .5 - pv.y) * uSpan;
    vec2 p = p0;
    for (int i = 0; i < 3; i++) p = p0 - uPar * (m2(p).b - .30);

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

    vec2 v = pv - .5;
    col *= 1. - dot(v, v) * .5;                                          // soft vignette
    col += (h21(gl_FragCoord.xy) - .5) / 255.;                          // no banding in the dark sky

    /* Top and bottom: long, soft dissolves (no hard edge, nothing that looks like a border).
       The picture emerges out of deep navy, and the navy itself melts into the page background behind it. */
    float bot = 1. - smoothstep(0., .22, vU.y);
    vec3 navy = mix(vec3(.012, .026, .07), vec3(.0235, .041, .090), bot);     // at the very bottom: exactly the footer's colour
    float top = 1. - vU.y;                                               // 0 at the top of the box ... 1 at the bottom
    float tp = (top - F) / (1. - F);                                     // 0 at the top edge of the picture
    float show = smoothstep(-.05, .20, tp) * smoothstep(0., .26, vU.y);   // how much of the picture (rest is navy)
    col = mix(navy, col, show);
    float alpha = uReveal * smoothstep(0., F, top);   // the navy is solid before the picture starts to show: the page's own background never shows through the photo
    gl_FragColor = vec4(col, alpha);
  }`;

export function createSkylineView({ el, small = false } = {}) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 10);                 // the shader fills the box by itself
  const geo = new BufferGeometry(); geo.setAttribute('position', new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const mat = new ShaderMaterial({
    uniforms: {
      uImg: { value: null }, uM1: { value: null }, uM2: { value: null },
      uTime: { value: 0 }, uReveal: { value: 0 }, uFeather: { value: FEATHER },
      uCenter: { value: new Vector2(0.5, 0.46) }, uSpan: { value: new Vector2(0.93, 0.93) }, uPar: { value: new Vector2(0, 0) },
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

  /* which part of the picture fits the box: the whole picture on wide screens, the Burj and the men on phones */
  const ZOOM = 1.07;
  let cx0 = 0.5, cy0 = 0.46, vw = 0.9, vh = 0.9;
  function resize(w, h) {
    const Ai = IMG_W / IMG_H, Ab = w / (h * (1 - FEATHER));           // the picture only fills the lower part of the box
    vh = 1 / ZOOM; vw = (vh * Ab) / Ai;
    if (vw > 1 / ZOOM) { vw = 1 / ZOOM; vh = (vw * Ai) / Ab; }
    const portrait = clamp((1.5 - Ab) / 0.6, 0, 1);
    cx0 = clamp(lerp(0.5, 0.40, portrait), vw / 2, 1 - vw / 2); cy0 = clamp(0.46, vh / 2, 1 - vh / 2);
    mat.uniforms.uSpan.value.set(vw, vh); mat.uniforms.uCenter.value.set(cx0, cy0);
  }
  function update({ time }, local, { progress }) {
    const u = mat.uniforms;
    u.uTime.value = REDUCED ? 4 : time;                                  // reduced motion: hold one still moment
    if (!REDUCED) {
      /* the camera follows the mouse: the whole picture glides a little (this cannot distort anything), and on top of
         that near parts shift slightly more than far ones, for depth. Kept small on purpose: bigger depth shifts
         start to tear the edges of the men and the railing. */
      u.uPar.value.set(-local.mx * 0.009 + Math.sin(time * 0.11) * 0.003, -local.my * 0.005 + Math.cos(time * 0.09) * 0.002 + (progress - 0.5) * 0.008);
      u.uCenter.value.set(clamp(cx0 + local.mx * 0.022 + Math.sin(time * 0.07) * 0.004, vw / 2, 1 - vw / 2), clamp(cy0 + local.my * 0.006, vh / 2, 1 - vh / 2));
    }
    u.uReveal.value = shownAt ? clamp((performance.now() - shownAt) / 1100) : 0;          // fade in after loading
  }
  return { scene, camera, update, resize };
}
