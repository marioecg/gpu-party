uniform float uTime;
uniform sampler2D texturePosition;

void main() {
  gl_PointSize = 4.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}