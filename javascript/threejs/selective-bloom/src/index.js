import * as THREE from 'three';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';

const log = console.log

const createScene = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  return {scene, camera, renderer};
}

const {scene, camera, renderer} = createScene();

const geometry = new THREE.BoxGeometry(1, 1, 1);
const wireframeGeometry = new THREE.EdgesGeometry(geometry);
const material = new THREE.LineBasicMaterial({color: 0x00ff00, lineWidth: 2});
const wireframe = new THREE.LineSegments(wireframeGeometry, material);
scene.add(wireframe);

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

composer.addPass(bloomPass)

const gui = new GUI();
const cubeFolder = gui.addFolder('Cube')
cubeFolder.add(wireframe.rotation, 'x', 0, Math.PI * 2)
cubeFolder.add(wireframe.rotation, 'y', 0, Math.PI * 2)
cubeFolder.add(wireframe.rotation, 'z', 0, Math.PI * 2)
cubeFolder.open()

const animate = () => {
  requestAnimationFrame(animate);
  composer.render()
}

animate();



