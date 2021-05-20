import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

import particleVertex from './shaders/particle.vert';
import particleFragment from './shaders/particle.frag';

import velocityFragment from './shaders/velocity.frag';
import positionFragment from './shaders/position.frag';

export default class PingPong {
  constructor(renderer, camera, scene, opts = {}) {
    this.size = opts.size || 512;
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;

    this.createParticles();
    this.create();
  }

  create() {
    // Create computation renderer
    this.gpuCompute = new GPUComputationRenderer(this.size, this.size, this.renderer);

    // Create initial state float textures
    this.position = this.gpuCompute.createTexture();
    this.velocity = this.gpuCompute.createTexture();

    // Fill the texture data
    this.fillPositionTexture(this.position);
    this.fillVelocityTexture(this.velocity);

    // Add texture variables
    this.velocityVariable = this.gpuCompute.addVariable('textureVelocity', velocityFragment, this.position);
    this.positionVariable = this.gpuCompute.addVariable('texturePosition', positionFragment, this.velocity);

    // Add variable dependencies
    this.gpuCompute.setVariableDependencies(this.velocityVariable, [this.velocityVariable, this.positionVariable]);
    this.gpuCompute.setVariableDependencies(this.positionVariable, [this.velocityVariable, this.positionVariable]);
    
    // Add custom uniforms
    this.velocityVariable.material.uniforms.uTime = { value: 0 };

    // Check for completeness
    const error = this.gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }    
  }

  render() {
    // Compute
    this.gpuCompute.compute();
    
    // Update texture uniforms in your visualization materials with the gpu renderer output
    // myMaterial.uniforms.myTexture.value = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture; // ??
    
    // Rendering
    this.renderer.render(this.scene, this.camera);    
  }

  fillPositionTexture(texture) {
    const array = texture.image.data;

    for (let i = 0; i < array.length; i += 4) {
      const x = Math.random() - 0.5;
      const y = Math.random() - 0.5;
      const z = Math.random() - 0.5;

      array[i + 0] = x;
      array[i + 1] = y;
      array[i + 2] = z;
      array[i + 3] = 1;
    }
  }

  fillVelocityTexture(texture) {
    const array = texture.image.data;

    for (let i = 0; i < array.length; i += 4) {
      const x = Math.random() - 0.5;
      const y = Math.random() - 0.5;
      const z = Math.random() - 0.5;

      array[i + 0] = x * 10;
      array[i + 1] = y * 10;
      array[i + 2] = z * 10;
      array[i + 3] = 1;
    }
  }

  createParticles() {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        uTime: { value: 0 },
      },
    });

    // Populate particles
    let particles = this.size * this.size;
    let position = new Float32Array(particles * 3);

    for (let i = 0, j = 0; i < particles * 3; i += 3, j++) {
      position[i + 0] = (j % this.size) / this.size;
      position[i + 1] = ((j / this.size) | 0) / this.size;
      position[i + 2] = 0;

      // position[i + 0] = Math.random() - 0.5;
      // position[i + 1] = Math.random() - 0.5;
      // position[i + 2] = Math.random() - 0.5;      
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));

    this.points = new THREE.Points(geometry, material);

    this.scene.add(points);
  }
}