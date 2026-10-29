/* "Built for Dubai and the Gulf": the client's photograph, brought to life.

   The picture is drawn on one full-screen shader. Two small helper images (made by tools/make-gulf.py) tell it
   what each part of the picture is:
     depth    far ... near. The camera drifts and follows the mouse, so the palms, the men, the water and the
              skyline slide against each other (parallax) and the photo gets real depth.
     masks    water       ripples and glittering reflections
              fountains   the jets rise and shimmer
              streaks     the blue light trails round the Burj pulse as if the light is flowing
              sky         the clouds drift slowly
              leaves      the palm leaves and plants sway in the breeze
   On top of that: lit windows twinkle, the boats rock, the men breathe and the lantern flickers.
   With prefers-reduced-motion everything holds still. If WebGL is missing the page shows the plain photo.      */
import { Scene, PerspectiveCamera, Mesh, ShaderMaterial, BufferGeometry, Float32BufferAttribute, TextureLoader, LinearFilter, LinearMipmapLinearFilter, Vector2 } from 'three';
import { REDUCED, clamp, lerp } from '../core/env.js';

const IMG_W = 1877, IMG_H = 838;                                       // size of the photograph

const FRAG = `
  uniform sampler2D uImg; uniform sampler2D uM1; uniform sampler2D uM2;
  uniform float uTime; uniform float uReveal; uniform vec2 uCenter; uniform vec2 uSpan; uniform vec2 uPar; uniform vec2 uSize;
  varying vec2 vU;
  const float AR = 2.2399;                                             // picture width / height
  float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1., 1.)), f.x), f.y); }
  vec3 img(vec2 p){ return texture2D(uImg, vec2(p.x, 1. - p.y)).rgb; }
  vec3 m1(vec2 p){ return texture2D(uM1, vec2(p.x, 1. - p.y)).rgb; }          // water, fountains, streaks
  vec3 m2(vec2 p){ return texture2D(uM2, vec2(p.x, 1. - p.y)).rgb; }          // sky, leaves, depth
  float luma(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
  vec4 px4(float a, float b, float c, float d){ return vec4(a / 1877., b / 838., c / 1877., d / 838.); }
  float box(vec2 p, vec4 b, float f){ vec2 s = smoothstep(vec2(0.), vec2(f), min(p - b.xy, b.zw - p)); return s.x * s.y; }

  void main(){
    float t = uTime;
    /* where on the picture is this pixel, after the camera has moved (parallax: near things move more than far things) */
    vec2 p0 = uCenter + vec2(vU.x - .5, .5 - vU.y) * uSpan;
    vec2 p = p0;
    for (int i = 0; i < 3; i++) p = p0 - uPar * (m2(p).b - .30);
    vec3 a = m1(p), c = m2(p);

    /* the yachts and the dhow rock gently, together with their reflections */
    float bm = box(p, px4(680., 566., 912., 706.), .015);   p -= bm * vec2(sin(t * .23) * .0018, sin(t * .9) * .0016);
    bm = box(p, px4(1238., 598., 1482., 740.), .015);       p -= bm * vec2(sin(t * .19 + 1.7) * .0018, sin(t * .8 + 1.) * .0016);
    bm = box(p, px4(1540., 610., 1662., 700.), .012);       p -= bm * vec2(sin(t * .27 + 3.) * .0016, sin(t * 1.0 + 2.) * .0014);
    bm = box(p, px4(1720., 636., 1862., 722.), .012);       p -= bm * vec2(sin(t * .31 + .5) * .0016, sin(t * 1.1 + 4.) * .0015);
    /* the three men breathe */
    float mm = max(box(p, px4(330., 505., 445., 775.), .02), max(box(p, px4(435., 505., 570., 775.), .02), box(p, px4(545., 505., 665., 790.), .02)));
    p.y = mix(p.y, .925 + (p.y - .925) * (1. + .0042 * sin(t * 1.2 + p.x * 14.)), mm);
    /* palm leaves and plants sway */
    p += c.g * vec2(sin(t * 1.1 + p.y * 8. + p.x * 5.) + .5 * sin(t * 2.3 + p.y * 15.), .35 * sin(t * 1.7 + p.x * 9.)) * .0011;
    /* clouds drift */
    p += c.r * vec2(sin(t * .06) * .004 + sin(t * .023 + 1.) * .002, 0.);
    /* fountain jets flow upwards */
    vec2 fq = vec2(p.x * 260., p.y * 34. + t * 2.4);
    p += a.g * vec2((vn(fq) - .5) * .0024, (vn(fq * 1.7 + 9.) - .5) * .0042);
    /* water ripples: longer and stronger nearer to the camera */
    float amp = .55 + 1.25 * smoothstep(.72, 1., p.y);
    vec2 q = vec2(p.x * AR, p.y);
    float dx = sin(q.y * 190. - t * 1.7 + sin(q.x * 9. + t * .3) * 1.3) * .6 + sin(q.y * 430. + t * 2.5 + q.x * 4.) * .4;
    float dy = sin(q.x * 95. + t * 1.1 + q.y * 20.) * .5;
    p += a.r * amp * vec2(dx * .0015, dy * .0004);

    vec3 col = img(p);
    a = m1(p);                                                          // masks again, now following the moved picture
    float L = luma(col);

    /* lit windows twinkle */
    vec3 bl = texture2D(uImg, vec2(p.x, 1. - p.y), 3.).rgb;
    float hi = clamp((L - luma(bl)) * 2.6, 0., 1.);
    float cell = h21(floor(p * uSize * .5));
    float zone = smoothstep(.73, .69, p.y) * (1. - a.g) * (1. - box(p, px4(890., 200., 1085., 385.), .01));      // not on the 818 AI lettering
    col += col * zone * hi * sin(t * (.6 + 2.6 * fract(cell * 9.7)) + cell * 90.) * .22;
    /* light trails and LED edges: pulses of light travel along them */
    float s2 = a.b * (.92 + .08 * sin(t * .8));
    float flow = .5 + .5 * sin(p.x * 28. + p.y * 11. - t * 1.5 + vn(p * vec2(9., 6.) + t * .15) * 3.5);
    flow = flow * flow * flow;
    col += (vec3(.10, .32, 1.) * .55 + col * .30) * s2 * flow;
    col *= 1. - s2 * .10 * (1. - flow);
    /* fountains shimmer and throw sparks */
    float f = a.g;
    col *= 1. + f * (.16 * sin(t * 2.6 + p.x * 140.) + .12 * (vn(p * vec2(180., 40.) + vec2(0., t * 3.)) - .5));
    col += vec3(.7, .85, 1.) * step(.985, h21(floor(p * uSize / 1.5) + floor(t * 10.))) * f * L * .6;
    /* sparkles on the water */
    col += vec3(.65, .8, 1.) * step(.994, h21(floor(p * uSize * .6) + floor(t * 5.))) * a.r * smoothstep(.25, .6, L) * .5;
    /* the lantern flickers */
    float lm = smoothstep(.05, .0, length((p - vec2(208. / 1877., 711. / 838.)) * vec2(AR, 1.)));
    col += vec3(1., .6, .25) * lm * (.10 * sin(t * 7. + 1.) + .10 * (vn(vec2(t * 6., 3.)) - .5));

    vec2 v = vU - .5;
    col *= 1. - dot(v, v) * .5;                                          // soft vignette
    col += (h21(gl_FragCoord.xy) - .5) / 255.;                          // no banding in the dark sky
    /* top and bottom edge: the page's background fades to deep navy first, then the picture appears out of the dark */
    vec3 navy = vec3(.012, .026, .07);
    float top = 1. - vU.y;
    col = mix(navy, col, smoothstep(.06, .20, top) * smoothstep(.0, .12, vU.y));
    float alpha = uReveal * smoothstep(0., .10, top) * smoothstep(0., .06, vU.y);
    gl_FragColor = vec4(col, alpha);
  }`;

export function createSkylineView({ el, small = false } = {}) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 10);                 // the shader fills the box by itself
  const geo = new BufferGeometry(); geo.setAttribute('position', new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const mat = new ShaderMaterial({
    uniforms: {
      uImg: { value: null }, uM1: { value: null }, uM2: { value: null },
      uTime: { value: 0 }, uReveal: { value: 0 },
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
  function resize(w, h) {
    const Ai = IMG_W / IMG_H, Ab = w / h;
    let vh = 1 / ZOOM, vw = (vh * Ab) / Ai;
    if (vw > 1 / ZOOM) { vw = 1 / ZOOM; vh = (vw * Ai) / Ab; }
    const portrait = clamp((1.5 - Ab) / 0.6, 0, 1);
    const cx = clamp(lerp(0.5, 0.40, portrait), vw / 2, 1 - vw / 2), cy = clamp(0.46, vh / 2, 1 - vh / 2);
    mat.uniforms.uSpan.value.set(vw, vh); mat.uniforms.uCenter.value.set(cx, cy);
  }
  function update({ time }, local, { progress }) {
    const u = mat.uniforms;
    u.uTime.value = REDUCED ? 4 : time;                                                     // reduced motion: hold one still moment
    if (!REDUCED) u.uPar.value.set(-local.mx * 0.011 + Math.sin(time * 0.11) * 0.004, -local.my * 0.006 + Math.cos(time * 0.09) * 0.0025 + (progress - 0.5) * 0.01);
    u.uReveal.value = shownAt ? clamp((performance.now() - shownAt) / 1100) : 0;          // fade in after loading
  }
  return { scene, camera, update, resize };
}
