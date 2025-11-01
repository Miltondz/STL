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
  uniform float land_cutoff;
  uniform vec4 col1;
  uniform vec4 col2;
  uniform vec4 col3;
  uniform vec4 col4;
  uniform float lightIntensity;
  uniform vec2 light_origin;
  uniform float time_speed;
  uniform float rotation;
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
    float a = 1.0 - smoothstep(size, size + 0.05, d);

    vec2 p = rotate(pos_ndc, rotation + time * time_speed + seed);
    p *= 1.5;
    float fbm1 = fbm(p + seed);

    vec4 col = mix(col1, col2, smoothstep(0.3, 0.6, fbm1));
    col = mix(col, col3, smoothstep(0.6, 0.9, fbm1));
    col = mix(col, col4, smoothstep(0.8, 1.0, fbm1));

    float light = clamp(dot(normalize(pos_ndc), normalize(light_origin)), 0.0, 1.0);
    col.rgb += light * lightIntensity;

    gl_FragColor = vec4(col.rgb, step(land_cutoff, fbm1) * a * col.a);
  }
`;

export function createlandMassLayer(lightPos = new Vector2(0.39, 0.7), lightIntensity = 0.1, colors = null, rotationSpeed = 0.1, rotation = 0.0, land = 0.6) {
  const planetGeometry = new PlaneGeometry(1, 1);
  const palette = colors || [
    new Vector4(0.784314, 0.831373, 0.364706, 1),
    new Vector4(0.388235, 0.670588, 0.247059, 1),
    new Vector4(0.184314, 0.341176, 0.32549, 1),
    new Vector4(0.156863, 0.207843, 0.25098, 1),
  ];
  const planetMaterial = new ShaderMaterial({
    uniforms: {
      pixels: { value: 100.0 },
      land_cutoff: { value: land },
      col1: { value: palette[0] },
      col2: { value: palette[1] },
      col3: { value: palette[2] },
      col4: { value: palette[3] },
      lightIntensity: { value: lightIntensity },
      light_origin: { value: lightPos },
      time_speed: { value: rotationSpeed },
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
