import { useRef, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Euler } from 'three'
import { PHYSICS_CONFIG } from '../utils/constants'
interface PhysicsConfig {
  mass?: number
  damping?: number
  angularDamping?: number
  friction?: number
  restitution?: number
  gravity?: Vector3
  buoyancy?: number
  enabled?: boolean
}

interface PhysicsState {
  position: Vector3
  velocity: Vector3
  acceleration: Vector3
  rotation: Euler
  angularVelocity: Vector3
  angularAcceleration: Vector3
  forces: Vector3[]
  torques: Vector3[]
}

export function usePhysics(config: PhysicsConfig = {}) {
  const {
    mass = PHYSICS_CONFIG.TOOL_MASS,
    damping = PHYSICS_CONFIG.DAMPING,
    angularDamping = PHYSICS_CONFIG.ANGULAR_DAMPING,
    friction = PHYSICS_CONFIG.FRICTION,
    restitution = PHYSICS_CONFIG.RESTITUTION,
    gravity = PHYSICS_CONFIG.GRAVITY,
    buoyancy = PHYSICS_CONFIG.BUOYANCY_FORCE,
    enabled = true
  } = config

  const physicsState = useRef<PhysicsState>({
    position: new Vector3(),
    velocity: new Vector3(),
    acceleration: new Vector3(),
    rotation: new Euler(),
    angularVelocity: new Vector3(),
    angularAcceleration: new Vector3(),
    forces: [],
    torques: []
  })

  const previousTime = useRef<number>(0)
  const isInitialized = useRef<boolean>(false)

  const addForce = useCallback((force: Vector3) => {
    if (!enabled) return
    physicsState.current.forces.push(force.clone())
  }, [enabled])

  const addTorque = useCallback((torque: Vector3) => {
    if (!enabled) return
    physicsState.current.torques.push(torque.clone())
  }, [enabled])

  const clearForces = useCallback(() => {
    physicsState.current.forces.length = 0
    physicsState.current.torques.length = 0
  }, [])

  const applyGravity = useCallback(() => {
    if (!enabled) return
    const gravityForce = gravity.clone().multiplyScalar(mass)
    addForce(gravityForce)
  }, [enabled, gravity, mass, addForce])

  const applyBuoyancy = useCallback(() => {
    if (!enabled) return
    const buoyancyForce = new Vector3(0, buoyancy * mass, 0)
    addForce(buoyancyForce)
  }, [enabled, buoyancy, mass, addForce])

  const applyDamping = useCallback((deltaTime: number) => {
    if (!enabled) return
    
    const dampingFactor = Math.pow(1 - damping, deltaTime)
    const angularDampingFactor = Math.pow(1 - angularDamping, deltaTime)
    
    physicsState.current.velocity.multiplyScalar(dampingFactor)
    physicsState.current.angularVelocity.multiplyScalar(angularDampingFactor)
  }, [enabled, damping, angularDamping])

  const calculateNetForce = useCallback((): Vector3 => {
    const netForce = new Vector3()
    physicsState.current.forces.forEach(force => {
      netForce.add(force)
    })
    return netForce
  }, [])

  const calculateNetTorque = useCallback((): Vector3 => {
    const netTorque = new Vector3()
    physicsState.current.torques.forEach(torque => {
      netTorque.add(torque)
    })
    return netTorque
  }, [])

  const integrateMotion = useCallback((deltaTime: number) => {
    if (!enabled || deltaTime <= 0) return

    const state = physicsState.current
    
    const netForce = calculateNetForce()
    const netTorque = calculateNetTorque()
    
    state.acceleration.copy(netForce).divideScalar(mass)
    state.angularAcceleration.copy(netTorque).divideScalar(mass)
    
    state.velocity.add(state.acceleration.clone().multiplyScalar(deltaTime))
    state.angularVelocity.add(state.angularAcceleration.clone().multiplyScalar(deltaTime))
    
    applyDamping(deltaTime)
    
    state.position.add(state.velocity.clone().multiplyScalar(deltaTime))
    
    const angularDisplacement = state.angularVelocity.clone().multiplyScalar(deltaTime)
    state.rotation.x += angularDisplacement.x
    state.rotation.y += angularDisplacement.y
    state.rotation.z += angularDisplacement.z
    
    clearForces()
  }, [enabled, mass, calculateNetForce, calculateNetTorque, applyDamping, clearForces])

  const updatePhysics = useCallback((deltaTime: number) => {
    if (!enabled) return

    if (!isInitialized.current) {
      previousTime.current = performance.now()
      isInitialized.current = true
      return
    }

    const clampedDeltaTime = Math.min(deltaTime, 1/30)
    
    applyGravity()
    applyBuoyancy()
    integrateMotion(clampedDeltaTime)
    
    previousTime.current = performance.now()
  }, [enabled, applyGravity, applyBuoyancy, integrateMotion])

  const resetPhysics = useCallback(() => {
    const state = physicsState.current
    state.position.set(0, 0, 0)
    state.velocity.set(0, 0, 0)
    state.acceleration.set(0, 0, 0)
    state.rotation.set(0, 0, 0)
    state.angularVelocity.set(0, 0, 0)
    state.angularAcceleration.set(0, 0, 0)
    clearForces()
    isInitialized.current = false
  }, [clearForces])

  const setPosition = useCallback((position: Vector3) => {
    physicsState.current.position.copy(position)
  }, [])

  const setVelocity = useCallback((velocity: Vector3) => {
    physicsState.current.velocity.copy(velocity)
  }, [])

  const setRotation = useCallback((rotation: Euler) => {
    physicsState.current.rotation.copy(rotation)
  }, [])

  const setAngularVelocity = useCallback((angularVelocity: Vector3) => {
    physicsState.current.angularVelocity.copy(angularVelocity)
  }, [])

  const getKineticEnergy = useCallback((): number => {
    const state = physicsState.current
    const linearKE = 0.5 * mass * state.velocity.lengthSq()
    const angularKE = 0.5 * mass * state.angularVelocity.lengthSq()
    return linearKE + angularKE
  }, [mass])

  const getPotentialEnergy = useCallback((): number => {
    const state = physicsState.current
    return mass * Math.abs(gravity.y) * state.position.y
  }, [mass, gravity])

  const getTotalEnergy = useCallback((): number => {
    return getKineticEnergy() + getPotentialEnergy()
  }, [getKineticEnergy, getPotentialEnergy])

  const applyImpulse = useCallback((impulse: Vector3, point?: Vector3) => {
    if (!enabled) return
    
    const state = physicsState.current
    const velocityChange = impulse.clone().divideScalar(mass)
    state.velocity.add(velocityChange)
    
    if (point) {
      const torqueImpulse = point.clone().cross(impulse)
      const angularVelocityChange = torqueImpulse.divideScalar(mass)
      state.angularVelocity.add(angularVelocityChange)
    }
  }, [enabled, mass])

  const checkCollision = useCallback((otherPosition: Vector3, otherRadius: number, thisRadius: number): boolean => {
    const distance = physicsState.current.position.distanceTo(otherPosition)
    return distance < (otherRadius + thisRadius)
  }, [])

  const resolveCollision = useCallback((otherPosition: Vector3, otherVelocity: Vector3, otherMass: number) => {
    if (!enabled) return
    
    const state = physicsState.current
    const relativePosition = state.position.clone().sub(otherPosition)
    const relativeVelocity = state.velocity.clone().sub(otherVelocity)
    
    const distance = relativePosition.length()
    if (distance === 0) return
    
    const normal = relativePosition.normalize()
    const relativeSpeed = relativeVelocity.dot(normal)
    
    if (relativeSpeed > 0) return
    
    const totalMass = mass + otherMass
    const impulseScalar = -(1 + restitution) * relativeSpeed / totalMass
    const impulse = normal.multiplyScalar(impulseScalar * otherMass)
    
    applyImpulse(impulse)
  }, [enabled, mass, restitution, applyImpulse])

  const physicsData = useMemo(() => ({
    position: physicsState.current.position,
    velocity: physicsState.current.velocity,
    acceleration: physicsState.current.acceleration,
    rotation: physicsState.current.rotation,
    angularVelocity: physicsState.current.angularVelocity,
    angularAcceleration: physicsState.current.angularAcceleration,
    mass,
    damping,
    angularDamping,
    friction,
    restitution,
    enabled
  }), [mass, damping, angularDamping, friction, restitution, enabled])

  return {
    updatePhysics,
    resetPhysics,
    addForce,
    addTorque,
    clearForces,
    setPosition,
    setVelocity,
    setRotation,
    setAngularVelocity,
    applyImpulse,
    checkCollision,
    resolveCollision,
    getKineticEnergy,
    getPotentialEnergy,
    getTotalEnergy,
    ...physicsData
  }
}

export function useFloatingPhysics(amplitude: number = 20, frequency: number = 0.002) {
  const physics = usePhysics({
    mass: 0.5,
    damping: 0.05,
    gravity: new Vector3(0, -0.1, 0),
    buoyancy: 0.15
  })

  const applyFloatingForce = useCallback((time: number, basePosition: Vector3) => {
    const floatingForce = new Vector3(
      0,
      Math.sin(time * frequency) * amplitude * 0.001,
      0
    )
    physics.addForce(floatingForce)
  }, [physics, amplitude, frequency])

  return {
    ...physics,
    applyFloatingForce
  }
}

export function useToolPhysics(toolType: 'hammer' | 'drill' | 'level' | 'measuring-tape') {
  const toolConfigs = {
    hammer: {
      mass: PHYSICS_CONFIG.TOOL_MASS * 1.5,
      damping: 0.2,
      angularDamping: 0.15
    },
    drill: {
      mass: PHYSICS_CONFIG.TOOL_MASS * 1.2,
      damping: 0.15,
      angularDamping: 0.1
    },
    level: {
      mass: PHYSICS_CONFIG.TOOL_MASS * 0.8,
      damping: 0.1,
      angularDamping: 0.05
    },
    'measuring-tape': {
      mass: PHYSICS_CONFIG.TOOL_MASS * 0.6,
      damping: 0.12,
      angularDamping: 0.08
    }
  }

  const config = toolConfigs[toolType]
  return usePhysics(config)
}

export default usePhysics
