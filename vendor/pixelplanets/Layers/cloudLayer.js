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

const fragmentShader = () => `
  varying vec3 vUv;
  uniform float pixels;
  uniform float rotation;
  uniform float cloud_cover;
  uniform vec2 light_origin;
  uniform float time_speed;
  uniform float stretch;
  uniform vec4 base_color;
  uniform vec4 outline_color;
  uniform vec4 shadow_base_color;
  uniform vec4 shadow_outline_color;
  uniform float seed;
  uniform float time;

  float size = 0.8;

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
    float alphaMask = 1.0 - smoothstep(size, size + 0.05, d);

    vec2 p = rotate(pos_ndc, rotation + time * time_speed + seed);
    p.x *= stretch;
    float n = fbm(p + seed);

    float c = smoothstep(0.4, 0.9, n);
    float a = smoothstep(0.7, 1.0, n);

    vec4 col = mix(base_color, outline_color, c);

    float light = clamp(dot(normalize(pos_ndc), normalize(light_origin)), 0.0, 1.0);
    vec4 shadow = mix(shadow_base_color, shadow_outline_color, c);
    col = mix(shadow, col, light);

    gl_FragColor = vec4(col.rgb, step(cloud_cover, c) * a * alphaMask * col.a);
  }
`;

export function createCloudLayer(colors, lightPos = new Vector2(0.39, 0.7), rotationSpeed = 0.1, rotation = 0.0, cloudCover = 0.546, stretch = 2.5) {
  const planetGeometryClouds = new PlaneGeometry(1, 1);
  const palette = colors || [
    new Vector4(0.9, 0.95, 1.0, 0.9),
    new Vector4(1.0, 1.0, 1.0, 0.95),
    new Vector4(0.7, 0.8, 1.0, 0.75),
    new Vector4(0.4, 0.5, 0.7, 0.6),
  ];
  const planetMaterialClouds = new ShaderMaterial({
    uniforms: {
      pixels: { value: 100.0 },
      rotation: { value: rotation },
      cloud_cover: { value: cloudCover },
      light_origin: { value: lightPos },
      time_speed: { value: rotationSpeed },
      stretch: { value: stretch },
      base_color: { value: palette[0] },
      outline_color: { value: palette[1] },
      shadow_base_color: { value: palette[2] },
      shadow_outline_color: { value: palette[3] },
      seed: { value: (flip() ? Math.random() * 10.0 : Math.random() * 100.0) },
      time: { value: 0.0 },
    },
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),
    transparent: true,
  });

  return new Mesh(planetGeometryClouds, planetMaterialClouds);
}
