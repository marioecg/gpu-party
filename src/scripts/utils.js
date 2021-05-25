import * as THREE from 'three';

// Randomly positions points on a sphere
export function getRandomSpherePoint() {
  const u = Math.random();
  const v = Math.random();

  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  const r = Math.cbrt(Math.random());

  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);

  const vector = new THREE.Vector3();

  vector.x = r * sinPhi * cosTheta;
  vector.y = r * sinPhi * sinTheta;
  vector.z = r * cosPhi;

  return vector;
}

// Fullscreen triangle to use Render Traget Texture
export function getFullscreenTriangle() {
  const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
  const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

// Get width and height of view in world space coordinates
export function getViewSizeAtDepth(camera, depth = 0) {
  const fovInRadians = (camera.fov * Math.PI) / 180;
  const height = Math.abs(
    (camera.position.z - depth) * Math.tan(fovInRadians / 2) * 2
  );
  return { width: height * camera.aspect, height };
}
