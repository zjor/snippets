import * as THREE from '../js/three.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

import MyCube from './myCube'
import {createBloomingPipeline} from "./utils"

const NORMAL_LAYER = 0;

const log = console.log
const millis = () => (new Date()).getTime()

const sceneElement = document.querySelector('#scene')

const {clientWidth: width, clientHeight: height} = sceneElement

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(width, height);
renderer.toneMapping = THREE.ReinhardToneMapping;
sceneElement.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(1)
axesHelper.translateX(-2)
axesHelper.translateY(-2)
axesHelper.translateZ(2)
scene.add(axesHelper);
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

const {finalComposer, bloomComposer} = createBloomingPipeline({renderer, scene, camera})

window.state = {
  roll: 0,
  pitch: 0
}

let lastUpdateTimestamp = millis()

function animate() {
  requestAnimationFrame(animate);

  axesHelper.layers.disable(NORMAL_LAYER)
  const topFaceIndex = cube.getTopFaceIndex()
  cube.faces.forEach((face, index) => {
    if (index === topFaceIndex) {
      face.mesh.layers.enable(NORMAL_LAYER)
    } else {
      face.mesh.layers.disable(NORMAL_LAYER)
    }
  })

  bloomComposer.render()
  axesHelper.layers.enable(NORMAL_LAYER)
  cube.faces.forEach((face) => face.mesh.layers.enable(NORMAL_LAYER))

  finalComposer.render()

  const {roll, pitch} = window.state
  cube.setRollPitch(roll, pitch)

  const now = millis()
  if (now - lastUpdateTimestamp >= 1500) {
    lastUpdateTimestamp = now
  }
}

export {animate}
