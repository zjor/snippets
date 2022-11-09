import * as THREE from 'three';

import {BloomingGeometry} from "./bloomingGeometry";

const log = console.log

class TrafficLight {
  constructor() {
    this.lights = [
      new BloomingGeometry(
        new THREE.SphereGeometry(0.5),
        new THREE.MeshPhongMaterial({color: 0xff0000}),
        {x: 0, y: 1.25, z: 0},
        true
      ),
      new BloomingGeometry(
        new THREE.SphereGeometry(0.5),
        new THREE.MeshPhongMaterial({color: 0xffff00}),
        {x: 0, y: 0, z: 0},
        false
      ),
      new BloomingGeometry(
        new THREE.SphereGeometry(0.5),
        new THREE.MeshPhongMaterial({color: 0x00ff00}),
        {x: 0, y: -1.25, z: 0},
        false
      ),
    ]
    this.states = [
      [true, false, false],
      [true, true, false],
      [false, false, true],
      [false, true, false],
    ]
    this.state = 0
  }

  addToScene(scene) {
    this.lights.forEach(obj => scene.add(obj.mesh))
  }

  switchState() {
    this.state = (this.state + 1) % this.states.length
    log(this.state)
    this.lights.forEach((light, index) => {
      light.bloom = this.states[this.state][index]
    })
  }
}


export {TrafficLight}
