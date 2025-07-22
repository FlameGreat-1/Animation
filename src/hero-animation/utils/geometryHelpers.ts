import {
    BufferGeometry,
    BufferAttribute,
    Vector3,
    CylinderGeometry,
    BoxGeometry,
    SphereGeometry,
    ExtrudeGeometry,
    Shape,
    RingGeometry,
    TubeGeometry,
    CatmullRomCurve3
  } from 'three'
  
  export function createOptimizedGeometry(
    vertices: Float32Array,
    indices: Uint16Array,
    normals: Float32Array,
    uvs: Float32Array
  ): BufferGeometry {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(vertices, 3))
    geometry.setAttribute('normal', new BufferAttribute(normals, 3))
    geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
    geometry.setIndex(new BufferAttribute(indices, 1))
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    return geometry
  }
  
  export function mergeGeometries(geometries: BufferGeometry[]): BufferGeometry {
    const mergedGeometry = new BufferGeometry()
    let totalVertices = 0
    let totalIndices = 0
    
    geometries.forEach(geo => {
      totalVertices += geo.attributes.position.count
      totalIndices += geo.index ? geo.index.count : 0
    })
    
    const positions = new Float32Array(totalVertices * 3)
    const normals = new Float32Array(totalVertices * 3)
    const uvs = new Float32Array(totalVertices * 2)
    const indices = new Uint16Array(totalIndices)
    
    let vertexOffset = 0
    let indexOffset = 0
    let currentIndex = 0
    
    geometries.forEach(geo => {
      const posAttr = geo.attributes.position
      const normAttr = geo.attributes.normal
      const uvAttr = geo.attributes.uv
      const indexAttr = geo.index
      
      positions.set(posAttr.array as Float32Array, vertexOffset * 3)
      if (normAttr) normals.set(normAttr.array as Float32Array, vertexOffset * 3)
      if (uvAttr) uvs.set(uvAttr.array as Float32Array, vertexOffset * 2)
      
      if (indexAttr) {
        const indexArray = indexAttr.array as Uint16Array
        for (let i = 0; i < indexArray.length; i++) {
          indices[indexOffset + i] = indexArray[i] + currentIndex
        }
        indexOffset += indexArray.length
      }
      
      currentIndex += posAttr.count
      vertexOffset += posAttr.count
    })
    
    return createOptimizedGeometry(positions, indices, normals, uvs)
  }
  
  export function createHammerGeometry(): BufferGeometry {
    const parts: BufferGeometry[] = []
    
    const head = new BoxGeometry(0.8, 0.4, 0.3)
    head.translate(0, 0.2, 0)
    parts.push(head)
    
    const clawShape = new Shape()
    clawShape.moveTo(0, 0)
    clawShape.lineTo(0.3, 0)
    clawShape.quadraticCurveTo(0.4, -0.1, 0.35, -0.2)
    clawShape.lineTo(0.2, -0.3)
    clawShape.quadraticCurveTo(0.1, -0.35, 0, -0.3)
    clawShape.lineTo(0, 0)
    
    const claw = new ExtrudeGeometry(clawShape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02
    })
    claw.translate(0, 0.2, -0.4)
    parts.push(claw)
    
    const handle = new CylinderGeometry(0.05, 0.06, 1.2, 12)
    handle.translate(0, -0.4, 0)
    parts.push(handle)
    
    const grip = new CylinderGeometry(0.07, 0.07, 0.3, 16)
    grip.translate(0, -0.7, 0)
    parts.push(grip)
    
    const cap = new SphereGeometry(0.06, 8, 8)
    cap.translate(0, -1.0, 0)
    parts.push(cap)
    
    return mergeGeometries(parts)
  }
  
  export function createDrillGeometry(): BufferGeometry {
    const parts: BufferGeometry[] = []
    
    const body = new CylinderGeometry(0.15, 0.18, 0.8, 16)
    body.rotateZ(Math.PI / 2)
    parts.push(body)
    
    const chuck = new CylinderGeometry(0.08, 0.12, 0.15, 12)
    chuck.translate(0.5, 0, 0)
    parts.push(chuck)
    
    const chuckTeeth = new RingGeometry(0.08, 0.12, 12, 1)
    chuckTeeth.rotateX(Math.PI / 2)
    chuckTeeth.translate(0.5, 0, 0.075)
    parts.push(chuckTeeth)
    
    const bit = new CylinderGeometry(0.01, 0.02, 0.4, 8)
    bit.translate(0.8, 0, 0)
    parts.push(bit)
    
    const curve = new CatmullRomCurve3([
      new Vector3(0.6, 0, 0.02),
      new Vector3(0.7, 0.01, 0.01),
      new Vector3(0.8, -0.01, 0.01),
      new Vector3(0.9, 0.01, 0.01),
      new Vector3(1.0, 0, 0.02)
    ])
    const flute = new TubeGeometry(curve, 20, 0.005, 6, false)
    parts.push(flute)
    
    const handle = new CylinderGeometry(0.08, 0.1, 0.4, 12)
    handle.rotateX(Math.PI / 2)
    handle.translate(-0.2, -0.3, 0)
    parts.push(handle)
    
    const triggerShape = new Shape()
    triggerShape.moveTo(0, 0)
    triggerShape.quadraticCurveTo(0.05, -0.05, 0.08, -0.1)
    triggerShape.quadraticCurveTo(0.06, -0.15, 0.02, -0.12)
    triggerShape.lineTo(0, -0.08)
    triggerShape.lineTo(0, 0)
    
    const trigger = new ExtrudeGeometry(triggerShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.005,
      bevelThickness: 0.005
    })
    trigger.translate(-0.1, -0.2, 0)
    parts.push(trigger)
    
    const battery = new BoxGeometry(0.3, 0.15, 0.4)
    battery.translate(-0.3, -0.4, 0)
    parts.push(battery)
    
    for (let i = 0; i < 6; i++) {
      const slot = new BoxGeometry(0.02, 0.08, 0.01)
      slot.translate(i * 0.05 - 0.125, 0.1, 0.18)
      parts.push(slot)
    }
    
    return mergeGeometries(parts)
  }
  
  export function createLevelGeometry(): BufferGeometry {
    const parts: BufferGeometry[] = []
    
    const body = new BoxGeometry(2.0, 0.15, 0.08)
    parts.push(body)
    
    const centerVial = new CylinderGeometry(0.02, 0.02, 0.2, 12)
    centerVial.rotateZ(Math.PI / 2)
    centerVial.translate(0, 0.1, 0)
    parts.push(centerVial)
    
    const centerBubble = new SphereGeometry(0.015, 8, 8)
    centerBubble.translate(0.02, 0.1, 0)
    parts.push(centerBubble)
    
    const leftVial = new CylinderGeometry(0.02, 0.02, 0.2, 12)
    leftVial.translate(-0.6, 0.1, 0)
    parts.push(leftVial)
    
    const leftBubble = new SphereGeometry(0.015, 8, 8)
    leftBubble.translate(-0.58, 0.1, 0)
    parts.push(leftBubble)
    
    const rightVial = new CylinderGeometry(0.02, 0.02, 0.2, 12)
    rightVial.translate(0.6, 0.1, 0)
    parts.push(rightVial)
    
    const rightBubble = new SphereGeometry(0.015, 8, 8)
    rightBubble.translate(0.58, 0.1, 0)
    parts.push(rightBubble)
    
    const leftCap = new BoxGeometry(0.05, 0.15, 0.1)
    leftCap.translate(-1.025, 0, 0)
    parts.push(leftCap)
    
    const rightCap = new BoxGeometry(0.05, 0.15, 0.1)
    rightCap.translate(1.025, 0, 0)
    parts.push(rightCap)
    
    for (let i = -10; i <= 10; i++) {
      const markHeight = i % 4 === 0 ? 0.02 : 0.01
      const mark = new BoxGeometry(0.002, markHeight, 0.001)
      mark.translate(i * 0.1, 0.076, 0)
      parts.push(mark)
    }
    
    for (let x = -0.15; x <= 0.15; x += 0.03) {
      for (let y = -0.02; y <= 0.02; y += 0.02) {
        const diamond = new BoxGeometry(0.01, 0.01, 0.002)
        diamond.rotateZ(Math.PI / 4)
        diamond.translate(x - 0.4, y - 0.075, 0)
        parts.push(diamond)
        
        const diamond2 = new BoxGeometry(0.01, 0.01, 0.002)
        diamond2.rotateZ(Math.PI / 4)
        diamond2.translate(x + 0.4, y - 0.075, 0)
        parts.push(diamond2)
      }
    }
    
    return mergeGeometries(parts)
  }
  
  export function createMeasuringTapeGeometry(): BufferGeometry {
    const parts: BufferGeometry[] = []
    
    const caseBody = new BoxGeometry(0.6, 0.3, 0.15)
    parts.push(caseBody)
    
    const corners = [
      [-0.25, -0.125, 0], [0.25, -0.125, 0],
      [-0.25, 0.125, 0], [0.25, 0.125, 0]
    ]
    
    corners.forEach(pos => {
      const corner = new SphereGeometry(0.05, 8, 8)
      corner.translate(pos[0], pos[1], pos[2])
      parts.push(corner)
    })
    
    const blade = new BoxGeometry(1.5, 0.025, 0.002)
    blade.translate(0.8, 0, 0)
    parts.push(blade)
    
    const hook = new BoxGeometry(0.03, 0.03, 0.01)
    hook.translate(1.55, 0, 0)
    parts.push(hook)
    
    for (let i = 0; i < 24; i++) {
      const markHeight = i % 4 === 0 ? 0.015 : 0.008
      const mark = new BoxGeometry(0.001, markHeight, 0.003)
      mark.translate(0.8 + (i * 0.0625), 0, 0)
      parts.push(mark)
    }
    
    const clipShape = new Shape()
    clipShape.moveTo(0, 0)
    clipShape.lineTo(0.1, 0)
    clipShape.quadraticCurveTo(0.12, -0.05, 0.1, -0.1)
    clipShape.lineTo(0.02, -0.08)
    clipShape.quadraticCurveTo(0, -0.04, 0, 0)
    
    const clip = new ExtrudeGeometry(clipShape, {
      depth: 0.02,
      bevelEnabled: false
    })
    clip.translate(-0.4, 0, 0)
    parts.push(clip)
    
    const lockButton = new CylinderGeometry(0.03, 0.03, 0.02, 8)
    lockButton.rotateZ(Math.PI / 2)
    lockButton.translate(0.2, 0.15, 0)
    parts.push(lockButton)
    
    const thumbStop = new BoxGeometry(0.08, 0.04, 0.02)
    thumbStop.translate(0.2, -0.15, 0)
    parts.push(thumbStop)
    
    return mergeGeometries(parts)
  }
  
  export function calculateNormals(geometry: BufferGeometry): void {
    geometry.computeVertexNormals()
  }
  
  export function calculateUVs(geometry: BufferGeometry): void {
    const positions = geometry.attributes.position
    const uvs = new Float32Array(positions.count * 2)
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)
      
      uvs[i * 2] = (x + 1) * 0.5
      uvs[i * 2 + 1] = (y + 1) * 0.5
    }
    
    geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
  }
  
  export function optimizeGeometry(geometry: BufferGeometry): BufferGeometry {
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    geometry.normalizeNormals()
    return geometry
  }
  