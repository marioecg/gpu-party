uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D tBuffer;

varying vec2 vUv;

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv;
  uv -= 0.5;
  uv *= 0.99;
  uv += 0.5;  

  // Feedback
  vec4 feedback = texture2D(tBuffer, uv);
  
  gl_FragColor = vec4(feedback.rgb, 0.9);
}