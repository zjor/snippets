import * as THREE from '../js/three.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const log = console.log
const millis = () => (new Date()).getTime()

function createSquareFace(v1, v2, v3, v4, n, color) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    ...v1, ...v2, ...v3,
    ...v3, ...v4, ...v1
  ])
  const normals = new Float32Array([
    ...n, ...n, ...n,
    ...n, ...n, ...n
  ])
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setIndex([
    0, 1, 2,
    3, 4, 5
  ])
  const material = new THREE.MeshPhongMaterial({color});
  const mesh = new THREE.Mesh(geometry, material);
  return {geometry, material, mesh, normal: n}
}

class MyCube {
  constructor() {
    this.faces = []

    // front
    this.faces.push(
      createSquareFace(
        [-1.0, -1.0, 1.0],
        [1.0, -1.0, 1.0],
        [1.0, 1.0, 1.0],
        [-1.0, 1.0, 1.0],
        [0.0, 0.0, 1.0],
        0xfa00fa
      )
    )

    // back
    this.faces.push(
      createSquareFace(
        [1, -1, -1],
        [-1, -1, -1],
        [-1, 1, -1],
        [1, 1, -1],
        [0.0, 0.0, -1.0],
        0xfafa00
      )
    )

    // top
    this.faces.push(
      createSquareFace(
        [-1, 1, 1],
        [1, 1, 1],
        [1, 1, -1],
        [-1, 1, -1],
        [0.0, 1.0, 0.0],
        0xfafa00
      )
    )

    // bottom
    this.faces.push(
      createSquareFace(
        [1, -1, 1],
        [-1, -1, 1],
        [-1,-1, -1],
        [1, -1, -1],
        [0.0, -1.0, 0.0],
        0xfa0000
      )
    )

    // right
    this.faces.push(
      createSquareFace(
        [1, -1, 1],
        [1, -1, -1],
        [1, 1, -1],
        [1, 1, 1],
        [1.0, 0.0, 0.0],
        0x00fa00
      )
    )

    // left
    this.faces.push(
      createSquareFace(
        [-1, -1, -1],
        [-1, -1, 1],
        [-1, 1, 1],
        [-1, 1, -1],
        [-1.0, 0.0, 0.0],
        0x00fafa
      )
    )

  }
  addToScene(scene) {
    this.faces.forEach(({mesh}) => scene.add(mesh))
  }

  setRollPitch(roll, pitch) {
    this.faces.forEach(({mesh}) => {
      mesh.rotation.x = pitch
      mesh.rotation.z = roll
    })
  }
}


const sceneElement = document.querySelector('#scene')

const {clientWidth: width, clientHeight: height} = sceneElement

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
renderer.toneMapping = THREE.ReinhardToneMapping;
sceneElement.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

(new OrbitControls(camera, renderer.domElement))

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.x = 0;
directionalLight.position.y = 5;
directionalLight.position.z = 5;
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0x404040));

const cube = new MyCube()
cube.addToScene(scene)


camera.position.z = 5;

window.state = {
  roll: 0,
  pitch: 0
}

let lastUpdateTimestamp = millis()

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  const {roll, pitch} = window.state
  cube.setRollPitch(roll, pitch)

  const now = millis()
  if (now - lastUpdateTimestamp >= 1500) {
    lastUpdateTimestamp = now
  }
}

export {animate}
