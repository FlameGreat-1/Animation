import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Group, Vector3, Euler } from 'three'
import { PBRMaterial } from '../materials/PBRMaterials'
import { createLevelGeometry } from '@/utils/geometryHelpers'
import { 
  calculateFloatingPosition, 
  calculateRotation, 
  calculatePhysicsMotion 
} from '@/utils/animations'
import { SCENE_CONFIG, PHYSICS_CONFIG, TIMING } from '@/utils/constants'
import { useAnimation } from '@/hooks/useAnimation'
import { usePhysics } from '@/hooks/usePhysics'

interface LevelModelProps {
  position?: Vector3
  scale?: Vector3
  staggerIndex?: number
  isVisible?: boolean
  performanceLevel?: 'low' | 'medium' | 'high'
}

export function LevelModel({ 
  position = SCENE_CONFIG.TOOL_POSITIONS.LEVEL,
  scale = SCENE_CONFIG.TOOL_SCALES.LEVEL,
  staggerIndex = 2,
  isVisible = true,
  performanceLevel = 'high'
}: LevelModelProps) {
  const groupRef = useRef<Group>(null)
  const levelBodyRef = useRef<Mesh>(null)
  const centerVialRef = useRef<Mesh>(null)
  const leftVialRef = useRef<Mesh>(null)
  const rightVialRef = useRef<Mesh>(null)
  const centerBubbleRef = useRef<Mesh>(null)
  const leftBubbleRef = useRef<Mesh>(null)
  const rightBubbleRef = useRef<Mesh>(null)
  const markingsRef = useRef<Mesh>(null)

  const basePosition = useMemo(() => position.clone(), [position])
  const baseRotation = useMemo(() => new Euler(0, 0, 0), [])
  
  const { animationTime, isPlaying } = useAnimation()
  const { velocity, updatePhysics } = usePhysics({
    mass: PHYSICS_CONFIG.TOOL_MASS * 0.8,
    damping: PHYSICS_CONFIG.DAMPING,
    angularDamping: PHYSICS_CONFIG.ANGULAR_DAMPING
  })

  const levelGeometry = useMemo(() => {
    const geometry = createLevelGeometry()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    return geometry
  }, [])

  const levelParts = useMemo(() => {
    const parts = []
    
    const bodyGeometry = levelGeometry.clone()
    parts.push({ geometry: bodyGeometry, material: 'metal', name: 'body' })
    
    const centerVialGeometry = levelGeometry.clone()
    centerVialGeometry.translate(0, 0.1, 0)
    parts.push({ geometry: centerVialGeometry, material: 'plastic', name: 'centerVial' })
    
    const leftVialGeometry = levelGeometry.clone()
    leftVialGeometry.translate(-0.6, 0.1, 0)
    parts.push({ geometry: leftVialGeometry, material: 'plastic', name: 'leftVial' })
    
    const rightVialGeometry = levelGeometry.clone()
    rightVialGeometry.translate(0.6, 0.1, 0)
    parts.push({ geometry: rightVialGeometry, material: 'plastic', name: 'rightVial' })
    
    const centerBubbleGeometry = levelGeometry.clone()
    centerBubbleGeometry.translate(0.02, 0.1, 0)
    parts.push({ geometry: centerBubbleGeometry, material: 'plastic', name: 'centerBubble' })
    
    const leftBubbleGeometry = levelGeometry.clone()
    leftBubbleGeometry.translate(-0.58, 0.1, 0)
    parts.push({ geometry: leftBubbleGeometry, material: 'plastic', name: 'leftBubble' })
    
    const rightBubbleGeometry = levelGeometry.clone()
    rightBubbleGeometry.translate(0.58, 0.1, 0)
    parts.push({ geometry: rightBubbleGeometry, material: 'plastic', name: 'rightBubble' })
    
    const markingsGeometry = levelGeometry.clone()
    markingsGeometry.translate(0, 0.076, 0)
    parts.push({ geometry: markingsGeometry, material: 'metal', name: 'markings' })
    
    return parts
  }, [levelGeometry])

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
    
    if (centerBubbleRef.current) {
      const bubbleFloat = Math.sin(currentTime * 0.005) * 0.01
      centerBubbleRef.current.position.x = 0.02 + bubbleFloat
    }
    
    if (leftBubbleRef.current) {
      const leftBubbleFloat = Math.cos(currentTime * 0.004) * 0.008
      leftBubbleRef.current.position.x = -0.58 + leftBubbleFloat
    }
    
    if (rightBubbleRef.current) {
      const rightBubbleFloat = Math.sin(currentTime * 0.006) * 0.009
      rightBubbleRef.current.position.x = 0.58 + rightBubbleFloat
    }
    
    if (levelBodyRef.current) {
      const bodyShimmer = Math.sin(currentTime * 0.003) * 0.005
      levelBodyRef.current.rotation.z = bodyShimmer
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
        category: 'general',
        name: 'Professional Spirit Level',
        description: '48-inch aluminum level with 3 vials for precise measurements'
      }}
    >
      <mesh 
        ref={levelBodyRef}
        geometry={levelParts[0].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="metal" 
          variant="chrome"
          roughness={0.2}
          metalness={0.9}
          normalScale={0.8}
        />
      </mesh>

      <mesh 
        ref={centerVialRef}
        geometry={levelParts[1].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="plastic" 
          variant="yellow"
          roughness={0.1}
          metalness={0.0}
          normalScale={0.2}
        />
      </mesh>

      <mesh 
        ref={leftVialRef}
        geometry={levelParts[2].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="plastic" 
          variant="yellow"
          roughness={0.1}
          metalness={0.0}
          normalScale={0.2}
        />
      </mesh>

      <mesh 
        ref={rightVialRef}
        geometry={levelParts[3].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="plastic" 
          variant="yellow"
          roughness={0.1}
          metalness={0.0}
          normalScale={0.2}
        />
      </mesh>

      <mesh 
        ref={centerBubbleRef}
        geometry={levelParts[4].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="plastic" 
          variant="black"
          roughness={0.05}
          metalness={0.0}
          normalScale={0.1}
        />
      </mesh>

      <mesh 
        ref={leftBubbleRef}
        geometry={levelParts[5].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="plastic" 
          variant="black"
          roughness={0.05}
          metalness={0.0}
          normalScale={0.1}
        />
      </mesh>

      <mesh 
        ref={rightBubbleRef}
        geometry={levelParts[6].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="plastic" 
          variant="black"
          roughness={0.05}
          metalness={0.0}
          normalScale={0.1}
        />
      </mesh>

      <mesh 
        ref={markingsRef}
        geometry={levelParts[7].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="metal" 
          variant="steel"
          roughness={0.3}
          metalness={0.8}
          normalScale={0.5}
        />
      </mesh>

      {performanceLevel === 'high' && (
        <>
          <pointLight
            position={[0, 0.2, 0.3]}
            intensity={0.4}
            distance={2.5}
            decay={2}
            color="#F97316"
          />
          
          <spotLight
            position={[0, 0.8, 0.8]}
            target={groupRef.current}
            angle={Math.PI / 4}
            penumbra={0.4}
            intensity={0.5}
            distance={3.5}
            decay={2}
            color="#1E3A8A"
            castShadow
          />
        </>
      )}
    </group>
  )
}

export function LevelModelLOD({ 
  position, 
  scale, 
  staggerIndex, 
  distance 
}: LevelModelProps & { distance: number }) {
  const performanceLevel = useMemo(() => {
    if (distance > 10) return 'low'
    if (distance > 5) return 'medium'
    return 'high'
  }, [distance])

  return (
    <LevelModel
      position={position}
      scale={scale}
      staggerIndex={staggerIndex}
      performanceLevel={performanceLevel}
      isVisible={distance < 20}
    />
  )
}

export function ProfessionalLevel({ 
  category = 'general',
  ...props 
}: LevelModelProps & { 
  category?: 'general' | 'carpentry' | 'masonry' | 'handyman' 
}) {
  const categoryConfigs = {
    general: {
      scale: new Vector3(1.0, 1.0, 1.0),
      description: 'Professional Spirit Level - 48" Aluminum with 3 Vials'
    },
    carpentry: {
      scale: new Vector3(1.3, 1.3, 1.3),
      description: 'Heavy-Duty Framing Level - 72" with Magnetic Base'
    },
    masonry: {
      scale: new Vector3(1.1, 1.1, 1.1),
      description: 'Mason Level - 48" with Block Vials and End Caps'
    },
    handyman: {
      scale: new Vector3(0.7, 0.7, 0.7),
      description: 'Compact Torpedo Level - 9" Multi-Position'
    }
  }

  const config = categoryConfigs[category]

  return (
    <LevelModel
      {...props}
      scale={config.scale}
    />
  )
}

export function AnimatedLevelShowcase() {
  const positions = [
    new Vector3(-3, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(3, 0, 0)
  ]

  const categories: Array<'general' | 'carpentry' | 'masonry' | 'handyman'> = [
    'general', 'carpentry', 'masonry', 'handyman'
  ]

  return (
    <group>
      {positions.map((position, index) => (
        <ProfessionalLevel
          key={`level-${index}`}
          position={position}
          category={categories[index]}
          staggerIndex={index}
          performanceLevel="high"
        />
      ))}
    </group>
  )
}

export default LevelModel
