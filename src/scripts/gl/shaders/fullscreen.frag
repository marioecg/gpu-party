uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv - 0.5;
  uv.x *= aspect;

  vec3 color1 = vec3(0.0, 0.0, 0.0);
  vec3 color2 = vec3(1.0, 0.0, 0.5);
  float pattern = sin(length(uv) * 1.0);
  vec3 background = mix(
    color1,
    color2,
    1.0 - pattern
  );
  gl_FragColor = vec4(vec3(0.0), 1.0);
}