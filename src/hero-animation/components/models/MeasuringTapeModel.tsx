import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Group, Vector3, Euler } from 'three'
import { PBRMaterial } from '../materials/PBRMaterials'
import { createMeasuringTapeGeometry } from '../../utils/geometryHelpers'
import { 
  calculateFloatingPosition, 
  calculateRotation, 
  calculatePhysicsMotion 
} from '../../utils/animations'
import { SCENE_CONFIG, PHYSICS_CONFIG, TIMING } from '../../utils/constants'
import { useAnimation } from '../../hooks/useAnimation'
import { usePhysics } from '../../hooks/usePhysics'

interface MeasuringTapeModelProps {
  position?: Vector3
  scale?: Vector3
  staggerIndex?: number
  isVisible?: boolean
  performanceLevel?: 'low' | 'medium' | 'high'
}

export function MeasuringTapeModel({ 
  position = SCENE_CONFIG.TOOL_POSITIONS.MEASURING_TAPE,
  scale = SCENE_CONFIG.TOOL_SCALES.MEASURING_TAPE,
  staggerIndex = 3,
  isVisible = true,
  performanceLevel = 'high'
}: MeasuringTapeModelProps) {
  const groupRef = useRef<Group>(null)
  const tapeCaseRef = useRef<Mesh>(null)
  const tapeBladeRef = useRef<Mesh>(null)
  const tapeHookRef = useRef<Mesh>(null)
  const beltClipRef = useRef<Mesh>(null)
  const lockButtonRef = useRef<Mesh>(null)
  const thumbStopRef = useRef<Mesh>(null)
  const markingsRef = useRef<Mesh>(null)

  const basePosition = useMemo(() => position.clone(), [position])
  const baseRotation = useMemo(() => new Euler(0, 0, 0), [])
  
  const { animationTime, isPlaying } = useAnimation()
  const { velocity, updatePhysics } = usePhysics({
    mass: PHYSICS_CONFIG.TOOL_MASS * 0.6,
    damping: PHYSICS_CONFIG.DAMPING,
    angularDamping: PHYSICS_CONFIG.ANGULAR_DAMPING
  })

  const tapeGeometry = useMemo(() => {
    const geometry = createMeasuringTapeGeometry()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    return geometry
  }, [])

  const tapeParts = useMemo(() => {
    const parts = []
    
    const caseGeometry = tapeGeometry.clone()
    parts.push({ geometry: caseGeometry, material: 'plastic', name: 'case' })
    
    const bladeGeometry = tapeGeometry.clone()
    bladeGeometry.translate(0.8, 0, 0)
    parts.push({ geometry: bladeGeometry, material: 'metal', name: 'blade' })
    
    const hookGeometry = tapeGeometry.clone()
    hookGeometry.translate(1.55, 0, 0)
    parts.push({ geometry: hookGeometry, material: 'metal', name: 'hook' })
    
    const clipGeometry = tapeGeometry.clone()
    clipGeometry.translate(-0.4, 0, 0)
    parts.push({ geometry: clipGeometry, material: 'metal', name: 'clip' })
    
    const lockButtonGeometry = tapeGeometry.clone()
    lockButtonGeometry.translate(0.2, 0.15, 0)
    parts.push({ geometry: lockButtonGeometry, material: 'plastic', name: 'lockButton' })
    
    const thumbStopGeometry = tapeGeometry.clone()
    thumbStopGeometry.translate(0.2, -0.15, 0)
    parts.push({ geometry: thumbStopGeometry, material: 'rubber', name: 'thumbStop' })
    
    const markingsGeometry = tapeGeometry.clone()
    markingsGeometry.translate(0.8, 0, 0)
    parts.push({ geometry: markingsGeometry, material: 'metal', name: 'markings' })
    
    return parts
  }, [tapeGeometry])

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
    
    if (tapeBladeRef.current) {
      const bladeExtension = Math.sin(currentTime * 0.002) * 0.1
      tapeBladeRef.current.scale.x = 1 + bladeExtension
    }
    
    if (lockButtonRef.current) {
      const buttonPress = Math.sin(currentTime * 0.008) * 0.02
      lockButtonRef.current.position.y = 0.15 - buttonPress
    }
    
    if (tapeCaseRef.current) {
      const caseGlow = Math.sin(currentTime * 0.004) * 0.01
      tapeCaseRef.current.scale.setScalar(1 + caseGlow)
    }
    
    if (tapeHookRef.current) {
      const hookSway = Math.cos(currentTime * 0.003) * 0.005
      tapeHookRef.current.rotation.z = hookSway
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
        name: 'Professional Measuring Tape',
        description: '25-foot steel tape measure with magnetic hook and standout blade'
      }}
    >
      <mesh 
        ref={tapeCaseRef}
        geometry={tapeParts[0].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="plastic" 
          variant="yellow"
          roughness={0.3}
          metalness={0.1}
          normalScale={0.4}
        />
      </mesh>

      <mesh 
        ref={tapeBladeRef}
        geometry={tapeParts[1].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="metal" 
          variant="steel"
          roughness={0.2}
          metalness={0.8}
          normalScale={0.6}
        />
      </mesh>

      <mesh 
        ref={tapeHookRef}
        geometry={tapeParts[2].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="metal" 
          variant="steel"
          roughness={0.25}
          metalness={0.9}
          normalScale={0.8}
        />
      </mesh>

      <mesh 
        ref={beltClipRef}
        geometry={tapeParts[3].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="metal" 
          variant="steel"
          roughness={0.3}
          metalness={0.85}
          normalScale={0.7}
        />
      </mesh>

      <mesh 
        ref={lockButtonRef}
        geometry={tapeParts[4].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="plastic" 
          variant="black"
          roughness={0.4}
          metalness={0.1}
          normalScale={0.3}
        />
      </mesh>

      <mesh 
        ref={thumbStopRef}
        geometry={tapeParts[5].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="rubber" 
          variant="black"
          roughness={0.9}
          metalness={0.0}
          normalScale={0.8}
        />
      </mesh>

      <mesh 
        ref={markingsRef}
        geometry={tapeParts[6].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="metal" 
          variant="steel"
          roughness={0.4}
          metalness={0.7}
          normalScale={0.5}
        />
      </mesh>

      {performanceLevel === 'high' && (
        <>
          <pointLight
            position={[0.8, 0, 0.2]}
            intensity={0.3}
            distance={2}
            decay={2}
            color="#F97316"
          />
          
          <spotLight
            position={[0, 0.6, 0.8]}
            target={groupRef.current}
            angle={Math.PI / 5}
            penumbra={0.4}
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

export function MeasuringTapeModelLOD({ 
  position, 
  scale, 
  staggerIndex, 
  distance 
}: MeasuringTapeModelProps & { distance: number }) {
  const performanceLevel = useMemo(() => {
    if (distance > 10) return 'low'
    if (distance > 5) return 'medium'
    return 'high'
  }, [distance])

  return (
    <MeasuringTapeModel
      position={position}
      scale={scale}
      staggerIndex={staggerIndex}
      performanceLevel={performanceLevel}
      isVisible={distance < 20}
    />
  )
}

export function ProfessionalMeasuringTape({ 
  category = 'general',
  ...props 
}: MeasuringTapeModelProps & { 
  category?: 'general' | 'carpentry' | 'surveying' | 'handyman' 
}) {
  const categoryConfigs = {
    general: {
      scale: new Vector3(1.0, 1.0, 1.0),
      description: 'Professional Measuring Tape - 25ft Steel with Magnetic Hook'
    },
    carpentry: {
      scale: new Vector3(1.2, 1.2, 1.2),
      description: 'Heavy-Duty Framing Tape - 35ft with Standout Blade'
    },
    surveying: {
      scale: new Vector3(1.4, 1.4, 1.4),
      description: 'Long-Range Survey Tape - 100ft Fiberglass with Reel'
    },
    handyman: {
      scale: new Vector3(0.8, 0.8, 0.8),
      description: 'Compact Pocket Tape - 16ft with Belt Clip'
    }
  }

  const config = categoryConfigs[category]

  return (
    <MeasuringTapeModel
      {...props}
      scale={config.scale}
    />
  )
}

export function AnimatedMeasuringTapeShowcase() {
  const positions = [
    new Vector3(-3, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(3, 0, 0)
  ]

  const categories: Array<'general' | 'carpentry' | 'surveying' | 'handyman'> = [
    'general', 'carpentry', 'surveying', 'handyman'
  ]

  return (
    <group>
      {positions.map((position, index) => (
        <ProfessionalMeasuringTape
          key={`measuring-tape-${index}`}
          position={position}
          category={categories[index]}
          staggerIndex={index}
          performanceLevel="high"
        />
      ))}
    </group>
  )
}

export default MeasuringTapeModel
