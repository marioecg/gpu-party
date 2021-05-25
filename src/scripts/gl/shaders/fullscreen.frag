uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D tMap;

varying vec2 vUv;

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv;
  uv = fract(uv * 2.0);
  // uv -= 0.5;
  // uv *= 0.99;
  // uv += 0.5;  

  // Feedback
  vec4 feedback = texture2D(tMap, uv);
  
  gl_FragColor = vec4(feedback.rgb, 1.0);
}