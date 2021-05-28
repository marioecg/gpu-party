uniform float uOpacity;
uniform float uTime;
uniform vec2 uResolution;


void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float circle = length(gl_PointCoord.xy - 0.5);
  circle = 1.0 - step(0.5, circle);
  if (circle < 1.0) discard;

  gl_FragColor = vec4(vec3(1.0), 1.0);
}