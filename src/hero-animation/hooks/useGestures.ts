import { useRef, useCallback, useMemo, useEffect } from 'react'
import { Vector3, Euler, MathUtils } from 'three'
import { TIMING } from '../utils/constants'
import { 
  easeInOutSine, 
  easeOutCubic, 
  linear, 
  spring,
  createAnimationLoop,
  createTimeline
} from '../utils/animations'

interface AnimationConfig {
  duration?: number
  delay?: number
  loop?: boolean
  autoplay?: boolean
  direction?: 'forward' | 'reverse' | 'alternate'
  easing?: (t: number) => number
  onStart?: () => void
  onUpdate?: (progress: number) => void
  onComplete?: () => void
  onLoop?: () => void
}

interface AnimationState {
  isPlaying: boolean
  isPaused: boolean
  isComplete: boolean
  currentTime: number
  progress: number
  direction: 'forward' | 'reverse'
  loopCount: number
  startTime: number
}

export function useAnimation(config: AnimationConfig = {}) {
  const {
    duration = TIMING.LOOP_DURATION,
    delay = 0,
    loop = true,
    autoplay = true,
    direction = 'forward',
    easing = easeInOutSine,
    onStart,
    onUpdate,
    onComplete,
    onLoop
  } = config

  const animationState = useRef<AnimationState>({
    isPlaying: autoplay,
    isPaused: false,
    isComplete: false,
    currentTime: 0,
    progress: 0,
    direction,
    loopCount: 0,
    startTime: 0
  })

  const animationTime = useRef<number>(0)
  const previousTime = useRef<number>(0)
  const delayTimer = useRef<number>(0)
  const hasStarted = useRef<boolean>(false)
  const frameId = useRef<number>(0)

  const updateAnimation = useCallback((deltaTime: number) => {
    const currentState = animationState.current
    
    if (!currentState.isPlaying || currentState.isPaused) return

    const deltaMs = deltaTime * 1000
    
    if (delayTimer.current < delay) {
      delayTimer.current += deltaMs
      return
    }

    if (!hasStarted.current && onStart) {
      onStart()
      hasStarted.current = true
      currentState.startTime = performance.now()
    }

    animationTime.current += deltaMs
    currentState.currentTime += deltaMs

    let rawProgress = currentState.currentTime / duration
    
    if (currentState.direction === 'reverse') {
      rawProgress = 1 - rawProgress
    }

    if (rawProgress >= 1) {
      if (loop) {
        currentState.loopCount++
        currentState.currentTime = 0
        rawProgress = 0
        
        if (direction === 'alternate') {
          reverse()
        }
        
        if (onLoop) {
          onLoop()
        }
      } else {
        rawProgress = 1
        currentState.isComplete = true
        currentState.isPlaying = false
        
        if (onComplete) {
          onComplete()
        }
      }
    }

    const easedProgress = easing(MathUtils.clamp(rawProgress, 0, 1))
    currentState.progress = easedProgress

    if (onUpdate) {
      onUpdate(easedProgress)
    }
  }, [duration, delay, loop, direction, easing, onStart, onUpdate, onComplete, onLoop])

  useEffect(() => {
    try {
      const { useFrame } = require('@react-three/fiber')
      useFrame((state, deltaTime) => {
        updateAnimation(deltaTime)
      })
    } catch {
      let lastTime = performance.now()
      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTime) / 1000
        lastTime = currentTime
        updateAnimation(deltaTime)
        if (animationState.current.isPlaying && !animationState.current.isComplete) {
          frameId.current = requestAnimationFrame(animate)
        }
      }
      if (animationState.current.isPlaying) {
        frameId.current = requestAnimationFrame(animate)
      }
    }

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
    }
  }, [updateAnimation])

  const play = useCallback(() => {
    animationState.current.isPlaying = true
    animationState.current.isPaused = false
    
    if (!hasStarted.current && onStart) {
      onStart()
      hasStarted.current = true
    }
  }, [onStart])

  const pause = useCallback(() => {
    animationState.current.isPaused = true
    animationState.current.isPlaying = false
  }, [])

  const stop = useCallback(() => {
    animationState.current.isPlaying = false
    animationState.current.isPaused = false
    animationState.current.isComplete = false
    animationState.current.currentTime = 0
    animationState.current.progress = 0
    animationState.current.loopCount = 0
    animationTime.current = 0
    delayTimer.current = 0
    hasStarted.current = false
  }, [])

  const restart = useCallback(() => {
    stop()
    play()
  }, [stop, play])

  const seek = useCallback((progress: number) => {
    const clampedProgress = MathUtils.clamp(progress, 0, 1)
    animationState.current.progress = clampedProgress
    animationState.current.currentTime = clampedProgress * duration
    animationTime.current = animationState.current.currentTime
  }, [duration])

  const reverse = useCallback(() => {
    animationState.current.direction = 
      animationState.current.direction === 'forward' ? 'reverse' : 'forward'
  }, [])

  const animationData = useMemo(() => ({
    isPlaying: animationState.current.isPlaying,
    isPaused: animationState.current.isPaused,
    isComplete: animationState.current.isComplete,
    currentTime: animationState.current.currentTime,
    progress: animationState.current.progress,
    direction: animationState.current.direction,
    loopCount: animationState.current.loopCount,
    animationTime: animationTime.current,
    duration,
    delay
  }), [duration, delay])

  return {
    ...animationData,
    play,
    pause,
    stop,
    restart,
    seek,
    reverse
  }
}

export function useFloatingAnimation(
  basePosition: Vector3,
  amplitude: number = TIMING.FLOAT_AMPLITUDE,
  duration: number = TIMING.FLOAT_DURATION
) {
  const position = useRef<Vector3>(basePosition.clone())
  
  const { progress, animationTime } = useAnimation({
    duration,
    loop: true,
    easing: easeInOutSine
  })

  useEffect(() => {
    const offset = Math.sin(progress * Math.PI * 2) * amplitude * 0.01
    position.current.copy(basePosition)
    position.current.y += offset
  }, [progress, basePosition, amplitude])

  return {
    position: position.current,
    animationTime,
    progress
  }
}

export function useRotationAnimation(
  baseRotation: Euler,
  axis: 'x' | 'y' | 'z' = 'y',
  duration: number = TIMING.ROTATION_DURATION
) {
  const rotation = useRef<Euler>(baseRotation.clone())
  
  const { progress } = useAnimation({
    duration,
    loop: true,
    easing: linear
  })

  useEffect(() => {
    const angle = progress * Math.PI * 2
    rotation.current.copy(baseRotation)
    
    switch (axis) {
      case 'x':
        rotation.current.x += angle
        break
      case 'y':
        rotation.current.y += angle
        break
      case 'z':
        rotation.current.z += angle
        break
    }
  }, [progress, baseRotation, axis])

  return {
    rotation: rotation.current,
    progress
  }
}

export function useStaggeredAnimation(
  count: number,
  staggerDelay: number = TIMING.STAGGER_DELAY,
  animationConfig: AnimationConfig = {}
) {
  const animations = useRef<ReturnType<typeof useAnimation>[]>([])
  
  useEffect(() => {
    animations.current = Array.from({ length: count }, (_, index) => 
      useAnimation({
        ...animationConfig,
        delay: (animationConfig.delay || 0) + (index * staggerDelay)
      })
    )
  }, [count, staggerDelay, animationConfig])

  const playAll = useCallback(() => {
    animations.current.forEach(anim => anim.play())
  }, [])

  const pauseAll = useCallback(() => {
    animations.current.forEach(anim => anim.pause())
  }, [])

  const stopAll = useCallback(() => {
    animations.current.forEach(anim => anim.stop())
  }, [])

  const restartAll = useCallback(() => {
    animations.current.forEach(anim => anim.restart())
  }, [])

  return {
    animations: animations.current,
    playAll,
    pauseAll,
    stopAll,
    restartAll
  }
}

export function useSequenceAnimation(
  sequences: Array<{
    duration: number
    easing?: (t: number) => number
    onUpdate: (progress: number) => void
  }>
) {
  const currentSequenceIndex = useRef<number>(0)
  const totalDuration = useMemo(() => 
    sequences.reduce((sum, seq) => sum + seq.duration, 0), [sequences]
  )

  const { progress, animationTime, ...controls } = useAnimation({
    duration: totalDuration,
    loop: true,
    onUpdate: (globalProgress) => {
      const currentTime = globalProgress * totalDuration
      let accumulatedTime = 0
      
      for (let i = 0; i < sequences.length; i++) {
        const sequence = sequences[i]
        const sequenceEndTime = accumulatedTime + sequence.duration
        
        if (currentTime >= accumulatedTime && currentTime <= sequenceEndTime) {
          currentSequenceIndex.current = i
          const localProgress = (currentTime - accumulatedTime) / sequence.duration
          const easing = sequence.easing || easeInOutSine
          const easedProgress = easing(localProgress)
          sequence.onUpdate(easedProgress)
          break
        }
        
        accumulatedTime += sequence.duration
      }
    }
  })

  return {
    progress,
    animationTime,
    currentSequenceIndex: currentSequenceIndex.current,
    totalDuration,
    ...controls
  }
}

export function useSpringAnimation(
  from: number | Vector3 | Euler,
  to: number | Vector3 | Euler,
  config: { tension?: number; friction?: number; precision?: number } = {}
) {
  const { tension = 0.8, friction = 0.2, precision = 0.001 } = config
  const current = useRef(typeof from === 'number' ? from : from.clone())
  const velocity = useRef(typeof from === 'number' ? 0 : new Vector3())
  const target = useRef(typeof to === 'number' ? to : to.clone())
  const frameId = useRef<number>(0)

  const updateSpring = useCallback((deltaTime: number) => {
    if (typeof current.current === 'number' && typeof target.current === 'number') {
      const force = (target.current - current.current) * tension
      velocity.current += force * deltaTime
      velocity.current *= (1 - friction * deltaTime)
      current.current += velocity.current * deltaTime
    } else if (current.current instanceof Vector3 && target.current instanceof Vector3) {
      const force = target.current.clone().sub(current.current).multiplyScalar(tension)
      velocity.current.add(force.multiplyScalar(deltaTime))
      velocity.current.multiplyScalar(1 - friction * deltaTime)
      current.current.add(velocity.current.clone().multiplyScalar(deltaTime))
    }
  }, [tension, friction])

  useEffect(() => {
    try {
      const { useFrame } = require('@react-three/fiber')
      useFrame((state, deltaTime) => {
        updateSpring(deltaTime)
      })
    } catch {
      let lastTime = performance.now()
      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTime) / 1000
        lastTime = currentTime
        updateSpring(deltaTime)
        const isAtRest = typeof velocity.current === 'number' ? 
          Math.abs(velocity.current) < precision :
          velocity.current.length() < precision
        if (!isAtRest) {
          frameId.current = requestAnimationFrame(animate)
        }
      }
      frameId.current = requestAnimationFrame(animate)
    }

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
    }
  }, [updateSpring, precision])

  const setTarget = useCallback((newTarget: typeof to) => {
    if (typeof newTarget === 'number') {
      target.current = newTarget
    } else {
      target.current = newTarget.clone()
    }
  }, [])

  return {
    current: current.current,
    setTarget,
    isAtRest: typeof velocity.current === 'number' ? 
      Math.abs(velocity.current) < precision :
      velocity.current.length() < precision
  }
}

export function useAnimationTimeline() {
  const timeline = useRef(createTimeline())
  const { animationTime, ...controls } = useAnimation()
  const frameId = useRef<number>(0)

  useEffect(() => {
    try {
      const { useFrame } = require('@react-three/fiber')
      useFrame(() => {
        timeline.current.update(animationTime)
      })
    } catch {
      const animate = () => {
        timeline.current.update(animationTime)
        frameId.current = requestAnimationFrame(animate)
      }
      frameId.current = requestAnimationFrame(animate)
    }

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
    }
  }, [animationTime])

  const addKeyframe = useCallback((time: number, callback: () => void) => {
    timeline.current.add(time, callback)
  }, [])

  const resetTimeline = useCallback(() => {
    timeline.current.reset()
  }, [])

  return {
    addKeyframe,
    resetTimeline,
    animationTime,
    ...controls
  }
}

export default useAnimation
