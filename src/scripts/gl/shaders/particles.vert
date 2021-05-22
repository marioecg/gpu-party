uniform sampler2D positions;
uniform float uPointSize; 

void main() { 
  vec3 pos = texture2D(positions, position.xy).xyz;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  // gl_PointSize = uPointSize / -mvPosition.z;
  gl_PointSize = uPointSize;
}