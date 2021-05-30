import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Events } from '../events';

import store from '../store';

import FBO from './FBO';

import simVertex from './shaders/simulation.vert';
import simFragment from './shaders/simulation.frag';
import particlesVertex from './shaders/particles.vert';
import particlesFragment from './shaders/particles.frag';

import starsSimVertex from './shaders/stars/simulation.vert';
import starsSimFragment from './shaders/stars/simulation.frag';
import starsParticlesVertex from './shaders/stars/particles.vert';
import starsParticlesFragment from './shaders//stars/particles.frag';

import { getRandomSpherePoint } from '../utils';

import GUI from '../gui';

export default new class {
  constructor() {
    this.renderer = new THREE.WebGL1Renderer({ 
      antialias: true, 
      alpha: true, 
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(store.bounds.ww, store.bounds.wh);
    this.renderer.setClearColor(0xffffff, 0);

    this.camera = new THREE.PerspectiveCamera(
      45,
      store.bounds.ww / store.bounds.wh,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 10);

    this.scene = new THREE.Scene();

    this.canvas = null;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.clock = new THREE.Clock();
    this.time = null;

    this.init();
  }

  init() {
    this.addCanvas();
    this.addEvents();
    this.setGui();
    this.createFBO();
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
      speed: 0.1,
      curlFreq: 0.4,
      opacity: 0.7,
      strength: 1,
    };

    GUI.add(this.tweaks, 'pointSize', 1, 3, 0.1)
       .name('particle size')
       .onChange(() => this.renderMaterial.uniforms.uPointSize.value = this.tweaks.pointSize);

    GUI.add(this.tweaks, 'speed', 0.0, 1, 0.001)
       .onChange(() => this.simMaterial.uniforms.uSpeed.value = this.tweaks.speed);

    GUI.add(this.tweaks, 'curlFreq', 0, 2.0, 0.01)
       .name('noise frequency')
       .onChange(() => this.simMaterial.uniforms.uCurlFreq.value = this.tweaks.curlFreq);

    GUI.add(this.tweaks, 'opacity', 0.1, 1.0, 0.01)
       .onChange(() => this.renderMaterial.uniforms.uOpacity.value = this.tweaks.opacity);

    GUI.add(this.tweaks, 'strength', 0.1, 10.0, 0.01)
       .onChange(() => this.simMaterial.uniforms.uStrength.value = this.tweaks.strength);
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

      // Or random positions along a plane
      data[i + 0] = Math.random() - 0.5;
      data[i + 1] = Math.random() - 0.5;
      data[i + 2] = 0;      
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
        uStrength: { value: this.tweaks.strength },
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
        uResolution: { value: new THREE.Vector2(store.bounds.ww, store.bounds.wh) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    // Initialize the FBO
    this.fbo = new FBO(width, height, this.renderer, this.simMaterial, this.renderMaterial);

    // Add the particles to the scene
    this.fbo.particles.rotation.y = Math.PI * -1.;
    this.scene.add(this.fbo.particles);

    // Stars fbo
    // width and height of FBO
    const w = 256 * 1.5;
    const h = 256 * 1.5;

    // Populate a Float32Array of random positions
    let starsData = new Float32Array(w * h * 3);
    for (let i = 0; i < length; i += 3) {
      // Random positions inside a sphere
      const point = getRandomSpherePoint();
      starsData[i + 0] = point.x;
      starsData[i + 1] = point.y;
      starsData[i + 2] = point.z;      
    }    

    // Convert the data to a FloatTexture
    const starPositions = new THREE.DataTexture(starsData, w, h, THREE.RGBFormat, THREE.FloatType);

    // Simulation shader material used to update the particles' positions
    this.simMaterial2 = new THREE.ShaderMaterial({
      vertexShader: starsSimVertex,
      fragmentShader: starsSimFragment,
      uniforms: {
        positions: { value: starPositions },
        uTime: { value: 0 },
      },
    });

    // Render shader material to display the particles on screen
    // the positions uniform will be set after the this.fbo.update() call
    this.renderMaterial2 = new THREE.ShaderMaterial({
      vertexShader: starsParticlesVertex,
      fragmentShader: starsParticlesFragment,
      uniforms: {
        positions: { value: null },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(store.bounds.ww, store.bounds.wh) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending
    });    

    // this.stars = new FBO(w, h, this.renderer, this.simMaterial2, this.renderMaterial2);    
    // this.scene.add(this.stars.particles);    
  }

  resize() {
    let width = store.bounds.ww;
    let height = store.bounds.wh;

    this.camera.aspect = width / height;
    this.renderer.setSize(width, height);

    this.camera.updateProjectionMatrix();

    this.fbo.points.material.uniforms.uResolution.value.x = store.bounds.ww;
    this.fbo.points.material.uniforms.uResolution.value.y = store.bounds.wh;
  }

  render() {
    this.controls.update();

    this.time = this.clock.getElapsedTime();

    this.fbo.update(this.time);
    // this.stars.update(this.time);

    this.renderer.render(this.scene, this.camera);
  }
}