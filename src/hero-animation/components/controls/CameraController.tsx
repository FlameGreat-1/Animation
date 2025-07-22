import React, { useRef, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Vector3, Euler, MathUtils } from 'three'
import { SCENE_CONFIG, TIMING } from '@/utils/constants'
import { 
  calculateFloatingPosition, 
  interpolateVector3, 
  interpolateEuler,
  easeInOutSine,
  smoothStep
} from '@/utils/animations'
import { useAnimation } from '@/hooks/useAnimation'
import { useGestures } from '@/hooks/useGestures'
import { usePerformance } from '@/hooks/usePerformance'

interface CameraControllerProps {
  enabled?: boolean
  autoRotate?: boolean
  followTarget?: boolean
  smoothTransitions?: boolean
  dynamicMovement?: boolean
  target?: Vector3
  distance?: number
  height?: number
}

interface CameraKeyframe {
  time: number
  position: Vector3
  target: Vector3
  fov: number
}

export function CameraController({
  enabled = true,
  autoRotate = true,
  followTarget = true,
  smoothTransitions = true,
  dynamicMovement = true,
  target = new Vector3(0, 0, 0),
  distance = 5,
  height = 2
}: CameraControllerProps) {
  const { camera, size } = useThree()
  const { animationTime, progress } = useAnimation()
  const { zoom, rotation, pan, isDragging, isPinching } = useGestures()
  const { quality } = usePerformance()

  const cameraRef = useRef<PerspectiveCamera>(camera as PerspectiveCamera)
  const targetRef = useRef<Vector3>(target.clone())
  const basePosition = useRef<Vector3>(SCENE_CONFIG.CAMERA.POSITION.clone())
  const baseTarget = useRef<Vector3>(SCENE_CONFIG.CAMERA.TARGET.clone())
  const currentPosition = useRef<Vector3>(basePosition.current.clone())
  const currentTarget = useRef<Vector3>(baseTarget.current.clone())
  const velocity = useRef<Vector3>(new Vector3())
  const isUserControlling = useRef<boolean>(false)

  const cameraKeyframes = useMemo<CameraKeyframe[]>(() => [
    {
      time: 0,
      position: new Vector3(0, 2, 5),
      target: new Vector3(0, 0, 0),
      fov: 75
    },
    {
      time: 0.25,
      position: new Vector3(4, 3, 3),
      target: new Vector3(1, 0, 0),
      fov: 70
    },
    {
      time: 0.5,
      position: new Vector3(0, 4, -5),
      target: new Vector3(0, 0, 0),
      fov: 80
    },
    {
      time: 0.75,
      position: new Vector3(-4, 2, 3),
      target: new Vector3(-1, 0, 0),
      fov: 75
    },
    {
      time: 1.0,
      position: new Vector3(0, 2, 5),
      target: new Vector3(0, 0, 0),
      fov: 75
    }
  ], [])

  const updateAspectRatio = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.aspect = size.width / size.height
      cameraRef.current.updateProjectionMatrix()
    }
  }, [size])

  const interpolateKeyframes = useCallback((time: number): CameraKeyframe => {
    const normalizedTime = (time % TIMING.LOOP_DURATION) / TIMING.LOOP_DURATION
    
    for (let i = 0; i < cameraKeyframes.length - 1; i++) {
      const current = cameraKeyframes[i]
      const next = cameraKeyframes[i + 1]
      
      if (normalizedTime >= current.time && normalizedTime <= next.time) {
        const segmentProgress = (normalizedTime - current.time) / (next.time - current.time)
        const easedProgress = easeInOutSine(segmentProgress)
        
        return {
          time: normalizedTime,
          position: interpolateVector3(current.position, next.position, easedProgress),
          target: interpolateVector3(current.target, next.target, easedProgress),
          fov: MathUtils.lerp(current.fov, next.fov, easedProgress)
        }
      }
    }
    
    return cameraKeyframes[0]
  }, [cameraKeyframes])

  const calculateAutoRotatePosition = useCallback((time: number, basePos: Vector3): Vector3 => {
    if (!autoRotate) return basePos
    
    const angle = (time / TIMING.ROTATION_DURATION) * Math.PI * 2
    const radius = basePos.length()
    
    return new Vector3(
      Math.cos(angle) * radius,
      basePos.y,
      Math.sin(angle) * radius
    )
  }, [autoRotate])

  const calculateDynamicMovement = useCallback((time: number, basePos: Vector3): Vector3 => {
    if (!dynamicMovement) return basePos
    
    const floatingPos = calculateFloatingPosition(time, basePos, 10)
    
    const breathingX = Math.sin(time * 0.0003) * 0.2
    const breathingZ = Math.cos(time * 0.0004) * 0.15
    
    return new Vector3(
      floatingPos.x + breathingX,
      floatingPos.y,
      floatingPos.z + breathingZ
    )
  }, [dynamicMovement])

  const applyGestureControls = useCallback((position: Vector3, targetPos: Vector3) => {
    if (!isDragging && !isPinching) return { position, target: targetPos }
    
    isUserControlling.current = true
    
    const zoomedPosition = position.clone().normalize().multiplyScalar(distance / zoom)
    
    const rotatedPosition = zoomedPosition.clone()
    rotatedPosition.applyEuler(new Euler(rotation.x, rotation.y, rotation.z))
    
    const pannedPosition = rotatedPosition.clone()
    pannedPosition.x += pan.x * 0.01
    pannedPosition.y += pan.y * 0.01
    
    const pannedTarget = targetPos.clone()
    pannedTarget.x += pan.x * 0.01
    pannedTarget.y += pan.y * 0.01
    
    return { position: pannedPosition, target: pannedTarget }
  }, [isDragging, isPinching, zoom, rotation, pan, distance])

  const smoothCameraTransition = useCallback((
    targetPosition: Vector3, 
    targetLookAt: Vector3, 
    deltaTime: number
  ) => {
    if (!smoothTransitions) {
      currentPosition.current.copy(targetPosition)
      currentTarget.current.copy(targetLookAt)
      return
    }
    
    const lerpFactor = isUserControlling.current ? 0.1 : 0.05
    const smoothFactor = smoothStep(0, 1, lerpFactor)
    
    currentPosition.current.lerp(targetPosition, smoothFactor)
    currentTarget.current.lerp(targetLookAt, smoothFactor)
    
    const velocityDamping = 0.95
    velocity.current.multiplyScalar(velocityDamping)
    currentPosition.current.add(velocity.current.clone().multiplyScalar(deltaTime))
  }, [smoothTransitions])

  const updateCameraFOV = useCallback((targetFOV: number) => {
    if (!cameraRef.current) return
    
    const currentFOV = cameraRef.current.fov
    const newFOV = MathUtils.lerp(currentFOV, targetFOV, 0.05)
    
    cameraRef.current.fov = newFOV
    cameraRef.current.updateProjectionMatrix()
  }, [])

  const handleUserInteractionTimeout = useCallback(() => {
    if (isUserControlling.current && !isDragging && !isPinching) {
      setTimeout(() => {
        if (!isDragging && !isPinching) {
          isUserControlling.current = false
        }
      }, 2000)
    }
  }, [isDragging, isPinching])

  const calculatePerformanceOptimizedPosition = useCallback((basePos: Vector3): Vector3 => {
    if (quality === 'low') {
      return basePos
    }
    
    if (quality === 'medium') {
      return calculateDynamicMovement(animationTime, basePos)
    }
    
    const autoRotatePos = calculateAutoRotatePosition(animationTime, basePos)
    return calculateDynamicMovement(animationTime, autoRotatePos)
  }, [quality, animationTime, calculateAutoRotatePosition, calculateDynamicMovement])

  useFrame((state, deltaTime) => {
    if (!enabled || !cameraRef.current) return
    
    updateAspectRatio()
    handleUserInteractionTimeout()
    
    let targetPosition: Vector3
    let targetLookAt: Vector3
    let targetFOV: number
    
    if (isUserControlling.current) {
      targetPosition = currentPosition.current.clone()
      targetLookAt = currentTarget.current.clone()
      targetFOV = cameraRef.current.fov
    } else {
      const keyframe = interpolateKeyframes(animationTime)
      targetPosition = calculatePerformanceOptimizedPosition(keyframe.position)
      targetLookAt = followTarget ? targetRef.current : keyframe.target
      targetFOV = keyframe.fov
    }
    
    const gestureControls = applyGestureControls(targetPosition, targetLookAt)
    targetPosition = gestureControls.position
    targetLookAt = gestureControls.target
    
    smoothCameraTransition(targetPosition, targetLookAt, deltaTime)
    updateCameraFOV(targetFOV)
    
    cameraRef.current.position.copy(currentPosition.current)
    cameraRef.current.lookAt(currentTarget.current)
    
    targetRef.current.copy(target)
  })

  React.useEffect(() => {
    updateAspectRatio()
  }, [updateAspectRatio])

  return null
}

export function StaticCameraController({ 
  position = SCENE_CONFIG.CAMERA.POSITION,
  target = SCENE_CONFIG.CAMERA.TARGET,
  fov = SCENE_CONFIG.CAMERA.FOV
}: {
  position?: Vector3
  target?: Vector3
  fov?: number
}) {
  const { camera } = useThree()
  
  React.useEffect(() => {
    camera.position.copy(position)
    camera.lookAt(target)
    if (camera instanceof PerspectiveCamera) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  }, [camera, position, target, fov])
  
  return null
}

export function OrbitCameraController({ 
  target = new Vector3(0, 0, 0),
  radius = 5,
  speed = 0.5,
  height = 2
}: {
  target?: Vector3
  radius?: number
  speed?: number
  height?: number
}) {
  const { animationTime } = useAnimation()
  
  return (
    <CameraController
      enabled={true}
      autoRotate={true}
      followTarget={true}
      smoothTransitions={true}
      dynamicMovement={false}
      target={target}
      distance={radius}
      height={height}
    />
  )
}

export function CinematicCameraController() {
  return (
    <CameraController
      enabled={true}
      autoRotate={false}
      followTarget={true}
      smoothTransitions={true}
      dynamicMovement={true}
    />
  )
}

export function InteractiveCameraController() {
  return (
    <CameraController
      enabled={true}
      autoRotate={false}
      followTarget={false}
      smoothTransitions={true}
      dynamicMovement={false}
    />
  )
}

export default CameraController
