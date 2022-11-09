import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';

import {TrafficLight} from './trafficLight'

const log = console.log
const millis = () => (new Date()).getTime()

const NORMAL_LAYER = 0;

const createScene = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  document.body.appendChild(renderer.domElement);

  return {scene, camera, renderer};
}

const addLight = (scene) => {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.x = 0;
  directionalLight.position.y = 5;
  directionalLight.position.z = 5;
  scene.add(directionalLight);
  scene.add(new THREE.AmbientLight(0x404040));
}

const {scene, camera, renderer} = createScene();
addLight(scene);

const trafficLight = new TrafficLight()
trafficLight.addToScene(scene)

camera.position.z = 5;

const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomConfig = {
  strength: 5,
  threshold: 0,
  radius: 0,
}
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight),
  bloomConfig.strength,
  bloomConfig.radius,
  bloomConfig.threshold)

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderPass);
bloomComposer.addPass(bloomPass);

const finalPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: {value: null},
      bloomTexture: {value: bloomComposer.renderTarget2.texture}
    },
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent,
    defines: {}
  }), 'baseTexture'
);
finalPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderPass);
finalComposer.addPass(finalPass);

composer.addPass(bloomPass)

let lastUpdateTimestamp = millis()

const pulse = () => {
  trafficLight.switchState()
}

const animate = () => {
  requestAnimationFrame(animate);

  const objects = trafficLight.lights

  objects.forEach(obj => {
    if (!obj.bloom) {
      obj.mesh.layers.disable(NORMAL_LAYER)
    }
  })
  bloomComposer.render()

  objects.forEach(obj => obj.mesh.layers.enable(NORMAL_LAYER))
  finalComposer.render()

  const now = millis()
  if (now - lastUpdateTimestamp >= 1500) {
    pulse()
    lastUpdateTimestamp = now
  }

}

animate();



