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


const geometry = buildCube()
const edgesGeometry = new THREE.EdgesGeometry(geometry)

const lineDashedMaterial = new THREE.LineDashedMaterial({dashSize: 0.125, gapSize: 0.125});
const edges = new THREE.LineSegments(edgesGeometry, lineDashedMaterial);
edges.computeLineDistances();
scene.add(edges);

const material = new THREE.MeshPhongMaterial({color: THREE.FaceColors});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

window.state = {
  roll: 0,
  pitch: 0
}

function buildCube() {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array( [
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    1.0,  1.0,  1.0,

    1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0, -1.0,  1.0
  ] );
  const normals = new Float32Array([
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0
  ]);
  const colors = new Float32Array([
    0.2, 1.0, 0.3,
    0.2, 1.0, 0.3,
    0.2, 1.0, 0.3,
    0.2, 1.0, 0.3,
    0.2, 1.0, 0.3,
    0.2, 1.0, 0.3
  ])
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  geometry.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
  geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

  return geometry;
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
