import { Vector3, Euler, MathUtils } from 'three'
import { TIMING } from './constants'

export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function easeInOutBack(t: number): number {
  const c1 = 1.70158
  const c2 = c1 * 1.525
  
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
}

export function easeInOutElastic(t: number): number {
  const c5 = (2 * Math.PI) / 4.5
  
  return t === 0
    ? 0
    : t === 1
    ? 1
    : t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
}

export function linear(t: number): number {
  return t
}

export function spring(t: number, tension: number = 0.8, friction: number = 0.2): number {
  const w = Math.sqrt(tension)
  const d = friction / (2 * Math.sqrt(tension))
  
  if (d < 1) {
    const wd = w * Math.sqrt(1 - d * d)
    return 1 - Math.exp(-d * w * t) * Math.cos(wd * t)
  } else {
    return 1 - Math.exp(-w * t)
  }
}

export function calculateFloatingPosition(time: number, basePosition: Vector3, amplitude: number = 20): Vector3 {
  const normalizedTime = (time % TIMING.FLOAT_DURATION) / TIMING.FLOAT_DURATION
  const sineWave = easeInOutSine(normalizedTime)
  const offset = Math.sin(sineWave * Math.PI * 2) * amplitude * 0.01
  
  return new Vector3(
    basePosition.x,
    basePosition.y + offset,
    basePosition.z
  )
}

export function calculateRotation(time: number, baseRotation: Euler, axis: 'x' | 'y' | 'z' = 'y'): Euler {
  const normalizedTime = (time % TIMING.ROTATION_DURATION) / TIMING.ROTATION_DURATION
  const rotationAngle = normalizedTime * Math.PI * 2
  
  const newRotation = baseRotation.clone()
  
  switch (axis) {
    case 'x':
      newRotation.x = baseRotation.x + rotationAngle
      break
    case 'y':
      newRotation.y = baseRotation.y + rotationAngle
      break
    case 'z':
      newRotation.z = baseRotation.z + rotationAngle
      break
  }
  
  return newRotation
}

export function calculatePhysicsMotion(
  time: number,
  basePosition: Vector3,
  velocity: Vector3,
  gravity: Vector3,
  buoyancy: number
): Vector3 {
  const deltaTime = time * 0.001
  
  const gravityForce = gravity.clone().multiplyScalar(deltaTime)
  const buoyancyForce = new Vector3(0, buoyancy * deltaTime, 0)
  
  const netForce = gravityForce.add(buoyancyForce)
  const newVelocity = velocity.clone().add(netForce)
  
  return basePosition.clone().add(newVelocity.clone().multiplyScalar(deltaTime))
}

export function calculateStaggeredDelay(index: number, baseDelay: number = TIMING.STAGGER_DELAY): number {
  return index * baseDelay
}

export function createAnimationLoop(duration: number, callback: (progress: number) => void): () => void {
  let startTime: number | null = null
  let animationId: number
  
  function animate(currentTime: number) {
    if (!startTime) startTime = currentTime
    
    const elapsed = currentTime - startTime
    const progress = (elapsed % duration) / duration
    
    callback(progress)
    
    animationId = requestAnimationFrame(animate)
  }
  
  animationId = requestAnimationFrame(animate)
  
  return () => cancelAnimationFrame(animationId)
}

export function interpolateVector3(start: Vector3, end: Vector3, t: number): Vector3 {
  return start.clone().lerp(end, t)
}

export function interpolateEuler(start: Euler, end: Euler, t: number): Euler {
  return new Euler(
    MathUtils.lerp(start.x, end.x, t),
    MathUtils.lerp(start.y, end.y, t),
    MathUtils.lerp(start.z, end.z, t),
    start.order
  )
}

export function smoothStep(edge0: number, edge1: number, x: number): number {
  const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

export function smootherStep(edge0: number, edge1: number, x: number): number {
  const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

export function calculateWaveMotion(
  time: number,
  frequency: number = 1,
  amplitude: number = 1,
  phase: number = 0
): number {
  return Math.sin(time * frequency + phase) * amplitude
}

export function calculateBounce(t: number): number {
  const n1 = 7.5625
  const d1 = 2.75
  
  if (t < 1 / d1) {
    return n1 * t * t
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  }
}

export function calculateElastic(t: number, amplitude: number = 1, period: number = 0.3): number {
  if (t === 0) return 0
  if (t === 1) return 1
  
  const s = period / 4
  return amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / period) + 1
}

export function createSequentialAnimation(
  animations: Array<{
    duration: number
    easing: (t: number) => number
    callback: (progress: number) => void
  }>
): (globalProgress: number) => void {
  const totalDuration = animations.reduce((sum, anim) => sum + anim.duration, 0)
  
  return (globalProgress: number) => {
    const currentTime = globalProgress * totalDuration
    let accumulatedTime = 0
    
    for (const animation of animations) {
      if (currentTime >= accumulatedTime && currentTime <= accumulatedTime + animation.duration) {
        const localProgress = (currentTime - accumulatedTime) / animation.duration
        const easedProgress = animation.easing(localProgress)
        animation.callback(easedProgress)
        break
      }
      accumulatedTime += animation.duration
    }
  }
}

export function createParallelAnimation(
  animations: Array<{
    delay: number
    duration: number
    easing: (t: number) => number
    callback: (progress: number) => void
  }>
): (globalProgress: number) => void {
  return (globalProgress: number) => {
    animations.forEach(animation => {
      const startTime = animation.delay
      const endTime = animation.delay + animation.duration
      const totalDuration = Math.max(...animations.map(a => a.delay + a.duration))
      const currentTime = globalProgress * totalDuration
      
      if (currentTime >= startTime && currentTime <= endTime) {
        const localProgress = (currentTime - startTime) / animation.duration
        const easedProgress = animation.easing(localProgress)
        animation.callback(easedProgress)
      }
    })
  }
}

export function calculateMotionBlur(
  currentPosition: Vector3,
  previousPosition: Vector3,
  velocity: Vector3
): number {
  const distance = currentPosition.distanceTo(previousPosition)
  const speed = velocity.length()
  return MathUtils.clamp(speed * distance * 0.1, 0, 1)
}

export function calculateCameraShake(
  time: number,
  intensity: number = 0.1,
  frequency: number = 10
): Vector3 {
  return new Vector3(
    (Math.random() - 0.5) * intensity * Math.sin(time * frequency),
    (Math.random() - 0.5) * intensity * Math.cos(time * frequency),
    (Math.random() - 0.5) * intensity * Math.sin(time * frequency * 0.7)
  )
}

export function createTimeline(): {
  add: (time: number, callback: () => void) => void
  update: (currentTime: number) => void
  reset: () => void
} {
  const keyframes: Array<{ time: number; callback: () => void; executed: boolean }> = []
  
  return {
    add: (time: number, callback: () => void) => {
      keyframes.push({ time, callback, executed: false })
      keyframes.sort((a, b) => a.time - b.time)
    },
    
    update: (currentTime: number) => {
      keyframes.forEach(keyframe => {
        if (currentTime >= keyframe.time && !keyframe.executed) {
          keyframe.callback()
          keyframe.executed = true
        }
      })
    },
    
    reset: () => {
      keyframes.forEach(keyframe => {
        keyframe.executed = false
      })
    }
  }
}

export function calculateParticleMotion(
  time: number,
  initialPosition: Vector3,
  velocity: Vector3,
  acceleration: Vector3,
  damping: number = 0.98
): { position: Vector3; velocity: Vector3 } {
  const deltaTime = time * 0.001
  
  const newVelocity = velocity.clone()
    .add(acceleration.clone().multiplyScalar(deltaTime))
    .multiplyScalar(damping)
  
  const newPosition = initialPosition.clone()
    .add(newVelocity.clone().multiplyScalar(deltaTime))
  
  return { position: newPosition, velocity: newVelocity }
}

export function createEasingFunction(
  type: 'sine' | 'cubic' | 'back' | 'elastic' | 'bounce' | 'spring' | 'linear',
  direction: 'in' | 'out' | 'inOut' = 'inOut'
): (t: number) => number {
  switch (type) {
    case 'sine':
      return direction === 'inOut' ? easeInOutSine : 
             direction === 'out' ? (t: number) => Math.sin(t * Math.PI / 2) :
             (t: number) => 1 - Math.cos(t * Math.PI / 2)
    
    case 'cubic':
      return direction === 'inOut' ? easeInOutCubic :
             direction === 'out' ? easeOutCubic :
             (t: number) => t * t * t
    
    case 'back':
      return easeInOutBack
    
    case 'elastic':
      return easeInOutElastic
    
    case 'bounce':
      return calculateBounce
    
    case 'spring':
      return spring
    
    case 'linear':
    default:
      return linear
  }
}
