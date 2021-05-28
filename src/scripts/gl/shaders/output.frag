uniform sampler2D fb2output;                        

varying vec2 vUv;

void main() {
  vec4 col = texture2D(fb2output, vUv);                      

  gl_FragColor = col;
}