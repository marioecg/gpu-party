uniform sampler2D texture;
uniform sampler2D texture2;

varying vec2 vUv;

void main() {                       
  // sample textures
  vec4 result = texture2D(texture, vUv);
  vec4 startT = texture2D(texture2, vUv);                
  result.rgb += 0.001;
  result.rgb = mod(result.rgb, 1.0);

  result.a = 1.0;                   
  
  gl_FragColor = result;              
}