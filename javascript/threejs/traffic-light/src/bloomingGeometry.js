import * as THREE from 'three';

class BloomingGeometry {
  constructor(geometry, material, position = {x: 0, y: 0, z: 0}, bloom = false) {
    this.geometry = geometry
    this.material = material
    this.bloom = bloom
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.x = position.x
    this.mesh.position.y = position.y
    this.mesh.position.z = position.z
  }

  setBloom(bloom) {
    this.bloom = bloom
  }
}

export {BloomingGeometry}
