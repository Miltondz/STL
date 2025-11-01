import { Mesh, PlaneGeometry, ShaderMaterial, Vector2, Vector4 } from 'three';
import { flip } from '../utils.js';

const vertexShader = () => `
  varying vec3 vUv;
  void main() {
    vUv = position;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
  }
`;

// Fragment shader adapted from PixelPlanets basePlanet.js
const fragmentShader = () => `
  varying vec3 vUv;
  uniform float lightIntensity;
  uniform float pixels;
  uniform float rotation;
  uniform vec2 light_origin;
  uniform float time_speed;
  uniform vec4 color1;
  uniform vec4 color2;
  uniform vec4 color3;
  uniform float seed;
  uniform float time;

  float dither_size = 0.7;
  float light_border_1 = 0.0;
  float light_border_2 = 0.09;
  float size = 0.8;
  int OCTAVES = 6;
  bool should_dither = true;

  float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);

    float res = mix(
      mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
      mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
  }

  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 6; ++i) {
      v += a * noise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, -s, s, c);
    return m * v;
  }

  void main() {
    vec2 uv = (floor(vUv.xy * pixels) / pixels) + 0.5;
    vec2 pos_ndc = 2.0 * uv.xy - 1.0;

    float d = length(pos_ndc);
    float a = 1.0 - smoothstep(size, size + 0.05, d);

    vec2 p = rotate(pos_ndc, rotation + time * time_speed + seed);
    p *= 1.5;
    float n = fbm(p + seed);

    vec4 col = mix(color1, color2, smoothstep(0.3, 0.6, n));
    col = mix(col, color3, smoothstep(0.6, 0.9, n));

    float light = clamp(dot(normalize(pos_ndc), normalize(light_origin)), 0.0, 1.0);
    col.rgb += light * lightIntensity;

    gl_FragColor = vec4(col.rgb, a * col.a);
  }
`;

export function createBasePlanet(lightIntensity = 0.1, rotation = 0.0, colors = null) {
  const planetGeometry = new PlaneGeometry(1, 1);
  const defaultColors = [
    new Vector4(155/255, 158/255, 184/255, 1),
    new Vector4(71/255, 97/255, 124/255, 1),
    new Vector4(53/255, 57/255, 85/255, 1),
  ];

  const palette = colors || defaultColors;

  const planetMaterial = new ShaderMaterial({
    uniforms: {
      pixels: { value: 100.0 },
      color1: { value: palette[0] },
      color2: { value: palette[1] },
      color3: { value: palette[2] },
      lightIntensity: { value: lightIntensity },
      light_origin: { value: new Vector2(0.39, 0.7) },
      time_speed: { value: 0.1 },
      rotation: { value: rotation },
      seed: { value: (flip() ? Math.random() * 10.0 : Math.random() * 100.0) },
      time: { value: 0.0 },
    },
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
    transparent: true,
  });

  return new Mesh(planetGeometry, planetMaterial);
}
