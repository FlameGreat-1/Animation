import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Vector3 } from 'three'
import { SCENE_CONFIG, COLORS, VIEWPORT, CONSTRUCTION_MESSAGING } from '@/utils/constants'
import { HammerModel } from './models/HammerModel'
import { DrillModel } from './models/DrillModel'
import { LevelModel } from './models/LevelModel'
import { MeasuringTapeModel } from './models/MeasuringTapeModel'
import { ParticleSystem, ConstructionDustSystem, DrillSparksSystem } from './effects/ParticleSystem'
import { LightingSystem } from './effects/LightingSystem'
import { PostProcessing } from './effects/PostProcessing'
import { CameraController } from './controls/CameraController'
import { GestureController } from './controls/GestureController'
import { useAnimation } from '@/hooks/useAnimation'
import { usePerformance } from '@/hooks/usePerformance'
import { useGestures } from '@/hooks/useGestures'

interface HeroToolsAnimationProps {
  width?: number
  height?: number
  category?: 'electrical' | 'plumbing' | 'carpentry' | 'painting' | 'roofing' | 'hvac' | 'landscaping' | 'cleaning' | 'handyman' | 'general'
  autoPlay?: boolean
  enableInteraction?: boolean
  enableParticles?: boolean
  enablePostProcessing?: boolean
  performanceMode?: 'auto' | 'low' | 'medium' | 'high' | 'ultra'
  onToolSelect?: (toolType: string) => void
}

function LoadingFallback() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${COLORS.INDUSTRIAL_BLUE}, ${COLORS.STEEL_GRAY})`,
      color: COLORS.CONSTRUCTION_ORANGE,
      fontSize: '18px',
      fontWeight: 'bold'
    }}>
      Loading Professional Tools...
    </div>
  )
}

function ToolsScene({ 
  category, 
  enableParticles, 
  onToolSelect 
}: { 
  category: string
  enableParticles: boolean
  onToolSelect?: (toolType: string) => void
}) {
  const { quality } = usePerformance()
  const { animationTime } = useAnimation()

  const toolPositions = useMemo(() => [
    SCENE_CONFIG.TOOL_POSITIONS.HAMMER,
    SCENE_CONFIG.TOOL_POSITIONS.DRILL,
    SCENE_CONFIG.TOOL_POSITIONS.LEVEL,
    SCENE_CONFIG.TOOL_POSITIONS.MEASURING_TAPE
  ], [])

  const handleToolSelection = (toolType: string, toolObject: any) => {
    if (onToolSelect) {
      onToolSelect(toolType)
    }
  }

  return (
    <>
      <LightingSystem
        enabled={true}
        intensity={1.0}
        castShadows={quality !== 'low'}
        hdrEnabled={quality === 'high' || quality === 'ultra'}
        dynamicLighting={quality !== 'low'}
      />

      <HammerModel
        position={SCENE_CONFIG.TOOL_POSITIONS.HAMMER}
        scale={SCENE_CONFIG.TOOL_SCALES.HAMMER}
        staggerIndex={0}
        performanceLevel={quality}
      />

      <DrillModel
        position={SCENE_CONFIG.TOOL_POSITIONS.DRILL}
        scale={SCENE_CONFIG.TOOL_SCALES.DRILL}
        staggerIndex={1}
        performanceLevel={quality}
      />

      <LevelModel
        position={SCENE_CONFIG.TOOL_POSITIONS.LEVEL}
        scale={SCENE_CONFIG.TOOL_SCALES.LEVEL}
        staggerIndex={2}
        performanceLevel={quality}
      />

      <MeasuringTapeModel
        position={SCENE_CONFIG.TOOL_POSITIONS.MEASURING_TAPE}
        scale={SCENE_CONFIG.TOOL_SCALES.MEASURING_TAPE}
        staggerIndex={3}
        performanceLevel={quality}
      />

      {enableParticles && (
        <>
          <ConstructionDustSystem
            toolPositions={toolPositions}
            enabled={quality !== 'low'}
          />
          
          <DrillSparksSystem
            position={SCENE_CONFIG.TOOL_POSITIONS.DRILL}
            enabled={quality === 'high' || quality === 'ultra'}
            intensity={0.8}
          />
        </>
      )}

      <CameraController
        enabled={true}
        autoRotate={true}
        followTarget={true}
        smoothTransitions={true}
        dynamicMovement={quality !== 'low'}
      />

      <GestureController
        enabled={true}
        enablePinchZoom={true}
        enableRotation={true}
        enablePanning={true}
        enableHapticFeedback={true}
        enableVoiceCommands={quality === 'ultra'}
        onToolSelect={handleToolSelection}
      />
    </>
  )
}

export function HeroToolsAnimation({
  width = VIEWPORT.DEFAULT_WIDTH,
  height = VIEWPORT.DEFAULT_HEIGHT,
  category = 'general',
  autoPlay = true,
  enableInteraction = true,
  enableParticles = true,
  enablePostProcessing = true,
  performanceMode = 'auto',
  onToolSelect
}: HeroToolsAnimationProps) {
  const { quality, optimizeForDevice } = usePerformance({
    targetFPS: 60,
    adaptiveQuality: performanceMode === 'auto',
    enableProfiling: true
  })

  const canvasConfig = useMemo(() => ({
    camera: {
      position: SCENE_CONFIG.CAMERA.POSITION.toArray(),
      fov: SCENE_CONFIG.CAMERA.FOV,
      near: SCENE_CONFIG.CAMERA.NEAR,
      far: SCENE_CONFIG.CAMERA.FAR
    },
    gl: {
      antialias: quality !== 'low',
      alpha: true,
      powerPreference: 'high-performance' as const,
      stencil: false,
      depth: true,
      preserveDrawingBuffer: false,
      premultipliedAlpha: true,
      failIfMajorPerformanceCaveat: false
    },
    dpr: quality === 'low' ? 1 : Math.min(2, window.devicePixelRatio || 1),
    shadows: quality !== 'low',
    flat: false,
    linear: true,
    frameloop: autoPlay ? 'always' : 'demand'
  }), [quality, autoPlay])

  const containerStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    maxWidth: `${width}px`,
    maxHeight: `${height}px`,
    aspectRatio: `${VIEWPORT.ASPECT_RATIO}`,
    background: `linear-gradient(135deg, ${COLORS.INDUSTRIAL_BLUE}15, ${COLORS.STEEL_GRAY}10)`,
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative' as const
  }), [width, height])

  const overlayStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: '20px',
    left: '20px',
    color: COLORS.CONSTRUCTION_ORANGE,
    fontSize: '14px',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    zIndex: 10,
    pointerEvents: 'none' as const
  }), [])

  React.useEffect(() => {
    if (performanceMode === 'auto') {
      optimizeForDevice()
    }
  }, [performanceMode, optimizeForDevice])

  return (
    <div style={containerStyle}>
      <Canvas {...canvasConfig}>
        <Suspense fallback={null}>
          <ToolsScene
            category={category}
            enableParticles={enableParticles}
            onToolSelect={onToolSelect}
          />
          
          {enablePostProcessing && (
            <PostProcessing
              enabled={quality !== 'low'}
              bloomEnabled={true}
              depthOfFieldEnabled={quality === 'high' || quality === 'ultra'}
              filmGrainEnabled={quality !== 'low'}
              colorGradingEnabled={true}
              motionBlurEnabled={quality === 'ultra'}
              volumetricFogEnabled={quality === 'high' || quality === 'ultra'}
              antialiasingEnabled={quality !== 'low'}
            />
          )}
        </Suspense>
      </Canvas>
      
      <div style={overlayStyle}>
        {CONSTRUCTION_MESSAGING.TOOL_DESCRIPTIONS.HAMMER}
      </div>
    </div>
  )
}

export function ResponsiveHeroToolsAnimation(props: HeroToolsAnimationProps) {
  const [dimensions, setDimensions] = React.useState({
    width: VIEWPORT.DEFAULT_WIDTH,
    height: VIEWPORT.DEFAULT_HEIGHT
  })

  React.useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('[data-hero-animation]')
      if (container) {
        const rect = container.getBoundingClientRect()
        setDimensions({
          width: rect.width,
          height: rect.height
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  return (
    <div data-hero-animation style={{ width: '100%', height: '100%' }}>
      <HeroToolsAnimation
        {...props}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  )
}

export function ConstructionShowcase() {
  const categories = [
    'electrical', 'plumbing', 'carpentry', 'painting', 
    'roofing', 'hvac', 'landscaping', 'cleaning', 
    'handyman', 'general'
  ] as const

  const [currentCategory, setCurrentCategory] = React.useState<typeof categories[number]>('general')
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % categories.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [categories.length])

  React.useEffect(() => {
    setCurrentCategory(categories[currentIndex])
  }, [currentIndex, categories])

  return (
    <HeroToolsAnimation
      category={currentCategory}
      autoPlay={true}
      enableInteraction={true}
      enableParticles={true}
      enablePostProcessing={true}
      performanceMode="auto"
    />
  )
}

export function InteractiveToolDemo({ onToolSelect }: { onToolSelect?: (toolType: string) => void }) {
  return (
    <HeroToolsAnimation
      category="general"
      autoPlay={true}
      enableInteraction={true}
      enableParticles={true}
      enablePostProcessing={true}
      performanceMode="high"
      onToolSelect={onToolSelect}
    />
  )
}

export function MinimalToolsAnimation() {
  return (
    <HeroToolsAnimation
      category="general"
      autoPlay={true}
      enableInteraction={false}
      enableParticles={false}
      enablePostProcessing={false}
      performanceMode="low"
    />
  )
}

export default HeroToolsAnimation
