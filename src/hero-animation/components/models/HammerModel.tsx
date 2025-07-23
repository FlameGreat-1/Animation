import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Group, Vector3, Euler } from 'three'
import { PBRMaterial } from '../materials/PBRMaterials'
import { createHammerGeometry } from '../../utils/geometryHelpers'
import { 
  calculateFloatingPosition, 
  calculateRotation, 
  calculatePhysicsMotion 
} from '../../utils/animations'
import { SCENE_CONFIG, PHYSICS_CONFIG, TIMING } from '../../utils/constants'
import { useAnimation } from '../../hooks/useAnimation'
import { usePhysics } from '../../hooks/usePhysics'

interface HammerModelProps {
  position?: Vector3
  scale?: Vector3
  staggerIndex?: number
  isVisible?: boolean
  performanceLevel?: 'low' | 'medium' | 'high'
}

export function HammerModel({ 
  position = SCENE_CONFIG.TOOL_POSITIONS.HAMMER,
  scale = SCENE_CONFIG.TOOL_SCALES.HAMMER,
  staggerIndex = 0,
  isVisible = true,
  performanceLevel = 'high'
}: HammerModelProps) {
  const groupRef = useRef<Group>(null)
  const hammerHeadRef = useRef<Mesh>(null)
  const hammerClawRef = useRef<Mesh>(null)
  const hammerHandleRef = useRef<Mesh>(null)
  const hammerGripRef = useRef<Mesh>(null)
  const hammerCapRef = useRef<Mesh>(null)

  const basePosition = useMemo(() => position.clone(), [position])
  const baseRotation = useMemo(() => new Euler(0, 0, 0), [])
  
  const { animationTime, isPlaying } = useAnimation()
  const { velocity, updatePhysics } = usePhysics({
    mass: PHYSICS_CONFIG.TOOL_MASS,
    damping: PHYSICS_CONFIG.DAMPING,
    angularDamping: PHYSICS_CONFIG.ANGULAR_DAMPING
  })

  const hammerGeometry = useMemo(() => {
    const geometry = createHammerGeometry()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    return geometry
  }, [])

  const hammerParts = useMemo(() => {
    const parts = []
    
    const headGeometry = hammerGeometry.clone()
    headGeometry.translate(0, 0.2, 0)
    parts.push({ geometry: headGeometry, material: 'metal', name: 'head' })
    
    const clawGeometry = hammerGeometry.clone()
    clawGeometry.translate(0, 0.2, -0.4)
    parts.push({ geometry: clawGeometry, material: 'metal', name: 'claw' })
    
    const handleGeometry = hammerGeometry.clone()
    handleGeometry.translate(0, -0.4, 0)
    parts.push({ geometry: handleGeometry, material: 'wood', name: 'handle' })
    
    const gripGeometry = hammerGeometry.clone()
    gripGeometry.translate(0, -0.7, 0)
    parts.push({ geometry: gripGeometry, material: 'rubber', name: 'grip' })
    
    const capGeometry = hammerGeometry.clone()
    capGeometry.translate(0, -1.0, 0)
    parts.push({ geometry: capGeometry, material: 'wood', name: 'cap' })
    
    return parts
  }, [hammerGeometry])

  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying) return

    const currentTime = animationTime + (staggerIndex * TIMING.STAGGER_DELAY)
    
    const floatingPosition = calculateFloatingPosition(
      currentTime, 
      basePosition, 
      TIMING.FLOAT_AMPLITUDE
    )
    
    const rotation = calculateRotation(currentTime, baseRotation, 'y')
    
    const physicsPosition = calculatePhysicsMotion(
      currentTime,
      floatingPosition,
      velocity,
      PHYSICS_CONFIG.GRAVITY,
      PHYSICS_CONFIG.BUOYANCY_FORCE
    )
    
    updatePhysics(delta)
    
    groupRef.current.position.copy(physicsPosition)
    groupRef.current.rotation.copy(rotation)
    groupRef.current.scale.copy(scale)
    
    if (hammerHeadRef.current) {
      const headBob = Math.sin(currentTime * 0.003) * 0.02
      hammerHeadRef.current.position.y = 0.2 + headBob
    }
    
    if (hammerHandleRef.current) {
      const handleSway = Math.cos(currentTime * 0.002) * 0.01
      hammerHandleRef.current.rotation.z = handleSway
    }
  })

  if (!isVisible) return null

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale}
      userData={{ 
        type: 'construction-tool',
        category: 'carpentry',
        name: 'Professional Framing Hammer',
        description: 'Heavy-duty construction hammer for framing and demolition work'
      }}
    >
      <mesh 
        ref={hammerHeadRef}
        geometry={hammerParts[0].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="metal" 
          variant="steel"
          roughness={0.25}
          metalness={0.9}
          normalScale={1.2}
        />
      </mesh>

      <mesh 
        ref={hammerClawRef}
        geometry={hammerParts[1].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="metal" 
          variant="steel"
          roughness={0.3}
          metalness={0.85}
          normalScale={1.0}
        />
      </mesh>

      <mesh 
        ref={hammerHandleRef}
        geometry={hammerParts[2].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="wood" 
          variant="oak"
          roughness={0.8}
          metalness={0.0}
          normalScale={0.6}
        />
      </mesh>

      <mesh 
        ref={hammerGripRef}
        geometry={hammerParts[3].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="rubber" 
          variant="black"
          roughness={0.95}
          metalness={0.0}
          normalScale={0.8}
        />
      </mesh>

      <mesh 
        ref={hammerCapRef}
        geometry={hammerParts[4].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="wood" 
          variant="oak"
          roughness={0.7}
          metalness={0.0}
          normalScale={0.4}
        />
      </mesh>

      {performanceLevel === 'high' && (
        <>
          <pointLight
            position={[0, 0.5, 0.5]}
            intensity={0.3}
            distance={2}
            decay={2}
            color="#F97316"
          />
          
          <spotLight
            position={[0, 1, 1]}
            target={groupRef.current}
            angle={Math.PI / 6}
            penumbra={0.5}
            intensity={0.4}
            distance={3}
            decay={2}
            color="#1E3A8A"
            castShadow
          />
        </>
      )}
    </group>
  )
}

export function HammerModelLOD({ 
  position, 
  scale, 
  staggerIndex, 
  distance 
}: HammerModelProps & { distance: number }) {
  const performanceLevel = useMemo(() => {
    if (distance > 10) return 'low'
    if (distance > 5) return 'medium'
    return 'high'
  }, [distance])

  return (
    <HammerModel
      position={position}
      scale={scale}
      staggerIndex={staggerIndex}
      performanceLevel={performanceLevel}
      isVisible={distance < 20}
    />
  )
}

export function ProfessionalHammer({ 
  category = 'carpentry',
  ...props 
}: HammerModelProps & { 
  category?: 'carpentry' | 'general' | 'roofing' | 'handyman' 
}) {
  const categoryConfigs = {
    carpentry: {
      scale: new Vector3(1.2, 1.2, 1.2),
      description: 'Professional Framing Hammer - 20oz Steel Head'
    },
    general: {
      scale: new Vector3(1.0, 1.0, 1.0),
      description: 'General Purpose Claw Hammer - 16oz'
    },
    roofing: {
      scale: new Vector3(0.9, 0.9, 0.9),
      description: 'Roofing Hammer with Magnetic Nail Holder'
    },
    handyman: {
      scale: new Vector3(0.8, 0.8, 0.8),
      description: 'Compact Multi-Purpose Hammer'
    }
  }

  const config = categoryConfigs[category]

  return (
    <HammerModel
      {...props}
      scale={config.scale}
    />
  )
}

export function AnimatedHammerShowcase() {
  const positions = [
    new Vector3(-3, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(3, 0, 0)
  ]

  const categories: Array<'carpentry' | 'general' | 'roofing' | 'handyman'> = [
    'carpentry', 'general', 'roofing', 'handyman'
  ]

  return (
    <group>
      {positions.map((position, index) => (
        <ProfessionalHammer
          key={`hammer-${index}`}
          position={position}
          category={categories[index]}
          staggerIndex={index}
          performanceLevel="high"
        />
      ))}
    </group>
  )
}

export default HammerModel
