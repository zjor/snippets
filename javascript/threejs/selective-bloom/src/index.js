import * as THREE from 'three';
import { GUI } from 'dat.gui'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';

import {BloomingGeometry} from "./bloomingGeometry";

const log = console.log
const millis = () => (new Date()).getTime()

const NORMAL_LAYER = 0;
const BLOOM_LAYER = 1;

const createScene = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  document.body.appendChild(renderer.domElement);

  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.autoRotate = true
  orbitControls.autoRotateSpeed = 5.0
  return {scene, camera, renderer, orbitControls};
}

const addLight = (scene) => {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.x = 0;
  directionalLight.position.y = 5;
  directionalLight.position.z = 5;
  scene.add(directionalLight);
  scene.add(new THREE.AmbientLight(0x404040));
}

const {scene, camera, renderer, orbitControls} = createScene();
addLight(scene);

const objectsProps = {
  autoSwitch: true,
  redBloom: true
}

const objects = [
  new BloomingGeometry(
    new THREE.SphereGeometry(0.5),
    new THREE.MeshPhongMaterial({color: 0xff0000}),
    {x: -1, y: 0, z: 0},
    objectsProps.redBloom
  ),
  new BloomingGeometry(
    new THREE.SphereGeometry(0.5),
    new THREE.MeshPhongMaterial({color: 0x00ff00}),
    {x: 1, y: 0, z: 0},
    !objectsProps.redBloom
  )
]


objects.forEach(obj => scene.add(obj.mesh))

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

const gui = new GUI();

const controlsFolder = gui.addFolder('Controls')
controlsFolder.add(orbitControls, 'autoRotate').name('Auto-rotate')
controlsFolder.open()

const sceneFolder = gui.addFolder('Scene')
sceneFolder.add(objectsProps, 'autoSwitch').name('Auto-switch')
sceneFolder.add(objectsProps, 'redBloom').name('Toggle')
  .listen()
  .updateDisplay()
sceneFolder.open()

let lastUpdateTimestamp = millis()

const pulse = () => {
  if (objectsProps.autoSwitch) {
    objectsProps.redBloom = !objectsProps.redBloom
  }
}

const animate = () => {
  requestAnimationFrame(animate);

  objects[0].bloom = objectsProps.redBloom
  objects[1].bloom = !objectsProps.redBloom

  orbitControls.update()

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



