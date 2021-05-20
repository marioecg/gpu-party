import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import PingPong from './PingPong';

import { Events } from '../events';

import store from '../store';

export default new class {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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

    this.init();
  }

  init() {
    this.addCanvas();
    this.addEvents();
    this.addElements();
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

  addElements() {
    this.pingpong = new PingPong(this.renderer, this.camera, this.scene, { size: 64 });
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

    this.pingpong.render();

    this.renderer.render(this.scene, this.camera);
  }
}