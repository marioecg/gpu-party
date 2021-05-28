uniform sampler2D positions;
uniform float uPointSize; 
uniform float uTime;

#pragma glslify: noise = require(glsl-noise/classic/3d)
#pragma glslify: map = require(glsl-map)

void main() { 
  vec3 pos = texture2D(positions, position.xy).xyz;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  // gl_PointSize = uPointSize / -mvPoxsition.z;
  gl_PointSize = 1.0;
}