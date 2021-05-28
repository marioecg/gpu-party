import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Events } from '../events';

import store from '../store';

import FBO from './FBO';

import simVertex from './shaders/simulation.vert';
import simFragment from './shaders/simulation.frag';
import particlesVertex from './shaders/particles.vert';
import particlesFragment from './shaders/particles.frag';
import bufferVertex from './shaders/buffer.vert';
import bufferFragment from './shaders/buffer.frag';
import quadVertex from './shaders/quad.vert';
import quadFragment from './shaders/quad.frag';

import { getRandomSpherePoint, getViewSizeAtDepth } from '../utils';

import GUI from '../gui';

export default new class {
  constructor() {
    this.renderer = new THREE.WebGL1Renderer({ 
      antialias: true, 
      alpha: true, 
    });
    this.dpr = Math.min(window.devicePixelRatio, 1.5);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(store.bounds.ww, store.bounds.wh);
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new THREE.PerspectiveCamera(
      45,
      store.bounds.ww / store.bounds.wh,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);

    this.scene = new THREE.Scene();

    this.canvas = null;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.clock = new THREE.Clock();
    this.time = null;
    this.viewSize = getViewSizeAtDepth(this.camera);

    this.init();
  }

  init() {
    this.addCanvas();
    this.addEvents();
    // this.setGui();
    this.feedbackSetup();
    this.createFeedbackObjects();
    // this.createFBO();
  }

  addCanvas() {
    this.canvas = this.renderer.domElement;
    this.canvas.classList.add('webgl');
    document.body.appendChild(this.canvas);
  }

  addEvents() {
    Events.on('tick', this.render.bind(this));
    Events.on('resize', this.resize.bind(this));
  }

  setGui() {
    this.tweaks = {
      pointSize: 1.2,
      speed: 0.3,
      curlFreq: 0.25,
      opacity: 0.35,
    };

    GUI.add(this.tweaks, 'pointSize', 1, 3, 0.1)
       .name('particle size')
       .onChange(() => this.renderMaterial.uniforms.uPointSize.value = this.tweaks.pointSize);

    GUI.add(this.tweaks, 'speed', 0.0, 1, 0.001)
       .onChange(() => this.simMaterial.uniforms.uSpeed.value = this.tweaks.speed);

    GUI.add(this.tweaks, 'curlFreq', 0, 0.6, 0.01)
       .name('noise frequency')
       .onChange(() => this.simMaterial.uniforms.uCurlFreq.value = this.tweaks.curlFreq);

    GUI.add(this.tweaks, 'opacity', 0.1, 1.0, 0.01)
       .onChange(() => this.renderMaterial.uniforms.uOpacity.value = this.tweaks.opacity);
  }

  feedbackSetup() {
    // Buffer setup
    this.bufferCamera = new THREE.Camera();
    this.bufferScene = new THREE.Scene();

    // Render targets
    const width = store.bounds.ww * this.dpr;
    const height = store.bounds.wh * this.dpr;

    this.textureA = new THREE.WebGLRenderTarget(width, height);
    this.textureB = new THREE.WebGLRenderTarget(width, height);

    // Pass textureA to a shader
    const bufferMaterial = new THREE.ShaderMaterial({
      vertexShader: bufferVertex,
      fragmentShader: bufferFragment,
      uniforms: {
        tBuffer: { value: this.textureA.texture },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(store.bounds.ww, store.bounds.wh) },
      },
      transparent: true,
    });
    // And use it with a plane to render it later
    const bufferGeometry = new THREE.PlaneGeometry(2, 2);

    this.bufferMesh = new THREE.Mesh(bufferGeometry, bufferMaterial);
    this.bufferScene.add(this.bufferMesh);

    // Draw textureB to screen
    let quadMaterial = new THREE.ShaderMaterial({
      vertexShader: quadVertex,
      fragmentShader: quadFragment,
      uniforms: {
        tBuffer: { value: this.textureB.texture },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(store.bounds.ww, store.bounds.wh) },
      },      
    });

    quadMaterial = new THREE.MeshBasicMaterial({
      map: this.textureB.texture
    });

    this.fullscreenQuad = new THREE.Mesh(bufferGeometry, quadMaterial);
    this.scene.add(this.fullscreenQuad);
  }  

  createFeedbackObjects() {
    // Test box
    const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshNormalMaterial();
    this.box = new THREE.Mesh(boxGeometry, boxMaterial);
    this.scene.add(this.box);    
  }

  createFBO() {
    // width and height of FBO
    const width = 512;
    const height = 512;

    // Populate a Float32Array of random positions
    let length = width * height * 3;
    let data = new Float32Array(length);
    for (let i = 0; i < length; i += 3) {
      // Random positions inside a sphere
      const point = getRandomSpherePoint();
      data[i + 0] = point.x;
      data[i + 1] = point.y;
      data[i + 2] = point.z;      

      // // Replaced with this if you want 
      // // random positions inside a cube
      // data[i + 0] = Math.random() - 0.5;
      // data[i + 1] = Math.random() - 0.5;
      // data[i + 2] = Math.random() - 0.5;      
    }

    // Convert the data to a FloatTexture
    const positions = new THREE.DataTexture(data, width, height, THREE.RGBFormat, THREE.FloatType);
    positions.needsUpdate = true;

    // Simulation shader material used to update the particles' positions
    this.simMaterial = new THREE.ShaderMaterial({
      vertexShader: simVertex,
      fragmentShader: simFragment,
      uniforms: {
        positions: { value: positions },
        uTime: { value: 0 },
        uSpeed: { value: this.tweaks.speed },
        uCurlFreq: { value: this.tweaks.curlFreq },
      },
    });

    // Render shader material to display the particles on screen
    // the positions uniform will be set after the this.fbo.update() call
    this.renderMaterial = new THREE.ShaderMaterial({
      vertexShader: particlesVertex,
      fragmentShader: particlesFragment,
      uniforms: {
        positions: { value: null },
        uTime: { value: 0 },
        uPointSize: { value: this.tweaks.pointSize },
        uOpacity: { value: this.tweaks.opacity },
      },
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    // Initialize the FBO
    this.fbo = new FBO(width, height, this.renderer, this.simMaterial, this.renderMaterial);

    // Add the particles to the scene
    // this.scene.add(this.fbo.particles);
  }  

  resize() {
    let width = store.bounds.ww;
    let height = store.bounds.wh;

    this.camera.aspect = width / height;
    this.renderer.setSize(width, height);

    this.camera.updateProjectionMatrix();
  }

  render() {
    this.controls.update();

    this.time = this.clock.getElapsedTime();

    // this.fbo.update(this.time);

    this.box.rotation.x = this.time * 0.5;
    this.box.rotation.y = this.time * 0.5;    

    // Draw to textureB
    // this.renderer.setClearColor(0xff0000, 1);
    this.renderer.setRenderTarget(this.textureB);
    this.renderer.render(this.bufferScene, this.bufferCamera);

    // Swap textures A and B
    let t = this.textureA;
    this.textureA = this.textureB;
    this.textureB = t;
    this.fullscreenQuad.material.map = this.textureB.texture;
    this.bufferMesh.material.uniforms.tBuffer.value = this.textureA.texture;

    // // Render to screen
    // this.renderer.setClearColor(0xffff00, 1);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }
}