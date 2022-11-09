import * as THREE from '../js/three.js';

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
  return {geometry, material, mesh, normal: new THREE.Vector3(...n)}
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
        0xfa5a2d
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
        [-1, -1, -1],
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

  getTopFaceIndex() {
    const yAxis = new THREE.Vector3(0, 1, 0)
    const top = this.faces.map(({mesh, normal}, i) => {
      const copy = normal.clone()
      return {i, cos: copy.applyEuler(mesh.rotation).dot(yAxis)}
    }).sort((a, b) => a.cos - b.cos)
      .reverse()[0]
    if (top.cos >= .85) {
      return top.i
    } else {
      return -1
    }
  }
}

export default MyCube
