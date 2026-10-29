/* Dubai at dusk, built from code (no model files):
   Burj Khalifa, Burj Al Arab, the twisting Cayan tower, Emirates Towers, the golden Dubai Frame and a
   skyline of lit towers, reflected in the water, with two figures in kandura and ghutra looking out
   over the city from a terrace. The camera drifts slowly and follows the mouse. */
import {
  Scene, PerspectiveCamera, Group, Mesh, ShaderMaterial, BoxGeometry, CylinderGeometry, ExtrudeGeometry, ShapeGeometry, Shape, PlaneGeometry,
  MeshBasicMaterial, MeshStandardMaterial, BufferGeometry, BufferAttribute, Float32BufferAttribute, Vector2, Vector3, Color, DoubleSide, AdditiveBlending,
  CustomBlending, SrcAlphaFactor, OneMinusSrcAlphaFactor, AddEquation, Points, PointsMaterial, Sprite, SpriteMaterial, TorusGeometry,
  LatheGeometry, CapsuleGeometry, SphereGeometry, HemisphereLight, DirectionalLight, PointLight, Line, LineBasicMaterial,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { glowTexture } from './common.js';

const HAZE = new Color('#c0627a');                                  // dusty pink-orange haze on the horizon

/* repeatable "random" numbers, so the skyline looks the same on every visit */
function rng(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- buildings: one merged mesh, windows drawn by the shader ---------- */
const BODY_VERT = `
  attribute float aSeed; attribute float aTop; attribute vec3 aTint;
  varying vec3 vW; varying float vSeed; varying float vTop; varying vec3 vTint; varying vec3 vN;
  void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; vSeed = aSeed; vTop = aTop; vTint = aTint;
    vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`;
const BODY_FRAG = `
  uniform float uTime; uniform float uMirror; uniform vec3 uHaze;
  varying vec3 vW; varying float vSeed; varying float vTop; varying vec3 vTint; varying vec3 vN;
  float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  void main(){
    float hgt = abs(vW.y);
    vec3 base = mix(vec3(.02, .035, .085), vec3(.07, .12, .26), clamp(hgt / 34., 0., 1.)) * (.8 + .5 * vSeed);
    vec2 g = vec2((vW.x + vW.z) * 2.6 + vSeed * 13., hgt * 3.1);
    vec2 cell = floor(g), f = fract(g);
    float win = step(.2, f.x) * step(f.x, .8) * step(.25, f.y) * step(f.y, .75);
    float lit = step(.58, h(cell + vSeed * 7.)) * (.45 + .55 * h(cell.yx));
    float blink = .75 + .25 * sin(uTime * (.5 + h(cell) * 2.) + h(cell + 3.) * 30.);
    vec3 wc = mix(vec3(1., .8, .48), vec3(.62, .9, 1.), step(.62, h(cell * 1.7 + vSeed)));
    vec3 col = base + wc * win * lit * blink * .8;
    float rim = pow(clamp(dot(normalize(vN), normalize(vec3(-.55, .1, -.8))) * .5 + .5, 0., 1.), 3.);
    col += vec3(.95, .5, .3) * rim * .22 + vTint * .03;
    float cap = smoothstep(vTop - .55, vTop, hgt) * step(hgt, vTop + .01);       // neon line along the roof edge
    col += vec3(.35, .85, 1.) * cap * .9;
    float fog = smoothstep(-6., -78., vW.z);
    col = mix(col, uHaze * .85, fog * .72);
    float a = 1.;
    if (uMirror > .5) { a = .5 * exp(-hgt * .075); col *= .85 + .15 * sin(hgt * 9. + uTime * 1.4 + vW.x * .6); }
    gl_FragColor = vec4(col, a);
  }`;

function bodyMaterial(mirror) {
  return new ShaderMaterial({
    vertexShader: BODY_VERT, fragmentShader: BODY_FRAG, side: DoubleSide,
    uniforms: { uTime: { value: 0 }, uMirror: { value: mirror ? 1 : 0 }, uHaze: { value: HAZE } },
    transparent: !!mirror, depthWrite: !mirror,
  });
}

function buildCity() {
  const parts = [], rand = rng(818);
  const add = (geo, { x = 0, y = 0, z = 0, ry = 0, tint = [0.3, 0.4, 0.6], seed = rand() } = {}) => {
    geo.rotateY(ry); geo.translate(x, y, z);
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.deleteAttribute('uv');
    g.computeBoundingBox();
    const cnt = g.attributes.position.count, top = g.boundingBox.max.y;
    g.setAttribute('aSeed', new BufferAttribute(new Float32Array(cnt).fill(seed), 1));
    g.setAttribute('aTop', new BufferAttribute(new Float32Array(cnt).fill(top), 1));
    g.setAttribute('aTint', new BufferAttribute(new Float32Array(cnt * 3).map((_, i) => tint[i % 3]), 3));
    parts.push(g);
  };
  const box = (w, h, d, o) => add(new BoxGeometry(w, h, d).translate(0, h / 2, 0), o);
  const cyl = (rt, rb, h, sides, o) => add(new CylinderGeometry(rt, rb, h, sides).translate(0, h / 2, 0), o);

  /* Burj Khalifa: stepped tiers + three wings at the foot + spire */
  const BX = 9, BZ = -10, S = 0.86;
  let y = 0;
  [[2.6, 2.35, 8], [2.2, 1.95, 6], [1.85, 1.6, 5.5], [1.55, 1.3, 5], [1.25, 1.05, 4.5], [1.0, 0.82, 4], [0.8, 0.62, 3.5], [0.55, 0.4, 3]].forEach(([rb, rt, h], i) => {
    cyl(rt * S, rb * S, h * S, 6, { x: BX, y: y, z: BZ, ry: i * 0.35, tint: [0.2, 0.7, 1.0], seed: 0.31 + i * 0.07 });
    y += h * S;
  });
  cyl(0.02, 0.2, 7 * S, 6, { x: BX, y, z: BZ, tint: [0.4, 0.8, 1] });
  for (let k = 0; k < 3; k++) {
    const a = k * (Math.PI * 2 / 3);
    box(0.7, 15 - k * 2.5, 3.8, { x: BX + Math.cos(a) * 1.6, y: 0, z: BZ + Math.sin(a) * 1.6, ry: -a, tint: [0.2, 0.7, 1.0], seed: 0.5 });
  }
  box(9, 1.6, 7, { x: BX, z: BZ, tint: [0.3, 0.5, 0.8] });

  /* Burj Al Arab: a sail on its own island */
  const sail = new Shape(); sail.moveTo(0, 0); sail.lineTo(0, 13); sail.quadraticCurveTo(0.7, 5.2, 6.4, 0); sail.closePath();
  add(new ExtrudeGeometry(sail, { depth: 1.5, bevelEnabled: false }).translate(-1.5, 0, -0.75), { x: -38, z: -2, ry: -0.35, tint: [0.9, 0.9, 1.0], seed: 0.77 });
  box(2.2, 1.1, 2.4, { x: -34.6, z: -1, tint: [0.9, 0.9, 1] });
  box(13, 0.4, 7, { x: -37, z: -2, tint: [0.4, 0.5, 0.7] });

  /* Cayan tower: a box that twists 90 degrees as it rises */
  for (let i = 0; i < 26; i++) box(2.5, 0.65, 2.5, { x: 33, y: i * 0.62, z: -15, ry: (i / 25) * Math.PI / 2, tint: [0.5, 0.7, 1.0], seed: 0.12 });

  /* Emirates Towers: two triangular prisms with pointed tops */
  [[-19, 18], [-13.5, 14.5]].forEach(([x, h], i) => {
    cyl(1.9, 2.1, h, 3, { x, z: -24, ry: i * 0.5, tint: [0.7, 0.8, 1], seed: 0.2 + i * 0.3 });
    cyl(0.05, 1.7, 3.2, 3, { x, y: h, z: -24, ry: i * 0.5, tint: [0.7, 0.8, 1], seed: 0.6 });
  });

  /* ordinary towers, tallest near the middle */
  const keepOut = [[BX, BZ, 7], [-37, -2, 10], [33, -15, 5], [-16, -24, 7], [21, -3, 8]];
  for (let n = 0; n < 150; n++) {
    const x = (rand() - 0.5) * 170, z = -8 - rand() * 62;
    if (keepOut.some(([kx, kz, r]) => Math.hypot(x - kx, (z - kz) * 0.8) < r)) continue;
    const mid = 1 - Math.min(Math.abs(x) / 85, 1);
    const h = 4 + rand() * 11 + mid * (6 + rand() * 7) * (z < -30 ? 0.8 : 1);
    const w = 1.3 + rand() * 2.3;
    box(w, h, w * (0.8 + rand() * 0.6), { x, z, tint: [0.3 + rand() * 0.4, 0.4 + rand() * 0.3, 0.7 + rand() * 0.3], ry: (rand() - 0.5) * 0.15 });
    if (rand() > 0.72) box(w * 0.55, h * 0.3, w * 0.55, { x, y: h, z, tint: [0.4, 0.6, 1] });
  }
  return mergeGeometries(parts, false);
}

/* gold Dubai Frame + the glowing fabric of the Burj Al Arab (separate, they are not window buildings) */
function landmarkDecor(mirror) {
  const g = new Group();
  const gold = new MeshBasicMaterial({ color: '#ffc468', transparent: mirror, opacity: mirror ? 0.35 : 1 });
  const px = (x, y, w, h) => { const m = new Mesh(new BoxGeometry(w, h, 1.5), gold); m.position.set(21 + x, y, -3); g.add(m); };
  px(-3.1, 4.6, 1.1, 9.2); px(3.1, 4.6, 1.1, 9.2); px(0, 9.2, 7.3, 1.1);
  const sailShape = new Shape(); sailShape.moveTo(0, 0); sailShape.lineTo(0, 13); sailShape.quadraticCurveTo(0.7, 5.2, 6.4, 0); sailShape.closePath();
  const glow = new Mesh(new ShapeGeometry(sailShape), new MeshBasicMaterial({ color: '#9fdcff', transparent: true, opacity: mirror ? 0.12 : 0.3, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }));
  glow.position.set(-38, 0, -2 + 0.78); glow.rotation.y = -0.35; glow.position.x = -38 - 1.5 * Math.cos(-0.35) + 0.0; g.add(glow);
  return g;
}

/* ---------- sky + water ---------- */
function skyMesh() {
  const geo = new BufferGeometry(); geo.setAttribute('position', new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const m = new Mesh(geo, new ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: 'varying vec2 vU; void main(){ vU = position.xy * .5 + .5; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `uniform float uTime; varying vec2 vU;
      float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      void main(){
        float y = vU.y;
        vec3 col = mix(vec3(1., .52, .26), vec3(.62, .26, .55), smoothstep(.22, .5, y));
        col = mix(col, vec3(.07, .12, .38), smoothstep(.42, .88, y));
        float sun = exp(-length((vU - vec2(.7, .3)) * vec2(1.3, 2.6)) * 4.);
        col += vec3(1., .6, .3) * sun * .6;
        vec2 sc = vU * vec2(300., 140.); vec2 sg = floor(sc); float st = step(.985, h(sg)) * smoothstep(.45, .7, y) * (.5 + .5 * sin(uTime * 2. + h(sg + 1.) * 40.)) * smoothstep(.3, .0, length(fract(sc) - .5));
        col += vec3(.8, .9, 1.) * st;
        float a = 1. - smoothstep(.78, 1., y);
        gl_FragColor = vec4(col, a);
      }`,
    depthTest: false, depthWrite: false, transparent: false,
    blending: CustomBlending, blendEquation: AddEquation, blendSrc: SrcAlphaFactor, blendDst: OneMinusSrcAlphaFactor,
  }));
  m.frustumCulled = false; m.renderOrder = -10; return m;
}
function waterMesh() {
  const m = new Mesh(new PlaneGeometry(400, 260).rotateX(-Math.PI / 2), new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uHaze: { value: HAZE } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform float uTime; uniform vec3 uHaze; varying vec3 vW;
      void main(){
        float near = clamp((vW.z + 70.) / 135., 0., 1.);
        vec3 col = mix(uHaze * .62, vec3(.01, .03, .09), pow(near, .6));
        float rip = sin(vW.x * .9 + sin(vW.z * .35 + uTime * .6) * 2. + uTime * .5) * sin(vW.z * 1.7 - uTime * .9);
        col += vec3(.25, .5, .9) * pow(max(rip, 0.), 6.) * .25 * near;
        gl_FragColor = vec4(col, .9);
      }`,
    transparent: true, depthWrite: false,
  }));
  m.renderOrder = 0; return m;
}

/* ---------- the two figures ---------- */
function person(scale = 1) {
  const g = new Group();
  const cloth = new MeshStandardMaterial({ color: '#f1ece0', roughness: 0.85, metalness: 0, side: DoubleSide });
  const robe = new Mesh(new LatheGeometry([[0, 0], [0.31, 0], [0.3, 0.2], [0.26, 0.9], [0.22, 1.26], [0.17, 1.42], [0.08, 1.5], [0, 1.52]].map(([x, y]) => new Vector2(x, y)), 28), cloth);
  g.add(robe);
  for (const s of [-1, 1]) { const arm = new Mesh(new CapsuleGeometry(0.058, 0.6, 4, 8), cloth); arm.position.set(s * 0.255, 0.98, 0); arm.rotation.z = s * 0.07; g.add(arm); }
  const skin = new Mesh(new SphereGeometry(0.1, 20, 16), new MeshStandardMaterial({ color: '#7a5640', roughness: 0.7 })); skin.position.y = 1.6; g.add(skin);
  const ghutra = new Mesh(new LatheGeometry([[0.0, 1.8], [0.075, 1.795], [0.13, 1.74], [0.15, 1.66], [0.18, 1.56], [0.24, 1.47], [0.285, 1.41], [0.25, 1.39], [0.2, 1.46], [0.14, 1.55], [0.1, 1.58]].map(([x, y]) => new Vector2(x, y)), 28), cloth);
  g.add(ghutra);
  const agal = new Mesh(new TorusGeometry(0.138, 0.013, 8, 32), new MeshStandardMaterial({ color: '#111', roughness: 0.5 })); agal.rotation.x = Math.PI / 2; agal.position.y = 1.72; g.add(agal);
  g.scale.setScalar(scale);
  return g;
}

export function createSkylineView({ small = false } = {}) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 2.5, 0.5, 400);

  scene.add(skyMesh());
  const water = waterMesh(); scene.add(water);

  const bodyGeo = buildCity();
  const matReal = bodyMaterial(false), matMirror = bodyMaterial(true);
  const real = new Group(); real.add(new Mesh(bodyGeo, matReal)); real.add(landmarkDecor(false));
  const mirror = new Group(); const mm = new Mesh(bodyGeo, matMirror); mm.renderOrder = 1; mirror.add(mm); const md = landmarkDecor(true); md.children.forEach(c => { c.renderOrder = 1; }); mirror.add(md);
  mirror.scale.y = -1;
  scene.add(real, mirror);

  /* neon ring and a red beacon on the Burj spire */
  const rings = [0, 1].map(i => {
    const r = new Mesh(new TorusGeometry(3.4 + i * 0.9, 0.035, 8, 100), new MeshBasicMaterial({ color: i ? '#ffffff' : '#5ee0ff', transparent: true, opacity: 0.8, blending: AdditiveBlending, depthWrite: false }));
    r.position.set(9, 27 + i * 3.5, -10); r.rotation.x = Math.PI / 2.2; scene.add(r); return r;
  });
  const beacon = new Sprite(new SpriteMaterial({ map: glowTexture(), color: '#ff5050', transparent: true, depthWrite: false, blending: AdditiveBlending }));
  beacon.position.set(9, 38.5, -10); beacon.scale.set(1.6, 1.6, 1); scene.add(beacon);
  const sunGlow = new Sprite(new SpriteMaterial({ map: glowTexture(), color: '#ff8a4a', transparent: true, opacity: 0.55, depthWrite: false, blending: AdditiveBlending }));
  sunGlow.position.set(50, 8, -90); sunGlow.scale.set(90, 50, 1); scene.add(sunGlow);

  /* lights on the water */
  const N = small ? 60 : 140, bp = new Float32Array(N * 3), rand = rng(5);
  for (let i = 0; i < N; i++) { bp[i * 3] = (rand() - 0.5) * 120; bp[i * 3 + 1] = 0.12; bp[i * 3 + 2] = 40 - rand() * 100; }
  const bg = new BufferGeometry(); bg.setAttribute('position', new BufferAttribute(bp, 3));
  const bokeh = new Points(bg, new PointsMaterial({ size: 1.4, map: glowTexture(64), color: '#ffcf8a', transparent: true, opacity: 0.55, depthWrite: false, blending: AdditiveBlending })); scene.add(bokeh);

  /* terrace + figures in the foreground */
  const deck = new Mesh(new BoxGeometry(46, 0.5, 20), new MeshStandardMaterial({ color: '#070d1c', roughness: 0.4, metalness: 0.6 })); deck.position.set(0, -0.26, 54); scene.add(deck);
  
  const p1 = person(1.5); p1.position.set(-1.6, 0, 46); p1.rotation.y = 0.12; scene.add(p1);
  const p2 = person(1.4); p2.position.set(1.4, 0, 46.4); p2.rotation.y = -0.1; scene.add(p2);

  scene.add(new HemisphereLight('#7f8cff', '#101830', 1.3));
  const key = new DirectionalLight('#ffb27a', 3.2); key.position.set(30, 12, -50); key.target.position.set(0, 1, 47); scene.add(key, key.target);
  const fill = new PointLight('#7fd0ff', 140, 60, 2); fill.position.set(0, 5, 62); scene.add(fill);

  const target = new Vector3(-17, 12, -10);
  function resize(w, h) {
    const aspect = w / h; camera.aspect = aspect;
    camera.fov = Math.max(38, (2 * Math.atan(0.5 / aspect) * 180) / Math.PI);   // keep the skyline's width in view on narrow screens
    camera.updateProjectionMatrix();
  }
  function update({ time }, local, { progress }) {
    camera.position.set(Math.sin(time * 0.1) * 4 + local.mx * 4, 3.4 - local.my * 0.5, 68 - progress * 8);
    camera.lookAt(target.x + local.mx * 2, target.y, target.z);
    matReal.uniforms.uTime.value = matMirror.uniforms.uTime.value = time;
    water.material.uniforms.uTime.value = time; scene.children[0].material.uniforms.uTime.value = time;
    rings[0].rotation.z = time * 0.5; rings[1].rotation.z = -time * 0.35; rings[1].position.y = 30.5 + Math.sin(time) * 0.4;
    beacon.material.opacity = 0.4 + 0.6 * (Math.sin(time * 3) > 0.2 ? 1 : 0);
    bokeh.material.opacity = 0.45 + 0.15 * Math.sin(time * 1.3);
    p1.rotation.y = 0.12 + Math.sin(time * 0.3) * 0.04;
  }
  return { scene, camera, update, resize };
}
