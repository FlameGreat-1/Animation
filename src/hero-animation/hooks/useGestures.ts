import { useRef, useCallback, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useDrag, useWheel, usePinch, useGesture } from '@use-gesture/react'
import { Vector2, Vector3, Euler, MathUtils } from 'three'
import { GESTURE_CONFIG } from '../utils/constants'
interface GestureConfig {
  enabled?: boolean
  pinchToZoom?: boolean
  rotate?: boolean
  pan?: boolean
  hapticFeedback?: boolean
  voiceCommands?: boolean
  sensitivity?: {
    pinch?: number
    rotation?: number
    pan?: number
  }
  limits?: {
    minZoom?: number
    maxZoom?: number
    maxRotation?: number
  }
}

interface GestureState {
  isDragging: boolean
  isPinching: boolean
  isRotating: boolean
  zoom: number
  rotation: Vector3
  pan: Vector2
  velocity: Vector2
  lastPosition: Vector2
  startPosition: Vector2
  gestureCount: number
}

export function useGestures(config: GestureConfig = {}) {
  const {
    enabled = true,
    pinchToZoom = true,
    rotate = true,
    pan = true,
    hapticFeedback = true,
    voiceCommands = false,
    sensitivity = {
      pinch: GESTURE_CONFIG.PINCH_SENSITIVITY,
      rotation: GESTURE_CONFIG.ROTATION_SENSITIVITY,
      pan: GESTURE_CONFIG.PAN_SENSITIVITY
    },
    limits = {
      minZoom: GESTURE_CONFIG.MIN_ZOOM,
      maxZoom: GESTURE_CONFIG.MAX_ZOOM,
      maxRotation: Math.PI * 2
    }
  } = config

  const { camera, gl } = useThree()
  
  const gestureState = useRef<GestureState>({
    isDragging: false,
    isPinching: false,
    isRotating: false,
    zoom: 1,
    rotation: new Vector3(),
    pan: new Vector2(),
    velocity: new Vector2(),
    lastPosition: new Vector2(),
    startPosition: new Vector2(),
    gestureCount: 0
  })

  const initialCameraPosition = useRef<Vector3>(camera.position.clone())
  const initialCameraRotation = useRef<Euler>(camera.rotation.clone())
  const dampingFactor = useRef<number>(0.95)
  const isGestureActive = useRef<boolean>(false)

  const triggerHapticFeedback = useCallback((intensity: number = GESTURE_CONFIG.HAPTIC_INTENSITY) => {
    if (!hapticFeedback || !navigator.vibrate) return
    
    const duration = GESTURE_CONFIG.HAPTIC_DURATION
    navigator.vibrate(duration * intensity)
  }, [hapticFeedback])

  const clampZoom = useCallback((zoom: number): number => {
    return MathUtils.clamp(zoom, limits.minZoom!, limits.maxZoom!)
  }, [limits.minZoom, limits.maxZoom])

  const clampRotation = useCallback((rotation: number): number => {
    return MathUtils.clamp(rotation, -limits.maxRotation!, limits.maxRotation!)
  }, [limits.maxRotation])

  const updateCameraPosition = useCallback(() => {
    const state = gestureState.current
    
    const zoomDistance = initialCameraPosition.current.length() / state.zoom
    const direction = camera.position.clone().normalize()
    camera.position.copy(direction.multiplyScalar(zoomDistance))
    
    camera.position.x += state.pan.x
    camera.position.y += state.pan.y
    
    camera.rotation.x = initialCameraRotation.current.x + state.rotation.x
    camera.rotation.y = initialCameraRotation.current.y + state.rotation.y
    camera.rotation.z = initialCameraRotation.current.z + state.rotation.z
  }, [camera])

  const handleDragStart = useCallback((event: any) => {
    if (!enabled || !pan) return
    
    const state = gestureState.current
    state.isDragging = true
    state.startPosition.set(event.xy[0], event.xy[1])
    state.lastPosition.copy(state.startPosition)
    state.gestureCount++
    
    isGestureActive.current = true
    triggerHapticFeedback(0.2)
  }, [enabled, pan, triggerHapticFeedback])

  const handleDrag = useCallback((event: any) => {
    if (!enabled || !pan || !gestureState.current.isDragging) return
    
    const state = gestureState.current
    const currentPosition = new Vector2(event.xy[0], event.xy[1])
    const delta = currentPosition.clone().sub(state.lastPosition)
    
    state.velocity.copy(delta)
    state.pan.add(delta.multiplyScalar(sensitivity.pan!))
    state.lastPosition.copy(currentPosition)
    
    updateCameraPosition()
  }, [enabled, pan, sensitivity.pan, updateCameraPosition])

  const handleDragEnd = useCallback(() => {
    if (!enabled) return
    
    const state = gestureState.current
    state.isDragging = false
    isGestureActive.current = false
    
    triggerHapticFeedback(0.1)
  }, [enabled, triggerHapticFeedback])

  const handlePinchStart = useCallback((event: any) => {
    if (!enabled || !pinchToZoom) return
    
    const state = gestureState.current
    state.isPinching = true
    state.gestureCount++
    
    isGestureActive.current = true
    triggerHapticFeedback(0.3)
  }, [enabled, pinchToZoom, triggerHapticFeedback])

  const handlePinch = useCallback((event: any) => {
    if (!enabled || !pinchToZoom || !gestureState.current.isPinching) return
    
    const state = gestureState.current
    const scaleDelta = event.delta[0] * sensitivity.pinch!
    const newZoom = clampZoom(state.zoom + scaleDelta)
    
    if (newZoom !== state.zoom) {
      state.zoom = newZoom
      updateCameraPosition()
      
      if (Math.abs(scaleDelta) > 0.01) {
        triggerHapticFeedback(0.1)
      }
    }
  }, [enabled, pinchToZoom, sensitivity.pinch, clampZoom, updateCameraPosition, triggerHapticFeedback])

  const handlePinchEnd = useCallback(() => {
    if (!enabled) return
    
    const state = gestureState.current
    state.isPinching = false
    isGestureActive.current = false
    
    triggerHapticFeedback(0.1)
  }, [enabled, triggerHapticFeedback])

  const handleRotationStart = useCallback((event: any) => {
    if (!enabled || !rotate) return
    
    const state = gestureState.current
    state.isRotating = true
    state.gestureCount++
    
    isGestureActive.current = true
    triggerHapticFeedback(0.2)
  }, [enabled, rotate, triggerHapticFeedback])

  const handleRotation = useCallback((event: any) => {
    if (!enabled || !rotate || !gestureState.current.isRotating) return
    
    const state = gestureState.current
    const rotationDelta = event.delta[0] * sensitivity.rotation!
    
    state.rotation.y = clampRotation(state.rotation.y + rotationDelta)
    updateCameraPosition()
    
    if (Math.abs(rotationDelta) > 0.005) {
      triggerHapticFeedback(0.05)
    }
  }, [enabled, rotate, sensitivity.rotation, clampRotation, updateCameraPosition, triggerHapticFeedback])

  const handleRotationEnd = useCallback(() => {
    if (!enabled) return
    
    const state = gestureState.current
    state.isRotating = false
    isGestureActive.current = false
    
    triggerHapticFeedback(0.1)
  }, [enabled, triggerHapticFeedback])

  const handleWheel = useCallback((event: any) => {
    if (!enabled || !pinchToZoom) return
    
    const state = gestureState.current
    const wheelDelta = -event.delta[1] * sensitivity.pinch! * 0.001
    const newZoom = clampZoom(state.zoom + wheelDelta)
    
    if (newZoom !== state.zoom) {
      state.zoom = newZoom
      updateCameraPosition()
    }
  }, [enabled, pinchToZoom, sensitivity.pinch, clampZoom, updateCameraPosition])

  const dragBind = useDrag(
    ({ xy, delta, first, last }) => {
      if (first) handleDragStart({ xy })
      if (!first && !last) handleDrag({ xy, delta })
      if (last) handleDragEnd()
    },
    { 
      enabled: enabled && pan,
      pointer: { touch: true }
    }
  )

  const pinchBind = usePinch(
    ({ delta, first, last }) => {
      if (first) handlePinchStart({ delta })
      if (!first && !last) handlePinch({ delta })
      if (last) handlePinchEnd()
    },
    { 
      enabled: enabled && pinchToZoom,
      pointer: { touch: true }
    }
  )

  const wheelBind = useWheel(
    ({ delta }) => handleWheel({ delta }),
    { 
      enabled: enabled && pinchToZoom
    }
  )

  const gestureBind = useGesture(
    {
      onDrag: ({ xy, delta, first, last }) => {
        if (first) handleDragStart({ xy })
        if (!first && !last) handleDrag({ xy, delta })
        if (last) handleDragEnd()
      },
      onPinch: ({ delta, first, last }) => {
        if (first) handlePinchStart({ delta })
        if (!first && !last) handlePinch({ delta })
        if (last) handlePinchEnd()
      },
      onWheel: ({ delta }) => handleWheel({ delta })
    },
    {
      enabled,
      pointer: { touch: true },
      pinch: { pointer: { touch: true } }
    }
  )

  useFrame((state, deltaTime) => {
    const gestureStateRef = gestureState.current
    
    if (!isGestureActive.current && gestureStateRef.velocity.length() > 0.01) {
      gestureStateRef.velocity.multiplyScalar(dampingFactor.current)
      gestureStateRef.pan.add(gestureStateRef.velocity.clone().multiplyScalar(deltaTime))
      updateCameraPosition()
    }
  })

  const resetGestures = useCallback(() => {
    const state = gestureState.current
    state.zoom = 1
    state.rotation.set(0, 0, 0)
    state.pan.set(0, 0)
    state.velocity.set(0, 0)
    state.isDragging = false
    state.isPinching = false
    state.isRotating = false
    state.gestureCount = 0
    
    camera.position.copy(initialCameraPosition.current)
    camera.rotation.copy(initialCameraRotation.current)
    
    isGestureActive.current = false
  }, [camera])

  const setZoom = useCallback((zoom: number) => {
    gestureState.current.zoom = clampZoom(zoom)
    updateCameraPosition()
  }, [clampZoom, updateCameraPosition])

  const setRotation = useCallback((rotation: Vector3) => {
    gestureState.current.rotation.copy(rotation)
    updateCameraPosition()
  }, [updateCameraPosition])

  const setPan = useCallback((pan: Vector2) => {
    gestureState.current.pan.copy(pan)
    updateCameraPosition()
  }, [updateCameraPosition])

  const enableVoiceCommands = useCallback(() => {
    if (!voiceCommands || !('webkitSpeechRecognition' in window)) return

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase()
      
      if (command.includes('zoom in')) {
        setZoom(gestureState.current.zoom * 1.2)
        triggerHapticFeedback(0.3)
      } else if (command.includes('zoom out')) {
        setZoom(gestureState.current.zoom * 0.8)
        triggerHapticFeedback(0.3)
      } else if (command.includes('reset')) {
        resetGestures()
        triggerHapticFeedback(0.5)
      } else if (command.includes('rotate left')) {
        setRotation(new Vector3(0, gestureState.current.rotation.y - 0.5, 0))
        triggerHapticFeedback(0.2)
      } else if (command.includes('rotate right')) {
        setRotation(new Vector3(0, gestureState.current.rotation.y + 0.5, 0))
        triggerHapticFeedback(0.2)
      }
    }

    recognition.start()
    return () => recognition.stop()
  }, [voiceCommands, setZoom, setRotation, resetGestures, triggerHapticFeedback])

  useEffect(() => {
    if (voiceCommands) {
      const cleanup = enableVoiceCommands()
      return cleanup
    }
  }, [voiceCommands, enableVoiceCommands])

  const gestureData = useMemo(() => ({
    isDragging: gestureState.current.isDragging,
    isPinching: gestureState.current.isPinching,
    isRotating: gestureState.current.isRotating,
    zoom: gestureState.current.zoom,
    rotation: gestureState.current.rotation,
    pan: gestureState.current.pan,
    velocity: gestureState.current.velocity,
    gestureCount: gestureState.current.gestureCount,
    isActive: isGestureActive.current,
    enabled
  }), [enabled])

  return {
    ...gestureData,
    bind: gestureBind,
    dragBind,
    pinchBind,
    wheelBind,
    resetGestures,
    setZoom,
    setRotation,
    setPan,
    triggerHapticFeedback
  }
}

export function useToolGestures(toolRef: React.RefObject<any>) {
  const gestures = useGestures({
    pinchToZoom: true,
    rotate: true,
    pan: false,
    hapticFeedback: true
  })

  const rotateToolX = useCallback((angle: number) => {
    if (toolRef.current) {
      toolRef.current.rotation.x += angle
      gestures.triggerHapticFeedback(0.1)
    }
  }, [toolRef, gestures])

  const rotateToolY = useCallback((angle: number) => {
    if (toolRef.current) {
      toolRef.current.rotation.y += angle
      gestures.triggerHapticFeedback(0.1)
    }
  }, [toolRef, gestures])

  const rotateToolZ = useCallback((angle: number) => {
    if (toolRef.current) {
      toolRef.current.rotation.z += angle
      gestures.triggerHapticFeedback(0.1)
    }
  }, [toolRef, gestures])

  return {
    ...gestures,
    rotateToolX,
    rotateToolY,
    rotateToolZ
  }
}

export function useMultiTouchGestures() {
  const touchPoints = useRef<Map<number, Vector2>>(new Map())
  const gestureType = useRef<'none' | 'pan' | 'pinch' | 'rotate'>('none')

  const handleTouchStart = useCallback((event: TouchEvent) => {
    Array.from(event.touches).forEach(touch => {
      touchPoints.current.set(touch.identifier, new Vector2(touch.clientX, touch.clientY))
    })

    if (event.touches.length === 1) {
      gestureType.current = 'pan'
    } else if (event.touches.length === 2) {
      gestureType.current = 'pinch'
    }
  }, [])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    event.preventDefault()
    
    Array.from(event.touches).forEach(touch => {
      const currentPos = new Vector2(touch.clientX, touch.clientY)
      const previousPos = touchPoints.current.get(touch.identifier)
      
      if (previousPos) {
        const delta = currentPos.clone().sub(previousPos)
        touchPoints.current.set(touch.identifier, currentPos)
      }
    })
  }, [])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    Array.from(event.changedTouches).forEach(touch => {
      touchPoints.current.delete(touch.identifier)
    })

    if (event.touches.length === 0) {
      gestureType.current = 'none'
    }
  }, [])

  useEffect(() => {
    const element = document.body
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    touchPoints: touchPoints.current,
    gestureType: gestureType.current,
    touchCount: touchPoints.current.size
  }
}

export default useGestures
