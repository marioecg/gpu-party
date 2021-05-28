import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Events } from '../events';

import store from '../store';

export default new class {
  constructor() {
    this.renderer = new THREE.WebGL1Renderer({ 
      antialias: true, 
      alpha: true, 
    });
    this.dpr = Math.min(window.devicePixelRatio, 1.5);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(store.bounds.ww, store.bounds.wh);
    this.renderer.setClearColor(0xffffff, 1);

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

    this.init();
  }

  init() {
    this.addCanvas();
    this.addEvents();
    this.feedbackSetup();
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

  feedbackSetup() {
    // Test box
    const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshNormalMaterial();
    this.box = new THREE.Mesh(boxGeometry, boxMaterial);
    this.scene.add(this.box);    
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

    this.box.rotation.x = this.time * 0.5;
    this.box.rotation.y = this.time * 0.5;    

    this.renderer.render(this.scene, this.camera);
  }
}