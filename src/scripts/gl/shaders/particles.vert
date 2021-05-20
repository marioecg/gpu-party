uniform sampler2D positions; // RenderTarget containing the transformed positions
uniform float uPointSize; // Size

void main() { 
  // The mesh is a nomrliazed square so the uvs = the xy positions of the vertices
  vec3 pos = texture2D(positions, position.xy).xyz; // pos now contains a 3D position in space, we can use it as a regular vertex

  // Regular projection of our position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
 
  // Sets the point size
  gl_PointSize = uPointSize;
}