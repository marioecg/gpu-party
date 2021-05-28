uniform sampler2D texture;                      

varying vec2 vUv;

void main() {
  vec4 col = texture2D(texture, vUv);
  
  gl_FragColor = col;
}