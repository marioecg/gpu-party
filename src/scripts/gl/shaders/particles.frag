uniform float uOpacity;

varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, uOpacity);
}