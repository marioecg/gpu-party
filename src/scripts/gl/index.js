import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Events } from '../events';

import store from '../store';

import outputVertex from './shaders/output.vert';
import outputFragment from './shaders/output.frag';
import feedbackFrag from './shaders/feedback.frag';
import startFragment from './shaders/start.frag';

const loopRes = new THREE.Vector2(64.0, 64.0);
const outputRes = new THREE.Vector2(512.0, 512.0);

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
    // Setup scenes          
    this.sceneOutput = new THREE.Scene();
    this.sceneFeedback = new THREE.Scene();
    this.sceneStart = new THREE.Scene();
    
    // Create buffers
    const width = store.bounds.ww * this.dpr;
    const height = store.bounds.wh * this.dpr;
    const renderTargetParams = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      needsUpdate: true,
    };    
    this.feedbackTexture = new THREE.WebGLRenderTarget(loopRes.x, loopRes.y, renderTargetParams);              
    this.feedbackTexture2 = new THREE.WebGLRenderTarget(loopRes.x, loopRes.y, renderTargetParams);     
    
    // Setup algorithm camera
    this.cameraLoop = new THREE.OrthographicCamera(loopRes.x / - 2, loopRes.x / 2, loopRes.y / 2, loopRes.y / - 2, -10000, 10000);
    
    // Setup sceneOutput camera
    this.cameraOutput = new THREE.PerspectiveCamera(60, store.bounds.ww / store.bounds.wh, 1, 10000);
    this.cameraOutput.position.z = 300;    

    // Feedback shader
    const feedbackMat = new THREE.ShaderMaterial({
      vertexShader: outputVertex,
      fragmentShader: feedbackFrag,
      uniforms: {
        texture: { value: this.feedbackTexture2.texture },
      },
    });             
    const feedbackGeo = new THREE.PlaneGeometry(loopRes.x, loopRes.y);
    this.feedbackQuad = new THREE.Mesh(feedbackGeo, feedbackMat);
    this.feedbackQuad.position.z = -100;
    this.sceneFeedback.add(this.feedbackQuad);  
    
    // Output shader
    const screenMat = new THREE.ShaderMaterial({
      vertexShader: outputVertex,
      fragmentShader: outputFragment,
      uniforms: {
        fb2output: { value: this.feedbackTexture2.texture }
      },
    });
    const screenGeo = new THREE.PlaneGeometry(outputRes.x, outputRes.y);              
    this.sceneQuad = new THREE.Mesh(screenGeo , screenMat);
    this.sceneQuad.position.z = -200;
    this.sceneOutput.add(this.sceneQuad);    

    // Init shader  
    const startMat = new THREE.ShaderMaterial({
      vertexShader: outputVertex,
      fragmentShader: startFragment,      
      uniforms: {
        
      },
    });
    const startGeo = new THREE.PlaneBufferGeometry(loopRes.x, loopRes.y);              
    this.startQuad = new THREE.Mesh(startGeo , startMat);
    this.startQuad.position.z = -100;
    this.sceneStart.add(this.startQuad);        
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

    this.renderer.setRenderTarget(this.feedbackTexture);
    this.renderer.render(this.sceneFeedback, this.cameraLoop);

    let a = this.feedbackTexture2;
    this.feedbackTexture2 = this.feedbackTexture;
    this.feedbackTexture = a;
    this.feedbackQuad.material.uniforms.texture.value = this.feedbackTexture2.texture

    this.renderer.render(this.sceneOutput, this.cameraOutput);    
  }
}