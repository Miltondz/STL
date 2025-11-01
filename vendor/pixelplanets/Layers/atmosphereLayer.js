import { Mesh, Vector4, ShaderMaterial, PlaneGeometry } from 'three';

const vertexShader = () => `
  varying vec3 vUv;
  void main() {
    vUv = position;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
  }
`;

const fragmentShader = () => `
  varying vec3 vUv;
  uniform vec4 color;
  uniform vec4 color2;
  uniform vec4 color3;
  float pixels = 100.0;
  void main() {
    vec2 uv = (floor(vUv.xy * pixels) / pixels) + 0.5;
    vec2 pos_ndc = 2.0 * uv.xy - 1.0;
    float d = length(pos_ndc);
    float step0 = 0.65;
    float step1 = 0.87;
    float step2 = 0.97;
    float step3 = 1.04;
    float step4 = 1.04;
    vec4 c = mix(vec4(0,0,0,0), color, smoothstep(step0, step1, d));
    c = mix(c, color2, smoothstep(step1, step2, d));
    c = mix(c, color3, smoothstep(step2, step3, d));
    c = mix(c, vec4(0,0,0,0), smoothstep(step3, step4, d));
    gl_FragColor = c;
  }
`;

export const createAtmosphereLayer = () => {
  const geometry = new PlaneGeometry(1.02, 1.02);
  const material = new ShaderMaterial({
    uniforms: {
      color: { value: new Vector4(173/255,216/255,230/255, 0.25) },
      color2: { value: new Vector4(0/255,127/255,255/255,  0.35) },
      color3: { value: new Vector4(0/255,0/255,128/255,    0.45) }
    },
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
    transparent: true,
  });
  return new Mesh(geometry, material);
};
