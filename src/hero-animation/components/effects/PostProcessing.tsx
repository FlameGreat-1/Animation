import React, { useRef, useMemo, useCallback } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { 
  EffectComposer, 
  Bloom, 
  DepthOfField, 
  Noise, 
  Vignette,
  ChromaticAberration,
  ColorAverage,
  BrightnessContrast,
  HueSaturation,
  ToneMapping,
  SMAA,
  FXAA
} from '@react-three/postprocessing'
import { 
  BlendFunction, 
  KernelSize, 
  SMAAPreset,
  ToneMappingMode
} from 'postprocessing'
import { Vector2 } from 'three'
import { POST_PROCESSING_CONFIG, COLORS } from '../../utils/constants'
import { useAnimation } from '../../hooks/useAnimation'
import { usePerformance } from '../../hooks/usePerformance'

interface PostProcessingProps {
  enabled?: boolean
  bloomEnabled?: boolean
  depthOfFieldEnabled?: boolean
  filmGrainEnabled?: boolean
  colorGradingEnabled?: boolean
  motionBlurEnabled?: boolean
  volumetricFogEnabled?: boolean
  antialiasingEnabled?: boolean
}

export function PostProcessing({
  enabled = true,
  bloomEnabled = true,
  depthOfFieldEnabled = true,
  filmGrainEnabled = true,
  colorGradingEnabled = true,
  motionBlurEnabled = false,
  volumetricFogEnabled = true,
  antialiasingEnabled = true
}: PostProcessingProps) {
  const { camera, scene, gl } = useThree()
  const { animationTime } = useAnimation()
  const { quality, metrics } = usePerformance()

  const composerRef = useRef<any>(null)
  const bloomRef = useRef<any>(null)
  const dofRef = useRef<any>(null)
  const noiseRef = useRef<any>(null)
  const vignetteRef = useRef<any>(null)

  const effectsConfig = useMemo(() => {
    const config = POST_PROCESSING_CONFIG
    
    const qualityMultipliers = {
      low: { bloom: 0.3, dof: 0.5, noise: 0.5, samples: 8 },
      medium: { bloom: 0.6, dof: 0.7, noise: 0.7, samples: 16 },
      high: { bloom: 1.0, dof: 1.0, noise: 1.0, samples: 32 },
      ultra: { bloom: 1.2, dof: 1.2, noise: 1.2, samples: 64 }
    }
    
    const multiplier = qualityMultipliers[quality] || qualityMultipliers.high
    
    return {
      bloom: {
        intensity: config.BLOOM.INTENSITY * multiplier.bloom,
        threshold: config.BLOOM.THRESHOLD,
        smoothWidth: config.BLOOM.SMOOTH_WIDTH,
        radius: config.BLOOM.RADIUS,
        kernelSize: quality === 'low' ? KernelSize.SMALL : 
                   quality === 'medium' ? KernelSize.MEDIUM : KernelSize.LARGE
      },
      depthOfField: {
        focusDistance: config.DEPTH_OF_FIELD.FOCUS_DISTANCE,
        focalLength: config.DEPTH_OF_FIELD.FOCAL_LENGTH,
        bokehScale: config.DEPTH_OF_FIELD.BOKEH_SCALE * multiplier.dof,
        height: config.DEPTH_OF_FIELD.HEIGHT
      },
      filmGrain: {
        intensity: config.FILM_GRAIN.INTENSITY * multiplier.noise,
        size: config.FILM_GRAIN.SIZE,
        animated: config.FILM_GRAIN.ANIMATED
      },
      colorGrading: {
        exposure: config.COLOR_GRADING.EXPOSURE,
        brightness: config.COLOR_GRADING.BRIGHTNESS,
        contrast: config.COLOR_GRADING.CONTRAST,
        saturation: config.COLOR_GRADING.SATURATION
      },
      motionBlur: {
        intensity: config.MOTION_BLUR.INTENSITY,
        samples: Math.min(config.MOTION_BLUR.SAMPLES, multiplier.samples)
      },
      volumetricFog: {
        density: config.VOLUMETRIC_FOG.DENSITY,
        color: config.VOLUMETRIC_FOG.COLOR,
        near: config.VOLUMETRIC_FOG.NEAR,
        far: config.VOLUMETRIC_FOG.FAR
      }
    }
  }, [quality])

  const updateDynamicEffects = useCallback((time: number) => {
    if (bloomRef.current) {
      const bloomVariation = Math.sin(time * 0.001) * 0.1
      bloomRef.current.intensity = effectsConfig.bloom.intensity * (1 + bloomVariation)
    }

    if (dofRef.current) {
      const focusVariation = Math.sin(time * 0.0008) * 0.5
      dofRef.current.target = effectsConfig.depthOfField.focusDistance + focusVariation
    }

    if (noiseRef.current && effectsConfig.filmGrain.animated) {
      noiseRef.current.premultiply = Math.random() > 0.5
    }

    if (vignetteRef.current) {
      const vignetteVariation = Math.sin(time * 0.0005) * 0.05
      vignetteRef.current.darkness = 0.5 + vignetteVariation
    }
  }, [effectsConfig])

  const adaptiveQuality = useMemo(() => {
    if (metrics.fps < 30) {
      return {
        bloomEnabled: false,
        depthOfFieldEnabled: false,
        filmGrainEnabled: false,
        antialiasingEnabled: false
      }
    }
    
    if (metrics.fps < 45) {
      return {
        bloomEnabled: true,
        depthOfFieldEnabled: false,
        filmGrainEnabled: quality !== 'low',
        antialiasingEnabled: quality !== 'low'
      }
    }
    
    return {
      bloomEnabled,
      depthOfFieldEnabled,
      filmGrainEnabled,
      antialiasingEnabled
    }
  }, [metrics.fps, quality, bloomEnabled, depthOfFieldEnabled, filmGrainEnabled, antialiasingEnabled])

  useFrame((state, deltaTime) => {
    if (!enabled) return
    updateDynamicEffects(animationTime)
  })

  if (!enabled) return null

  return (
    <EffectComposer
      ref={composerRef}
      camera={camera}
      scene={scene}
      gl={gl}
      multisampling={quality === 'ultra' ? 8 : quality === 'high' ? 4 : 0}
    >
      {adaptiveQuality.antialiasingEnabled && (
        quality === 'high' || quality === 'ultra' ? (
          <SMAA preset={SMAAPreset.HIGH} />
        ) : (
          <FXAA />
        )
      )}

      {adaptiveQuality.bloomEnabled && (
        <Bloom
          ref={bloomRef}
          intensity={effectsConfig.bloom.intensity}
          threshold={effectsConfig.bloom.threshold}
          smoothWidth={effectsConfig.bloom.smoothWidth}
          radius={effectsConfig.bloom.radius}
          kernelSize={effectsConfig.bloom.kernelSize}
          blendFunction={BlendFunction.SCREEN}
        />
      )}

      {adaptiveQuality.depthOfFieldEnabled && (
        <DepthOfField
          ref={dofRef}
          target={[0, 0, effectsConfig.depthOfField.focusDistance]}
          focalLength={effectsConfig.depthOfField.focalLength}
          bokehScale={effectsConfig.depthOfField.bokehScale}
          height={effectsConfig.depthOfField.height}
        />
      )}

      {colorGradingEnabled && (
        <>
          <BrightnessContrast
            brightness={effectsConfig.colorGrading.brightness}
            contrast={effectsConfig.colorGrading.contrast}
          />
          
          <HueSaturation
            saturation={effectsConfig.colorGrading.saturation}
          />
          
          <ToneMapping
            mode={ToneMappingMode.ACES_FILMIC}
            resolution={256}
            whitePoint={4.0}
            middleGrey={0.6}
            minLuminance={0.01}
            adaptation={1.0}
          />
        </>
      )}

      {adaptiveQuality.filmGrainEnabled && (
        <Noise
          ref={noiseRef}
          premultiply={false}
          blendFunction={BlendFunction.OVERLAY}
          opacity={effectsConfig.filmGrain.intensity}
        />
      )}

      {volumetricFogEnabled && quality !== 'low' && (
        <ColorAverage
          blendFunction={BlendFunction.MULTIPLY}
          color={effectsConfig.volumetricFog.color}
          opacity={effectsConfig.volumetricFog.density}
        />
      )}

      <Vignette
        ref={vignetteRef}
        offset={0.3}
        darkness={0.5}
        blendFunction={BlendFunction.MULTIPLY}
      />

      <ChromaticAberration
        offset={new Vector2(0.001, 0.001)}
        blendFunction={BlendFunction.NORMAL}
        opacity={0.3}
      />
    </EffectComposer>
  )
}

export function ConstructionPostProcessing({ 
  category = 'general',
  ...props 
}: PostProcessingProps & { 
  category?: 'electrical' | 'plumbing' | 'carpentry' | 'painting' | 'roofing' | 'hvac' | 'landscaping' | 'cleaning' | 'handyman' | 'general'
}) {
  const categoryEffects = {
    electrical: { bloom: 1.3, warmth: 1.2, contrast: 1.1 },
    plumbing: { bloom: 0.8, warmth: 0.7, contrast: 0.9 },
    carpentry: { bloom: 1.0, warmth: 1.4, contrast: 1.2 },
    painting: { bloom: 1.2, warmth: 1.1, contrast: 1.3 },
    roofing: { bloom: 0.7, warmth: 0.8, contrast: 0.8 },
    hvac: { bloom: 0.9, warmth: 0.6, contrast: 1.0 },
    landscaping: { bloom: 1.1, warmth: 1.0, contrast: 1.1 },
    cleaning: { bloom: 1.2, warmth: 0.9, contrast: 1.0 },
    handyman: { bloom: 1.0, warmth: 1.0, contrast: 1.0 },
    general: { bloom: 1.0, warmth: 1.0, contrast: 1.0 }
  }

  return <PostProcessing {...props} />
}

export function AdaptivePostProcessing(props: PostProcessingProps) {
  const { quality, metrics } = usePerformance()
  
  const adaptiveProps = useMemo(() => {
    if (metrics.fps < 25) {
      return {
        ...props,
        enabled: false
      }
    }
    
    if (metrics.fps < 35) {
      return {
        ...props,
        bloomEnabled: false,
        depthOfFieldEnabled: false,
        filmGrainEnabled: false,
        motionBlurEnabled: false,
        volumetricFogEnabled: false
      }
    }
    
    if (metrics.fps < 50) {
      return {
        ...props,
        bloomEnabled: true,
        depthOfFieldEnabled: false,
        filmGrainEnabled: quality !== 'low',
        motionBlurEnabled: false,
        volumetricFogEnabled: quality === 'high' || quality === 'ultra'
      }
    }
    
    return props
  }, [props, quality, metrics])
  
  return <PostProcessing {...adaptiveProps} />
}

export function MinimalPostProcessing() {
  return (
    <PostProcessing
      enabled={true}
      bloomEnabled={true}
      depthOfFieldEnabled={false}
      filmGrainEnabled={true}
      colorGradingEnabled={true}
      motionBlurEnabled={false}
      volumetricFogEnabled={false}
      antialiasingEnabled={true}
    />
  )
}

export function ProfessionalPostProcessing() {
  return (
    <PostProcessing
      enabled={true}
      bloomEnabled={true}
      depthOfFieldEnabled={true}
      filmGrainEnabled={true}
      colorGradingEnabled={true}
      motionBlurEnabled={true}
      volumetricFogEnabled={true}
      antialiasingEnabled={true}
    />
  )
}

export default PostProcessing
