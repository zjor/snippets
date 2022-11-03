import * as THREE from '../js/three.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const sceneElement = document.querySelector('#scene')

const {clientWidth: width, clientHeight: height} = sceneElement

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
sceneElement.appendChild(renderer.domElement);
const controls = new OrbitControls( camera, renderer.domElement );

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.x = 0;
directionalLight.position.y = 5;
directionalLight.position.z = 5;
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0x404040));


const geometry = new THREE.BoxGeometry(1, 1, 1);
const edgesGeometry = new THREE.EdgesGeometry(geometry)

const lineDashedMaterial = new THREE.LineDashedMaterial({dashSize: 0.125, gapSize: 0.125});
const edges = new THREE.LineSegments(edgesGeometry, lineDashedMaterial);
edges.computeLineDistances();
scene.add(edges);

const material = new THREE.MeshLambertMaterial({color: 0x00ff00});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

window.state = {
  roll: 0,
  pitch: 0
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  // pitch
  edges.rotation.x = window.state.pitch;
  cube.rotation.x = window.state.pitch;
  // roll
  edges.rotation.z = window.state.roll;
  cube.rotation.z = window.state.roll;
}

export {animate}
