  
import React, { useRef, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector2, Vector3, Raycaster, Object3D } from 'three'
import { useGestures, useMultiTouchGestures } from '@/hooks/useGestures'
import { useAnimation } from '@/hooks/useAnimation'
import { usePerformance } from '@/hooks/usePerformance'
import { GESTURE_CONFIG } from '@/utils/constants'

interface GestureControllerProps {
  enabled?: boolean
  enablePinchZoom?: boolean
  enableRotation?: boolean
  enablePanning?: boolean
  enableHapticFeedback?: boolean
  enableVoiceCommands?: boolean
  onToolSelect?: (toolType: string, toolObject: Object3D) => void
  onGestureStart?: (gestureType: string) => void
  onGestureEnd?: (gestureType: string) => void
}

interface InteractionState {
  hoveredTool: Object3D | null
  selectedTool: Object3D | null
  isInteracting: boolean
  lastInteractionTime: number
  gestureHistory: Array<{
    type: string
    timestamp: number
    data: any
  }>
}

export function GestureController({
  enabled = true,
  enablePinchZoom = true,
  enableRotation = true,
  enablePanning = true,
  enableHapticFeedback = true,
  enableVoiceCommands = false,
  onToolSelect,
  onGestureStart,
  onGestureEnd
}: GestureControllerProps) {
  const { camera, scene, gl, size } = useThree()
  const { animationTime } = useAnimation()
  const { quality, metrics } = usePerformance()

  const interactionState = useRef<InteractionState>({
    hoveredTool: null,
    selectedTool: null,
    isInteracting: false,
    lastInteractionTime: 0,
    gestureHistory: []
  })

  const raycaster = useRef<Raycaster>(new Raycaster())
  const mouse = useRef<Vector2>(new Vector2())
  const touchPoints = useRef<Map<number, Vector2>>(new Map())
  const gestureStartTime = useRef<number>(0)
  const lastTapTime = useRef<number>(0)
  const tapCount = useRef<number>(0)

  const gestures = useGestures({
    enabled,
    pinchToZoom: enablePinchZoom,
    rotate: enableRotation,
    pan: enablePanning,
    hapticFeedback: enableHapticFeedback,
    voiceCommands: enableVoiceCommands
  })

  const multiTouch = useMultiTouchGestures()

  const getToolObjects = useCallback((): Object3D[] => {
    const tools: Object3D[] = []
    scene.traverse((object) => {
      if (object.userData.type === 'construction-tool') {
        tools.push(object)
      }
    })
    return tools
  }, [scene])

  const updateMousePosition = useCallback((event: MouseEvent | Touch) => {
    const rect = gl.domElement.getBoundingClientRect()
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }, [gl])

  const performRaycast = useCallback((): Object3D | null => {
    raycaster.current.setFromCamera(mouse.current, camera)
    const tools = getToolObjects()
    const intersects = raycaster.current.intersectObjects(tools, true)
    
    return intersects.length > 0 ? intersects[0].object : null
  }, [camera, getToolObjects])

  const handleToolHover = useCallback((tool: Object3D | null) => {
    const previousHovered = interactionState.current.hoveredTool
    
    if (previousHovered !== tool) {
      if (previousHovered) {
        previousHovered.userData.isHovered = false
        if (previousHovered.scale) {
          previousHovered.scale.multiplyScalar(1 / 1.05)
        }
      }
      
      if (tool) {
        tool.userData.isHovered = true
        if (tool.scale) {
          tool.scale.multiplyScalar(1.05)
        }
        
        if (enableHapticFeedback) {
          gestures.triggerHapticFeedback(0.1)
        }
      }
      
      interactionState.current.hoveredTool = tool
    }
  }, [enableHapticFeedback, gestures])

  const handleToolSelection = useCallback((tool: Object3D) => {
    const state = interactionState.current
    
    if (state.selectedTool) {
      state.selectedTool.userData.isSelected = false
      if (state.selectedTool.scale) {
        state.selectedTool.scale.multiplyScalar(1 / 1.1)
      }
    }
    
    tool.userData.isSelected = true
    if (tool.scale) {
      tool.scale.multiplyScalar(1.1)
    }
    
    state.selectedTool = tool
    state.lastInteractionTime = animationTime
    
    if (enableHapticFeedback) {
      gestures.triggerHapticFeedback(0.3)
    }
    
    if (onToolSelect) {
      onToolSelect(tool.userData.category || 'general', tool)
    }
  }, [animationTime, enableHapticFeedback, gestures, onToolSelect])

  const handleSingleTap = useCallback((event: MouseEvent | Touch) => {
    updateMousePosition(event)
    const intersectedTool = performRaycast()
    
    if (intersectedTool) {
      handleToolSelection(intersectedTool)
    }
  }, [updateMousePosition, performRaycast, handleToolSelection])

  const handleDoubleTap = useCallback((event: MouseEvent | Touch) => {
    updateMousePosition(event)
    const intersectedTool = performRaycast()
    
    if (intersectedTool) {
      gestures.resetGestures()
      
      const targetPosition = intersectedTool.position.clone()
      targetPosition.z += 2
      
      if (enableHapticFeedback) {
        gestures.triggerHapticFeedback(0.5)
      }
    }
  }, [updateMousePosition, performRaycast, gestures, enableHapticFeedback])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return
    
    updateMousePosition(event)
    const intersectedTool = performRaycast()
    handleToolHover(intersectedTool)
  }, [enabled, updateMousePosition, performRaycast, handleToolHover])

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!enabled) return
    
    const currentTime = performance.now()
    const timeSinceLastTap = currentTime - lastTapTime.current
    
    if (timeSinceLastTap < 300) {
      tapCount.current++
    } else {
      tapCount.current = 1
    }
    
    lastTapTime.current = currentTime
    gestureStartTime.current = currentTime
    interactionState.current.isInteracting = true
    
    if (onGestureStart) {
      onGestureStart('mouse-down')
    }
  }, [enabled, onGestureStart])

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!enabled) return
    
    const currentTime = performance.now()
    const interactionDuration = currentTime - gestureStartTime.current
    
    if (interactionDuration < 200) {
      if (tapCount.current === 1) {
        setTimeout(() => {
          if (tapCount.current === 1) {
            handleSingleTap(event)
          }
        }, 300)
      } else if (tapCount.current === 2) {
        handleDoubleTap(event)
        tapCount.current = 0
      }
    }
    
    interactionState.current.isInteracting = false
    
    if (onGestureEnd) {
      onGestureEnd('mouse-up')
    }
  }, [enabled, handleSingleTap, handleDoubleTap, onGestureEnd])

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled) return
    
    event.preventDefault()
    
    Array.from(event.touches).forEach(touch => {
      touchPoints.current.set(touch.identifier, new Vector2(touch.clientX, touch.clientY))
    })
    
    gestureStartTime.current = performance.now()
    interactionState.current.isInteracting = true
    
    if (event.touches.length === 1) {
      updateMousePosition(event.touches[0])
    }
    
    if (onGestureStart) {
      onGestureStart(`touch-${event.touches.length}`)
    }
  }, [enabled, updateMousePosition, onGestureStart])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enabled) return
    
    event.preventDefault()
    
    if (event.touches.length === 1) {
      updateMousePosition(event.touches[0])
      const intersectedTool = performRaycast()
      handleToolHover(intersectedTool)
    }
    
    Array.from(event.touches).forEach(touch => {
      touchPoints.current.set(touch.identifier, new Vector2(touch.clientX, touch.clientY))
    })
  }, [enabled, updateMousePosition, performRaycast, handleToolHover])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!enabled) return
    
    event.preventDefault()
    
    const currentTime = performance.now()
    const interactionDuration = currentTime - gestureStartTime.current
    
    if (event.changedTouches.length === 1 && interactionDuration < 200) {
      const touch = event.changedTouches[0]
      handleSingleTap(touch)
    }
    
    Array.from(event.changedTouches).forEach(touch => {
      touchPoints.current.delete(touch.identifier)
    })
    
    if (event.touches.length === 0) {
      interactionState.current.isInteracting = false
    }
    
    if (onGestureEnd) {
      onGestureEnd(`touch-end`)
    }
  }, [enabled, handleSingleTap, onGestureEnd])

  const handleWheel = useCallback((event: WheelEvent) => {
    if (!enabled || !enablePinchZoom) return
    
    event.preventDefault()
    
    const zoomDelta = event.deltaY * -0.001
    const newZoom = Math.max(0.5, Math.min(3.0, gestures.zoom + zoomDelta))
    gestures.setZoom(newZoom)
    
    if (enableHapticFeedback && Math.abs(zoomDelta) > 0.01) {
      gestures.triggerHapticFeedback(0.05)
    }
  }, [enabled, enablePinchZoom, enableHapticFeedback, gestures])

  const addGestureToHistory = useCallback((type: string, data: any) => {
    const state = interactionState.current
    state.gestureHistory.push({
      type,
      timestamp: performance.now(),
      data
    })
    
    if (state.gestureHistory.length > 50) {
      state.gestureHistory.shift()
    }
  }, [])

  const getGestureAnalytics = useCallback(() => {
    const state = interactionState.current
    const recentGestures = state.gestureHistory.filter(
      gesture => performance.now() - gesture.timestamp < 10000
    )
    
    const gestureTypes = recentGestures.reduce((acc, gesture) => {
      acc[gesture.type] = (acc[gesture.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalGestures: recentGestures.length,
      gestureTypes,
      averageInteractionTime: state.lastInteractionTime > 0 ? 
        (performance.now() - state.lastInteractionTime) / 1000 : 0,
      isCurrentlyInteracting: state.isInteracting
    }
  }, [])

  useFrame((state, deltaTime) => {
    if (!enabled) return
    
    if (quality === 'low' && metrics.fps < 30) {
      return
    }
    
    const state_ref = interactionState.current
    
    if (state_ref.hoveredTool && !state_ref.isInteracting) {
      const hoverTime = animationTime - state_ref.lastInteractionTime
      if (hoverTime > 5000) {
        handleToolHover(null)
      }
    }
    
    if (state_ref.selectedTool) {
      const selectedTime = animationTime - state_ref.lastInteractionTime
      if (selectedTime > 10000 && !state_ref.isInteracting) {
        state_ref.selectedTool.userData.isSelected = false
        if (state_ref.selectedTool.scale) {
          state_ref.selectedTool.scale.multiplyScalar(1 / 1.1)
        }
        state_ref.selectedTool = null
      }
    }
  })

  React.useEffect(() => {
    if (!enabled) return
    
    const canvas = gl.domElement
    
    canvas.addEventListener('mousemove', handleMouseMove, { passive: true })
    canvas.addEventListener('mousedown', handleMouseDown, { passive: true })
    canvas.addEventListener('mouseup', handleMouseUp, { passive: true })
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [enabled, handleMouseMove, handleMouseDown, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel, gl])

  const gestureData = useMemo(() => ({
    ...gestures,
    multiTouch,
    interactionState: interactionState.current,
    analytics: getGestureAnalytics(),
    addGestureToHistory
  }), [gestures, multiTouch, getGestureAnalytics, addGestureToHistory])

  return (
    <primitive object={gestureData} />
  )
}

export function ToolInteractionController({ 
  onToolInteraction 
}: { 
  onToolInteraction?: (tool: Object3D, interactionType: string) => void 
}) {
  return (
    <GestureController
      enabled={true}
      enablePinchZoom={true}
      enableRotation={true}
      enablePanning={false}
      enableHapticFeedback={true}
      onToolSelect={(toolType, toolObject) => {
        if (onToolInteraction) {
          onToolInteraction(toolObject, 'select')
        }
      }}
    />
  )
}

export function MinimalGestureController() {
  return (
    <GestureController
      enabled={true}
      enablePinchZoom={true}
      enableRotation={false}
      enablePanning={false}
      enableHapticFeedback={false}
      enableVoiceCommands={false}
    />
  )
}

export function FullGestureController() {
  return (
    <GestureController
      enabled={true}
      enablePinchZoom={true}
      enableRotation={true}
      enablePanning={true}
      enableHapticFeedback={true}
      enableVoiceCommands={true}
    />
  )
}

export default GestureController
