/* The 818 mark in 3D: a glossy blue ribbon folded into an "8", floating over a glowing platform.
   The ribbon is built from a mathematical curve (a vertical figure-eight whose two crossings are
   separated in depth) with a flat band swept along it and twisted. */
import {
  Group, Mesh, Points, BufferGeometry, BufferAttribute, Float32BufferAttribute, MeshPhysicalMaterial, MeshBasicMaterial, PointsMaterial,
  Vector3, DoubleSide, BackSide, AdditiveBlending, Sprite, SpriteMaterial, RingGeometry, CylinderGeometry, MeshStandardMaterial, PointLight, Scene, PerspectiveCamera, Color,
} from 'three';
import { glowTexture } from './common.js';

export function ribbonGeometry({ segs = 420, kx = 1.0, ky = 1.45, kz = 0.34, hw = 0.2, ht = 0.055 } = {}) {
  const pos = [], nor = [], col = [], idx = [];
  const top = new Color('#6fe6ff'), bottom = new Color('#2b4dff'), tmp = new Color();
  const P = new Vector3(), T = new Vector3(), Z = new Vector3(0, 0, 1), N0 = new Vector3(), B0 = new Vector3(), W = new Vector3(), V = new Vector3();
  const corner = [[-1, 1], [1, 1], [1, -1], [-1, -1]];            // (along W, along V)
  const normals = [V, W, V, W], signs = [1, 1, -1, -1];

  for (let i = 0; i <= segs; i++) {
    const t = (i / segs) * Math.PI * 2;
    P.set(kx * Math.sin(t) * Math.cos(t), ky * Math.cos(t), kz * Math.sin(t));
    T.set(kx * Math.cos(2 * t), -ky * Math.sin(t), kz * Math.cos(t)).normalize();
    N0.crossVectors(T, Z).normalize();
    B0.crossVectors(T, N0).normalize();
    const phi = (Math.PI / 2) * Math.sin(t);                      // the twist: the band turns edge-on at the crossings
    W.copy(N0).multiplyScalar(Math.cos(phi)).addScaledVector(B0, Math.sin(phi)).normalize();
    V.crossVectors(T, W).normalize();
    tmp.copy(bottom).lerp(top, (P.y / ky + 1) / 2);
    for (let f = 0; f < 4; f++) {
      const a = corner[f], b = corner[(f + 1) % 4];
      const n = normals[f], s = signs[f];
      for (const c of [a, b]) {
        pos.push(P.x + W.x * c[0] * hw + V.x * c[1] * ht, P.y + W.y * c[0] * hw + V.y * c[1] * ht, P.z + W.z * c[0] * hw + V.z * c[1] * ht);
        nor.push(n.x * s, n.y * s, n.z * s);
        col.push(tmp.r, tmp.g, tmp.b);
      }
    }
  }
  for (let i = 0; i < segs; i++) for (let f = 0; f < 4; f++) {
    const a = i * 8 + f * 2, b = a + 1, c = (i + 1) * 8 + f * 2, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  g.setAttribute('color', new Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  return g;
}

export function ribbonMesh(env) {
  const g = ribbonGeometry();
  const body = new Mesh(g, new MeshPhysicalMaterial({
    vertexColors: true, metalness: 0.05, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12,
    envMap: env, envMapIntensity: 0.55, emissive: new Color('#1646ff'), emissiveIntensity: 0.6, side: DoubleSide,
  }));
  // a thin neon halo hugging the ribbon (the inside-out copy, added on top of the scene)
  const rim = new Mesh(g, new MeshBasicMaterial({ color: '#3fb6ff', transparent: true, opacity: 0.28, side: BackSide, blending: AdditiveBlending, depthWrite: false }));
  rim.scale.setScalar(1.045);
  const grp = new Group(); grp.add(body, rim);
  return grp;
}

/* a ring of light dust around something */
export function dust(count, rMin, rMax, size, color) {
  const p = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = rMin + Math.random() * (rMax - rMin), a = Math.random() * Math.PI * 2, h = (Math.random() - 0.5) * 2 * rMax * 0.8;
    p[i * 3] = Math.cos(a) * r; p[i * 3 + 1] = h; p[i * 3 + 2] = Math.sin(a) * r;
  }
  const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(p, 3));
  return new Points(g, new PointsMaterial({ size, map: glowTexture(64), color, transparent: true, depthWrite: false, blending: AdditiveBlending, sizeAttenuation: true }));
}

/* the whole scene for [data-3d="logo"] */
export function createLogoView(env, { small = false } = {}) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 1.5, 9.5); camera.lookAt(0, -0.35, 0);

  const logo = new Group();
  const ribbon = ribbonMesh(env);
  logo.add(ribbon);
  scene.add(logo);
  scene.add(new PointLight('#5ee0ff', 28, 14).translateX(-3).translateY(1.5).translateZ(4));
  scene.add(new PointLight('#2f5bff', 24, 14).translateX(3).translateY(-1).translateZ(3));

  const halo = new Sprite(new SpriteMaterial({ map: glowTexture(), color: '#2f7bff', transparent: true, opacity: 0.65, depthWrite: false, blending: AdditiveBlending }));
  halo.scale.set(6.2, 6.2, 1); halo.position.z = -1.2; scene.add(halo);
  const halo2 = halo.clone(); halo2.material = halo.material.clone(); halo2.material.color.set('#5ee0ff'); halo2.material.opacity = 0.32; halo2.scale.set(3.2, 4.6, 1); halo2.position.z = -0.6; scene.add(halo2);

  const motes = dust(small ? 40 : 90, 1.4, 2.7, 0.07, '#9fe9ff'); scene.add(motes);

  /* platform */
  const base = new Group(); base.position.y = -2.0; scene.add(base);
  const disc = new Mesh(new CylinderGeometry(1.7, 1.9, 0.16, 48), new MeshStandardMaterial({ color: '#030a1c', metalness: 0.8, roughness: 0.35, envMap: env, envMapIntensity: 0.35 }));
  base.add(disc);
  const rings = [1.25, 1.55, 1.85].map((r, i) => {
    const m = new Mesh(new RingGeometry(r - 0.022, r, 80), new MeshBasicMaterial({ color: i === 1 ? '#ffffff' : '#5ee0ff', transparent: true, opacity: 1, side: DoubleSide, blending: AdditiveBlending, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.09; base.add(m); return m;
  });
  const pool = new Sprite(new SpriteMaterial({ map: glowTexture(), color: '#3aa0ff', transparent: true, opacity: 0.7, depthWrite: false, blending: AdditiveBlending }));
  pool.scale.set(5.5, 1.3, 1); pool.position.y = 0.2; base.add(pool);

  function resize(w, h) {                                           // keep the whole mark in view for any shape of box
    camera.aspect = w / h;
    camera.fov = 30;
    const z = Math.max(10.5, 6.4 / Math.tan((camera.fov * Math.PI) / 360) / 2 / Math.min(camera.aspect, 1.0) * 0.62);
    camera.position.set(0, z * 0.16, z);
    camera.lookAt(0, -0.3, 0);
    camera.updateProjectionMatrix();
  }
  function update({ time }, v) {
    logo.rotation.y = time * 0.55 + v.mx * 0.5;
    logo.rotation.x = v.my * 0.18 - 0.04;
    logo.position.y = Math.sin(time * 1.2) * 0.07 + 0.05;
    motes.rotation.y = -time * 0.18;
    halo.material.opacity = 0.55 + Math.sin(time * 1.6) * 0.1;
    rings.forEach((r, i) => { r.scale.setScalar(1 + 0.04 * Math.sin(time * 2 + i)); r.material.opacity = 0.55 + 0.35 * Math.sin(time * 1.5 + i * 1.3) ** 2; });
  }
  return { scene, camera, update, resize };
}
