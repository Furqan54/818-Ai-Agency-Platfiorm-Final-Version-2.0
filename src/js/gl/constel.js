/* Orbit hubs: a glowing core in the middle and the services circling it in 3D.
   The core is the 3D 818 mark (About page) or a wireframe "intelligence" sphere (Services page).
   Each service is a real link (<a class="node">) that follows its 3D position on screen. */
import {
  Group, Mesh, Scene, PerspectiveCamera, SphereGeometry, IcosahedronGeometry, WireframeGeometry, LineSegments, LineBasicMaterial, TorusGeometry,
  MeshBasicMaterial, ShaderMaterial, BufferGeometry, Float32BufferAttribute, BufferAttribute, Points, PointsMaterial, Sprite, SpriteMaterial,
  AdditiveBlending, Vector3, PointLight, Color,
} from 'three';
import { glowTexture, holoMaterial } from './common.js';
import { ribbonMesh, dust } from './logo.js';
import { clamp, lerp, r2 } from '../core/env.js';

const LINE_VERT = `attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`;
const LINE_FRAG = `uniform float uTime; uniform float uOff; varying float vT;
  void main(){ float pulse = pow(.5 + .5 * sin((vT * 6. - uTime * 1.6 + uOff) * 3.14159), 6.);
    gl_FragColor = vec4(vec3(.37,.88,1.) * (.35 + pulse * 1.2), .35 + pulse * .6); }`;

export function createConstelView(el, env, { small = false } = {}) {
  const mode = el.dataset.core === 'sphere' ? 'sphere' : 'logo';
  const nodes = Array.from(el.querySelectorAll('.node'));
  const n = nodes.length;

  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, 0.1, 60);
  const world = new Group(); scene.add(world);
  const tilt = mode === 'sphere' ? 1.1 : 0.55;
  world.rotation.x = tilt;

  /* ---- core ---- */
  const core = new Group(); world.add(core);
  let spin = null;
  if (mode === 'logo') {
    const r = ribbonMesh(env); r.scale.setScalar(1.0); core.add(r); spin = r;
    scene.add(new PointLight('#5ee0ff', 26, 16).translateX(-3).translateY(2).translateZ(4));
    scene.add(new PointLight('#2f5bff', 22, 16).translateX(3).translateY(-1).translateZ(3));
  } else {
    const sphere = new Mesh(new SphereGeometry(0.95, 48, 32), holoMaterial('#3aa8ff')); core.add(sphere);
    const wire = new LineSegments(new WireframeGeometry(new IcosahedronGeometry(1.0, 3)), new LineBasicMaterial({ color: '#5ee0ff', transparent: true, opacity: 0.35, blending: AdditiveBlending, depthWrite: false }));
    core.add(wire); spin = wire;
    for (let i = 0; i < 3; i++) {
      const ring = new Mesh(new TorusGeometry(1.25 + i * 0.16, 0.008, 8, 120), new MeshBasicMaterial({ color: i === 1 ? '#ffffff' : '#5ee0ff', transparent: true, opacity: 0.7, blending: AdditiveBlending, depthWrite: false }));
      ring.rotation.set(Math.PI / 2 + i * 0.5, i * 0.7, 0); ring.userData.s = 0.25 + i * 0.12; core.add(ring);
    }
  }
  const glow = new Sprite(new SpriteMaterial({ map: glowTexture(), color: '#2f7bff', transparent: true, opacity: 0.8, depthWrite: false, blending: AdditiveBlending }));
  glow.scale.set(mode === 'logo' ? 4.6 : 4.2, mode === 'logo' ? 4.6 : 4.2, 1); core.add(glow);
  world.add(dust(small ? 30 : 70, 1.2, 3.4, 0.06, '#9fe9ff'));

  /* ---- the services in orbit ---- */
  const radius = mode === 'sphere' ? 3.0 : 2.5;
  const ring = [];                                               // 3D object per service
  const lineGeo = new BufferGeometry();
  const lp = new Float32Array(n * 2 * 3), lt = new Float32Array(n * 2);
  const lineMat = new ShaderMaterial({ uniforms: { uTime: { value: 0 }, uOff: { value: 0 } }, vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, transparent: true, depthWrite: false, blending: AdditiveBlending });
  for (let i = 0; i < n; i++) { lt[i * 2] = 0; lt[i * 2 + 1] = 1; }
  lineGeo.setAttribute('position', new BufferAttribute(lp, 3)); lineGeo.setAttribute('aT', new BufferAttribute(lt, 1));
  const lines = new LineSegments(lineGeo, lineMat); lines.frustumCulled = false; world.add(lines);

  const packets = new Points(new BufferGeometry(), new PointsMaterial({ size: 0.12, map: glowTexture(64), color: '#ffffff', transparent: true, depthWrite: false, blending: AdditiveBlending }));
  const pp = new Float32Array(n * 3); packets.geometry.setAttribute('position', new BufferAttribute(pp, 3)); packets.frustumCulled = false; world.add(packets);

  for (let i = 0; i < n; i++) {
    const g = new Group();
    if (mode === 'logo') {
      const orb = new Mesh(new SphereGeometry(0.4, 32, 24), holoMaterial(i % 2 ? '#5ee0ff' : '#3a8dff')); g.add(orb);
      const halo = new Sprite(new SpriteMaterial({ map: glowTexture(), color: '#3aa0ff', transparent: true, opacity: 0.5, depthWrite: false, blending: AdditiveBlending })); halo.scale.set(1.9, 1.9, 1); g.add(halo);
    } else {
      const dot = new Sprite(new SpriteMaterial({ map: glowTexture(), color: '#5ee0ff', transparent: true, opacity: 0.9, depthWrite: false, blending: AdditiveBlending })); dot.scale.set(0.55, 0.55, 1); g.add(dot);
    }
    world.add(g); ring.push(g);
  }

  /* ---- sizing: keep the whole ring inside the box ---- */
  let W = 1, H = 1, fitX = 1;
  function resize(w, h) {
    W = w; H = h; camera.aspect = w / h;
    const fit = (radius + (mode === 'logo' ? 0.55 : 1.0)) * 1.0;
    const tanV = Math.tan((camera.fov * Math.PI) / 360);
    camera.position.set(0, 0, Math.max(fit / (tanV * Math.min(camera.aspect, 1.6) * (mode === 'sphere' ? 0.95 : 1.0)), 9));
    camera.updateProjectionMatrix();
    /* keep the widest point of the ring (plus half a node) inside the box */
    const halfW = camera.position.z * tanV * camera.aspect;
    const pxPerUnit = (w / 2) / halfW;
    const nodeHalf = mode === 'sphere' ? ((nodes[0] && nodes[0].offsetWidth) || 150) / 2 + 6 : 64;
    fitX = clamp(((w / 2) - nodeHalf) / (radius * pxPerUnit), 0.35, 1);
  }

  let paused = false, angle = 0;
  el.addEventListener('pointerenter', () => { paused = true; });
  el.addEventListener('pointerleave', () => { paused = false; });

  const v3 = new Vector3(), a = new Vector3();
  const rx = mode === 'sphere' ? 0.9 : 0.85;                      // ring width relative to its depth

  function update({ time, dt }, local) {
    if (!paused) angle += dt * 0.16;
    world.rotation.y = local.mx * 0.25;
    world.rotation.x = tilt + local.my * 0.12;
    lineMat.uniforms.uTime.value = time;
    core.children.forEach(c => { if (c.userData.s) c.rotation.z += dt * c.userData.s; });
    if (mode === 'logo') { spin.rotation.y = time * 0.55; spin.position.y = Math.sin(time * 1.2) * 0.05; }
    else { spin.rotation.y = time * 0.12; spin.rotation.x = time * 0.05; core.children[0].material.uniforms.uTime.value = time; }

    world.updateMatrixWorld(true);
    for (let i = 0; i < n; i++) {
      const th = angle + (i / n) * Math.PI * 2;
      const p = ring[i].position;
      p.set(Math.cos(th) * radius * fitX, Math.sin(th * 2 + i) * 0.18, Math.sin(th) * radius * rx);
      lp[i * 6] = 0; lp[i * 6 + 1] = 0; lp[i * 6 + 2] = 0; lp[i * 6 + 3] = p.x; lp[i * 6 + 4] = p.y; lp[i * 6 + 5] = p.z;
      const f = (time * 0.35 + i * 0.37) % 1;
      pp[i * 3] = p.x * f; pp[i * 3 + 1] = p.y * f; pp[i * 3 + 2] = p.z * f;
    }
    lineGeo.attributes.position.needsUpdate = true; packets.geometry.attributes.position.needsUpdate = true;
    world.updateMatrixWorld(true);

    /* move the link of every service onto its 3D position */
    for (let i = 0; i < n; i++) {
      ring[i].getWorldPosition(v3);
      const depth = clamp((v3.z + radius) / (radius * 2));             // 0 = far side, 1 = near side
      v3.project(camera);
      const x = (v3.x * 0.5 + 0.5) * W, y = (-v3.y * 0.5 + 0.5) * H;
      const s = 0.82 + depth * 0.26, op = 0.62 + depth * 0.38;
      const st = nodes[i].style;
      st.transform = `translate3d(${r2(x)}px,${r2(y)}px,0) translate(-50%,-50%) scale(${r2(s)})`;
      st.opacity = String(r2(op)); st.zIndex = String(Math.round(depth * 10));
      if (ring[i].children[0].material && ring[i].children[0].material.uniforms) ring[i].children[0].material.uniforms.uTime.value = time;
    }
  }
  return { scene, camera, update, resize };
}
