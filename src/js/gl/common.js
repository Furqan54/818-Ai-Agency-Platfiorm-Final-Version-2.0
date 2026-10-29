/* Shared three.js helpers */
import { CanvasTexture, PMREMGenerator, SRGBColorSpace, ShaderMaterial, AdditiveBlending, Color } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/* soft reflections for glossy materials (made from a built-in room, no image file needed) */
export function makeEnv(renderer) {
  const pm = new PMREMGenerator(renderer);
  const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  pm.dispose();
  return tex;
}

/* a soft round glow, used for halos and sparkles */
export function glowTexture(size = 128) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,.55)');
  grad.addColorStop(0.6, 'rgba(255,255,255,.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, size, size);
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; return t;
}

/* glass-like orb: bright rim (fresnel) + a faint inner gradient, added on top of the scene */
export function holoMaterial(color = '#5ee0ff') {
  return new ShaderMaterial({
    uniforms: { uColor: { value: new Color(color) }, uTime: { value: 0 } },
    transparent: true, depthWrite: false, blending: AdditiveBlending,
    vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uTime; varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){
        float f = pow(1. - clamp(dot(normalize(vN), normalize(vV)), 0., 1.), 2.4);
        float band = .5 + .5 * sin(vP.y * 18. - uTime * 2.);
        vec3 c = uColor * (f * 1.5 + .10 + band * .05 * f);
        gl_FragColor = vec4(c, clamp(f * .9 + .12, 0., 1.));
      }`,
  });
}
