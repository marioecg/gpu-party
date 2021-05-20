uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  // vec4 tmpPos = texture2D(texturePosition, uv);
  // vec3 position = tmpPos.xyz;  

  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}