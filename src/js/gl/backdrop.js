/* The Dubai night picture, drawn by a shader. Scroll slides the picture from the 818 logo (top) down
   to the round table (bottom); the shader adds
     - ripples, rotating rays and orbiting sparks that come out of the 818 logo
     - energy pulses racing along the light streams that are painted in the picture
     - tiny sparkles riding on those streams
   It is drawn into a smaller texture and then stretched over the screen (soft light, nobody can tell,
   and it keeps the page smooth). The 3D scenes are drawn on top of it at full sharpness. */
import {
  ShaderMaterial, Texture, WebGLRenderTarget, LinearFilter, ClampToEdgeWrapping, Scene, Mesh,
  BufferGeometry, BufferAttribute, OrthographicCamera, Vector2, Vector4, NoColorSpace,
} from 'three';
import { view, mouse, clamp, lerp } from '../core/env.js';

/* where the logo sits inside the picture (0..1 of its width / height) and its ring size */
const LOGO_X = 0.509, LOGO_Y = 0.119, RING = 0.0695;

const VERT = 'void main(){ gl_Position = vec4(position.xy, 0., 1.); }';
const FRAG = /* glsl */`
  uniform sampler2D uTex;
  uniform vec2 uRes;      // texture size in pixels
  uniform vec2 uView;     // viewport size in CSS pixels
  uniform vec4 uMap;      // where the picture sits on screen: x, y, width, height (CSS px)
  uniform float uTime;
  uniform float uAsp;     // picture width / height
  const vec2 LOGO = vec2(${LOGO_X}, ${LOGO_Y});
  const float RING = ${RING};

  float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

  void main(){
    vec2 frag = vec2(gl_FragCoord.x / uRes.x, 1. - gl_FragCoord.y / uRes.y);
    vec2 uv = (frag * uView - uMap.xy) / uMap.zw;                // position inside the picture, 0..1
    vec3 c = texture2D(uTex, clamp(uv, 0., 1.)).rgb * vec3(.94, .98, 1.04);

    vec2 q = (uv - LOGO) * vec2(uAsp, 1.);                       // offset from the logo, in picture-heights
    float d = length(q);
    float ang = atan(q.y, q.x);

    // 1. mask of the bright blue streams that are painted in the picture
    float lum = dot(c, vec3(.3, .59, .11));
    float m = smoothstep(.26, .7, c.b - c.r * .7) * smoothstep(.14, .42, lum);

    // 2. pulses race outward from the logo along those streams
    float wave = pow(.5 + .5 * sin(d * 52. - uTime * 3.6), 5.);
    float f1 = fract(uTime * .15), f2 = fract(uTime * .15 + .5);
    float shell = exp(-pow((d - f1 * 1.45) * 9., 2.)) * (1. - f1)
                + exp(-pow((d - f2 * 1.45) * 9., 2.)) * (1. - f2);
    vec3 col = c + c * m * (wave * .85 + shell * 1.9) * smoothstep(RING, RING * 2.2, d);   // calmer next to the logo

    // 3. the logo itself: ripples, rays, orbiting sparks, breathing core
    float rip = 0.;
    for (int k = 0; k < 3; k++){
      float ph = fract(uTime * .2 + float(k) / 3.);
      rip += exp(-pow((d - (RING + ph * .34)) * 70., 2.)) * (1. - ph) * (1. - ph);
    }
    float far = smoothstep(RING * .9, RING * 1.7, d);
    float rays = pow(abs(sin(ang * 11. + uTime * .55)), 20.) * exp(-d * 6.5) * far * (.65 + .35 * sin(uTime * 1.3));
    float onRing = exp(-pow((d - RING) * 150., 2.));
    float arcs = onRing * (pow(.5 + .5 * cos(ang - uTime * 1.7), 14.) + pow(.5 + .5 * cos(ang + uTime * 1.15 + 2.), 14.));
    float core = exp(-d * 15.) * (.07 + .05 * sin(uTime * 2.1)) * smoothstep(RING * .55, RING * .9, d + .02);
    col += vec3(.3, .78, 1.) * (rip * .75 + rays * .55 + core) + vec3(1.) * arcs * .85;

    // 4. sparkles that ride on the streams
    vec2 g = uv * vec2(80., 120.);
    vec2 id = floor(g);
    float h = hash(id);
    float spark = step(.982, h) * (.5 + .5 * sin(uTime * 2.2 + h * 80.)) * smoothstep(.24, .0, length(fract(g) - .5));
    col += vec3(.7, .92, 1.) * spark * smoothstep(.12, .5, m) * 1.4;

    // vignette + soft highlight roll-off + dither (no colour banding)
    vec2 vp = frag - .5;
    col *= .78 + .22 * (1. - smoothstep(.35, 1., length(vp * vec2(1.05, 1.2))));
    col = col / (1. + col * .07);
    col += (hash(gl_FragCoord.xy + fract(uTime)) - .5) / 255.;
    gl_FragColor = vec4(col, 1.);
  }`;

const BLIT_FRAG = /* glsl */`
  uniform sampler2D uTex; uniform vec2 uScreen;
  void main(){ gl_FragColor = vec4(texture2D(uTex, gl_FragCoord.xy / uScreen).rgb, 1.); }`;

const triangle = () => {
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  return g;
};

export function createBackdrop(renderer, src, onReady) {
  const cam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const tex = new Texture();
  tex.flipY = false; tex.colorSpace = NoColorSpace; tex.minFilter = LinearFilter; tex.magFilter = LinearFilter;
  tex.generateMipmaps = false; tex.wrapS = tex.wrapT = ClampToEdgeWrapping;

  const uniforms = {
    uTex: { value: tex }, uRes: { value: new Vector2(2, 2) }, uView: { value: new Vector2(view.w, view.h) },
    uMap: { value: new Vector4() }, uTime: { value: 0 }, uAsp: { value: 1024 / 1536 },
  };
  const bgScene = new Scene(), blitScene = new Scene();
  const bgMat = new ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false });
  const blitU = { uTex: { value: null }, uScreen: { value: new Vector2(2, 2) } };
  const blitMat = new ShaderMaterial({ vertexShader: VERT, fragmentShader: BLIT_FRAG, uniforms: blitU, depthTest: false, depthWrite: false });
  const g = triangle();
  for (const [scene, mat] of [[bgScene, bgMat], [blitScene, blitMat]]) { const m = new Mesh(g, mat); m.frustumCulled = false; scene.add(m); }

  // desktop draws the picture at 0.85x CSS pixels, phones a bit lower
  let scale = view.w < 760 ? 0.7 : 0.85;
  let rt = null, imgW = 1024, imgH = 1536, ready = false;
  let dispW = 0, dispH = 0, offX = 0;
  let time = 0, speed = 0, sp = 0, mx = 0, my = 0;
  let acc = 0, frames = 0, steps = 0;                             // adaptive quality

  function layout() {                                             // how big the picture is on screen
    const s = Math.max(view.w / imgW, 1.55 * view.h / imgH);      // always covers the screen, always has room to pan
    dispW = imgW * s; dispH = imgH * s; offX = (view.w - dispW) / 2;
  }
  function resize() {
    const w = Math.max(2, Math.round(view.w * scale)), h = Math.max(2, Math.round(view.h * scale));
    if (rt) rt.dispose();
    rt = new WebGLRenderTarget(w, h, { minFilter: LinearFilter, magFilter: LinearFilter, depthBuffer: false, stencilBuffer: false });
    uniforms.uRes.value.set(w, h); uniforms.uView.value.set(view.w, view.h);
    layout();
  }
  /* if the device cannot hold ~42 fps, quietly lower the resolution (max 3 times) */
  function adapt(dtMs) {
    if (steps >= 3 || dtMs > 250) return;
    acc += dtMs; frames++;
    if (frames < 90) return;
    if (acc / frames > 24 && scale > 0.4) { scale *= 0.8; steps++; resize(); }
    acc = 0; frames = 0;
  }

  const img = new Image();
  img.onload = () => {
    imgW = img.naturalWidth; imgH = img.naturalHeight;
    tex.image = img; tex.needsUpdate = true; uniforms.uAsp.value = imgW / imgH;
    ready = true; layout(); onReady && onReady();
  };
  img.onerror = () => onReady && onReady(false);
  img.src = src;

  function render({ dt, y, velocity, still }) {
    if (!ready) return;
    speed = lerp(speed, Math.abs(velocity), 0.06);                // streams flow faster while you scroll
    time += dt * (1 + clamp(speed * 0.03, 0, 2.2));
    sp = lerp(sp, view.docH > view.h ? y / (view.docH - view.h) : 0, still ? 1 : 0.12);
    mx = lerp(mx, mouse.x, 0.05); my = lerp(my, mouse.y, 0.05);
    const pan = dispH - view.h;                                   // how far the picture can slide
    const oy = clamp(-pan * sp - my * 8, -pan - 8, 8);
    uniforms.uMap.value.set(offX - mx * 10, oy, dispW, dispH);
    uniforms.uTime.value = time;

    renderer.setRenderTarget(rt);
    renderer.setScissorTest(false);
    renderer.render(bgScene, cam);
    renderer.setRenderTarget(null);
    const sz = renderer.getDrawingBufferSize(blitU.uScreen.value);
    blitU.uTex.value = rt.texture;
    renderer.setViewport(0, 0, view.w, view.h);
    renderer.render(blitScene, cam);
    adapt(dt * 1000);
  }
  return { render, resize, get ready() { return ready; }, get quality() { return steps; } };
}
