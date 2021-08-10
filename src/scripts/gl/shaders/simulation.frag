uniform sampler2D positions; // Data Texture containing original positions
uniform float uTime;
uniform float uSpeed;
uniform float uCurlFreq;

varying vec2 vUv;

#define PI 3.1415926538

#pragma glslify: curl = require(glsl-curl-noise)
#pragma glslify: noise = require(glsl-noise/classic/3d)

mat4 rotation3d(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(
		oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
		0.0,                                0.0,                                0.0,                                1.0
	);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	return (rotation3d(axis, angle) * vec4(v, 1.0)).xyz;
}

void main() {
  float t = uTime * 0.15 * uSpeed;

  vec2 uv = vUv;

  vec3 pos = texture2D(positions, uv).rgb; // basic simulation: displays the particles in place.
  vec3 curlPos = texture2D(positions, uv).rgb;
  vec3 finalPos = vec3(0.0);

  // Move the particles here
  // pos = rotate(pos, vec3(0.0, 0.0, 1.0), t + sin(length(pos.xy) * 2.0 + PI * 0.5) * 10.0);
  // pos = rotate(pos, vec3(1.0, 0.0, 0.0), -t);
  // pos.z += tan(length(length(pos.xy) * 10.0) - t) * 1.0;
  pos = curl(pos * uCurlFreq + t);

  curlPos = curl(curlPos * uCurlFreq + t);
  // if you uncomment the next noise additions
  // you'll get very pleasing flocking particles
  // inside the bounds of a sphere
  curlPos += curl(curlPos * uCurlFreq * 2.0) * 0.5;
  curlPos += curl(curlPos * uCurlFreq * 4.0) * 0.25;
  curlPos += curl(curlPos * uCurlFreq * 8.0) * 0.125;
  curlPos += curl(pos * uCurlFreq * 16.0) * 0.0625;

  finalPos = mix(pos, curlPos, noise(pos + t));
  
  gl_FragColor = vec4(finalPos, 1.0);
}