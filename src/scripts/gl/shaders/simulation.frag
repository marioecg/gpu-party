uniform sampler2D positions; // DATA Texture containing original positions
uniform float uTime;

varying vec2 vUv;

void main() {
  // Basic simulation: displays the particles in place.
  vec3 pos = texture2D(positions, vUv).rgb;

  // We can move the particle here
  // pos.z += sin(length(length(pos.xy - 0.5) * 10.0 - 0.5) + uTime);
  
  gl_FragColor = vec4(pos, 1.0);
}