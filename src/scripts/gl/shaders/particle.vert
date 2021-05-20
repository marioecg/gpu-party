uniform float uTime;
uniform sampler2D texturePosition;

void main() {
  vec4 tPos = texture2D(texturePosition, position.xy);

  gl_PointSize = 4.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(tPos.xyz, 1.0);
}