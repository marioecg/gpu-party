uniform float uOpacity;
uniform float uTime;
uniform vec2 uResolution;

#pragma glslify: noise = require(glsl-noise/classic/3d)

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float circle = length(gl_PointCoord.xy - 0.5);
  circle = 1.0 - step(0.5, circle);
  if (circle < 1.0) discard;
  // if (circle < 1.0) discard;
  // gl_FragColor = vec4(vec3(1.0), 0.25);
  vec3 color1 = vec3(1.0, 0.0, 0.0);
  vec3 color2 = vec3(0.0, 0.0, 1.0);
  float n = noise(uv.xyx * 2.0 + uTime * 0.2) * 0.5 + 0.5;
  vec3 finalColor = mix(color1, color2, n);

  gl_FragColor = vec4(finalColor, uOpacity);
}