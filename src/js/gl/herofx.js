/* Service page hero: light dust and a few glass cubes floating in front of the picture. */
import {
  Scene, PerspectiveCamera, Group, Mesh, BoxGeometry, EdgesGeometry, LineSegments, LineBasicMaterial, MeshBasicMaterial,
  BufferGeometry, BufferAttribute, Points, PointsMaterial, AdditiveBlending,
} from 'three';
import { glowTexture } from './common.js';

export function createHeroFxView({ small = false } = {}) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1.6, 0.1, 60);
  camera.position.z = 16;

  const N = small ? 60 : 150, p = new Float32Array(N * 3), v = new Float32Array(N);
  for (let i = 0; i < N; i++) { p[i * 3] = (Math.random() - 0.5) * 30; p[i * 3 + 1] = (Math.random() - 0.5) * 14; p[i * 3 + 2] = (Math.random() - 0.5) * 12; v[i] = 0.1 + Math.random() * 0.35; }
  const geo = new BufferGeometry(); geo.setAttribute('position', new BufferAttribute(p, 3));
  const dust = new Points(geo, new PointsMaterial({ size: 0.22, map: glowTexture(64), color: '#8fe6ff', transparent: true, opacity: 0.8, depthWrite: false, blending: AdditiveBlending }));
  scene.add(dust);

  const cubes = new Group(); scene.add(cubes);
  const spots = [[7.5, 3.2, 1.2], [10, -2.4, 2.5], [4.4, -4.2, 0], [12.5, 4.5, -1.5], [-1.5, 4.8, -2], [-9, -3.5, -2], [8.2, 0.2, 4.5]];
  const count = small ? 4 : spots.length;
  for (let i = 0; i < count; i++) {
    const s = 0.5 + (i % 3) * 0.28, g = new Group();
    g.add(new Mesh(new BoxGeometry(s, s, s), new MeshBasicMaterial({ color: '#3aa8ff', transparent: true, opacity: 0.1, depthWrite: false, blending: AdditiveBlending })));
    g.add(new LineSegments(new EdgesGeometry(new BoxGeometry(s, s, s)), new LineBasicMaterial({ color: '#7fe9ff', transparent: true, opacity: 0.85 })));
    g.position.set(...spots[i]); g.userData = { y0: spots[i][1], ph: i * 1.3, sp: 0.2 + (i % 4) * 0.08 };
    cubes.add(g);
  }

  function resize(w, h) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function update({ time, dt }, local) {
    for (let i = 0; i < N; i++) { p[i * 3 + 1] += v[i] * dt; if (p[i * 3 + 1] > 7) p[i * 3 + 1] = -7; }
    geo.attributes.position.needsUpdate = true;
    cubes.children.forEach(c => {
      c.rotation.x = time * c.userData.sp + c.userData.ph; c.rotation.y = time * c.userData.sp * 1.3;
      c.position.y = c.userData.y0 + Math.sin(time * 0.8 + c.userData.ph) * 0.4;
    });
    camera.position.x = local.mx * 1.2; camera.position.y = -local.my * 0.7; camera.lookAt(0, 0, 0);
  }
  return { scene, camera, update, resize };
}
