import * as THREE from 'three';

export default class FBO {
  constructor(width, height, renderer, simulationMaterial, renderMaterial) {
    this.width = width;
    this.height = height; 
    this.renderer = renderer;
    this.simulationMaterial = simulationMaterial;
    this.renderMaterial = renderMaterial;

    this.gl = this.renderer.getContext();
    
    this.lastRenderTarget = null;

    this.init();
  }

  init() {
    this.checkHardware();
    this.createTarget();
    this.simSetup();
    this.createParticles();
  }

  checkHardware() {
    // We need FLOAT textures to store positions
    // https://github.com/KhronosGroup/WebGL/blob/master/sdk/tests/conformance/extensions/oes-texture-float.html
    if(!this.gl.getExtension('OES_texture_float')) {
      throw new Error('float textures not supported');
    }

    // We need to access textures from within the vertex shader
    // https://github.com/KhronosGroup/WebGL/blob/90ceaac0c4546b1aad634a6a5c4d2dfae9f4d124/conformance-suites/1.0.0/extra/webgl-info.html
    if(this.gl.getParameter(this.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
      throw new Error('vertex shader cannot read textures');
    }    
  }    

  createTarget() {
    // Render taret Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

    // Create a render target texture
    this.rtt = new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.NearestFilter, // Important as we want to sample square pixels
      magFilter: THREE.NearestFilter,
      format: THREE.RGBFormat, // Could also be RGBAFormat (like to have a color for each particle)
      type: THREE.FloatType // Important as we need precise coordinates (not ints)
    });    
  }

  simSetup() {
    // Simulation
    // Create a bi-unit quadrilateral and uses the simulation material to update the float texture
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([
        -1, -1, 0,
         1, -1, 0,
         1,  1, 0,

        -1, -1, 0,
         1,  1, 0,
        -1,  1, 0
      ]),
      3
    ));

    geometry.setAttribute('uv', new THREE.BufferAttribute(
      new Float32Array([
        0,1,
        1,1,
        1,0,

        0,1,
        1,0,
        0,0
      ]),
      2
    ));

    const mesh = new THREE.Mesh(geometry, this.simulationMaterial);
    this.scene.add(mesh);        
  }

  createParticles() {
    // Create a vertex buffer of size width * height with normalized coordinates   
    const length = this.width * this.height; 
    let vertices = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      let i3 = i * 3;
      vertices[i3 + 0] = (i % this.width) / this.width;
      vertices[i3 + 1] = (i / this.width) / this.height;
    }    
    
    // Create the particles geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));  
    
    // The renderMaterial is used to render the particles
    this.particles = new THREE.Points(geometry, this.renderMaterial);    
  }

  update() {
    // Update the simulation and render the result in a target texture
    this.lastRenderTarget = this.renderer.renderTarget;
    this.renderer.setRenderTarget(this.rtt);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(this.lastRenderTarget == null ? null : this.lastRenderTarget);
    
    // Use the result of the swap as the new position for the particles' renderer
    this.particles.material.uniforms.positions.value = this.rtt;    
  }
}