uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D tBuffer;

varying vec2 vUv;

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv;

  // Feedback
  vec4 toScreen = texture2D(tBuffer, uv);
  
  gl_FragColor = vec4(toScreen.rgb, 1.0);
}