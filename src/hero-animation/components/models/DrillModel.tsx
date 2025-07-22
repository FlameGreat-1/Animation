import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Group, Vector3, Euler } from 'three'
import { PBRMaterial } from '../materials/PBRMaterials'
import { createDrillGeometry } from '@/utils/geometryHelpers'
import { 
  calculateFloatingPosition, 
  calculateRotation, 
  calculatePhysicsMotion 
} from '@/utils/animations'
import { SCENE_CONFIG, PHYSICS_CONFIG, TIMING } from '@/utils/constants'
import { useAnimation } from '@/hooks/useAnimation'
import { usePhysics } from '@/hooks/usePhysics'

interface DrillModelProps {
  position?: Vector3
  scale?: Vector3
  staggerIndex?: number
  isVisible?: boolean
  performanceLevel?: 'low' | 'medium' | 'high'
}

export function DrillModel({ 
  position = SCENE_CONFIG.TOOL_POSITIONS.DRILL,
  scale = SCENE_CONFIG.TOOL_SCALES.DRILL,
  staggerIndex = 1,
  isVisible = true,
  performanceLevel = 'high'
}: DrillModelProps) {
  const groupRef = useRef<Group>(null)
  const drillBodyRef = useRef<Mesh>(null)
  const drillChuckRef = useRef<Mesh>(null)
  const drillBitRef = useRef<Mesh>(null)
  const drillHandleRef = useRef<Mesh>(null)
  const drillTriggerRef = useRef<Mesh>(null)
  const drillBatteryRef = useRef<Mesh>(null)

  const basePosition = useMemo(() => position.clone(), [position])
  const baseRotation = useMemo(() => new Euler(0, 0, 0), [])
  
  const { animationTime, isPlaying } = useAnimation()
  const { velocity, updatePhysics } = usePhysics({
    mass: PHYSICS_CONFIG.TOOL_MASS * 1.2,
    damping: PHYSICS_CONFIG.DAMPING,
    angularDamping: PHYSICS_CONFIG.ANGULAR_DAMPING
  })

  const drillGeometry = useMemo(() => {
    const geometry = createDrillGeometry()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    return geometry
  }, [])

  const drillParts = useMemo(() => {
    const parts = []
    
    const bodyGeometry = drillGeometry.clone()
    parts.push({ geometry: bodyGeometry, material: 'plastic', name: 'body' })
    
    const chuckGeometry = drillGeometry.clone()
    chuckGeometry.translate(0.5, 0, 0)
    parts.push({ geometry: chuckGeometry, material: 'metal', name: 'chuck' })
    
    const bitGeometry = drillGeometry.clone()
    bitGeometry.translate(0.8, 0, 0)
    parts.push({ geometry: bitGeometry, material: 'metal', name: 'bit' })
    
    const handleGeometry = drillGeometry.clone()
    handleGeometry.translate(-0.2, -0.3, 0)
    parts.push({ geometry: handleGeometry, material: 'rubber', name: 'handle' })
    
    const triggerGeometry = drillGeometry.clone()
    triggerGeometry.translate(-0.1, -0.2, 0)
    parts.push({ geometry: triggerGeometry, material: 'plastic', name: 'trigger' })
    
    const batteryGeometry = drillGeometry.clone()
    batteryGeometry.translate(-0.3, -0.4, 0)
    parts.push({ geometry: batteryGeometry, material: 'plastic', name: 'battery' })
    
    return parts
  }, [drillGeometry])

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
    
    if (drillBitRef.current) {
      const bitSpin = currentTime * 0.01
      drillBitRef.current.rotation.x = bitSpin
    }
    
    if (drillChuckRef.current) {
      const chuckVibration = Math.sin(currentTime * 0.02) * 0.005
      drillChuckRef.current.position.x = 0.5 + chuckVibration
    }
    
    if (drillBodyRef.current) {
      const bodyPulse = Math.sin(currentTime * 0.004) * 0.01
      drillBodyRef.current.scale.setScalar(1 + bodyPulse)
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
        category: 'electrical',
        name: 'Professional Cordless Drill',
        description: '18V Lithium-Ion drill with variable speed control and LED work light'
      }}
    >
      <mesh 
        ref={drillBodyRef}
        geometry={drillParts[0].geometry}
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
        ref={drillChuckRef}
        geometry={drillParts[1].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="metal" 
          variant="chrome"
          roughness={0.15}
          metalness={0.95}
          normalScale={1.0}
        />
      </mesh>

      <mesh 
        ref={drillBitRef}
        geometry={drillParts[2].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="metal" 
          variant="steel"
          roughness={0.2}
          metalness={0.9}
          normalScale={0.8}
        />
      </mesh>

      <mesh 
        ref={drillHandleRef}
        geometry={drillParts[3].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="rubber" 
          variant="black"
          roughness={0.9}
          metalness={0.0}
          normalScale={0.7}
        />
      </mesh>

      <mesh 
        ref={drillTriggerRef}
        geometry={drillParts[4].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="plastic" 
          variant="yellow"
          roughness={0.3}
          metalness={0.1}
          normalScale={0.2}
        />
      </mesh>

      <mesh 
        ref={drillBatteryRef}
        geometry={drillParts[5].geometry}
        castShadow
        receiveShadow
      >
        <PBRMaterial 
          type="plastic" 
          variant="black"
          roughness={0.5}
          metalness={0.2}
          normalScale={0.4}
        />
      </mesh>

      {performanceLevel === 'high' && (
        <>
          <pointLight
            position={[0.8, 0.1, 0.1]}
            intensity={0.5}
            distance={1.5}
            decay={2}
            color="#FFFFFF"
          />
          
          <spotLight
            position={[0, 0.5, 1]}
            target={groupRef.current}
            angle={Math.PI / 8}
            penumbra={0.3}
            intensity={0.6}
            distance={4}
            decay={2}
            color="#F97316"
            castShadow
          />
        </>
      )}
    </group>
  )
}

export function DrillModelLOD({ 
  position, 
  scale, 
  staggerIndex, 
  distance 
}: DrillModelProps & { distance: number }) {
  const performanceLevel = useMemo(() => {
    if (distance > 10) return 'low'
    if (distance > 5) return 'medium'
    return 'high'
  }, [distance])

  return (
    <DrillModel
      position={position}
      scale={scale}
      staggerIndex={staggerIndex}
      performanceLevel={performanceLevel}
      isVisible={distance < 20}
    />
  )
}

export function ProfessionalDrill({ 
  category = 'electrical',
  ...props 
}: DrillModelProps & { 
  category?: 'electrical' | 'general' | 'plumbing' | 'handyman' 
}) {
  const categoryConfigs = {
    electrical: {
      scale: new Vector3(1.1, 1.1, 1.1),
      description: 'Professional Cordless Drill - 18V Li-Ion with LED'
    },
    general: {
      scale: new Vector3(1.0, 1.0, 1.0),
      description: 'Multi-Purpose Drill Driver - Variable Speed'
    },
    plumbing: {
      scale: new Vector3(1.2, 1.2, 1.2),
      description: 'Heavy-Duty Right Angle Drill for Tight Spaces'
    },
    handyman: {
      scale: new Vector3(0.9, 0.9, 0.9),
      description: 'Compact Drill Driver with Quick-Change Chuck'
    }
  }

  const config = categoryConfigs[category]

  return (
    <DrillModel
      {...props}
      scale={config.scale}
    />
  )
}

export function AnimatedDrillShowcase() {
  const positions = [
    new Vector3(-3, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(3, 0, 0)
  ]

  const categories: Array<'electrical' | 'general' | 'plumbing' | 'handyman'> = [
    'electrical', 'general', 'plumbing', 'handyman'
  ]

  return (
    <group>
      {positions.map((position, index) => (
        <ProfessionalDrill
          key={`drill-${index}`}
          position={position}
          category={categories[index]}
          staggerIndex={index}
          performanceLevel="high"
        />
      ))}
    </group>
  )
}

export default DrillModel
