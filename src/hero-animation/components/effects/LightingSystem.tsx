import React, { useRef, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  DirectionalLight, 
  PointLight, 
  SpotLight, 
  AmbientLight,
  HemisphereLight,
  RectAreaLight,
  Vector3, 
  Color,
  PCFSoftShadowMap,
  VSMShadowMap,
  PMREMGenerator
} from 'three'
import { LIGHTING_CONFIG, COLORS } from '@/utils/constants'
import { createHDREnvironmentTexture } from '@/utils/textureGenerators'
import { useAnimation } from '@/hooks/useAnimation'
import { usePerformance } from '@/hooks/usePerformance'

interface LightingSystemProps {
  enabled?: boolean
  intensity?: number
  castShadows?: boolean
  hdrEnabled?: boolean
  dynamicLighting?: boolean
}

export function LightingSystem({
  enabled = true,
  intensity = 1.0,
  castShadows = true,
  hdrEnabled = true,
  dynamicLighting = true
}: LightingSystemProps) {
  const { scene, gl } = useThree()
  const { animationTime } = useAnimation()
  const { quality } = usePerformance()

  const ambientLightRef = useRef<AmbientLight>(null)
  const directionalLightRef = useRef<DirectionalLight>(null)
  const keyLightRef = useRef<DirectionalLight>(null)
  const fillLightRef = useRef<DirectionalLight>(null)
  const rimLightRef = useRef<DirectionalLight>(null)
  const constructionLightRef = useRef<PointLight>(null)
  const accentLightRef = useRef<SpotLight>(null)

  const shadowMapSize = useMemo(() => {
    switch (quality) {
      case 'low': return 512
      case 'medium': return 1024
      case 'high': return 2048
      case 'ultra': return 4096
      default: return 1024
    }
  }, [quality])

  const hdrEnvironment = useMemo(() => {
    if (!hdrEnabled) return null
    
    const hdrTexture = createHDREnvironmentTexture(1024)
    const pmremGenerator = new PMREMGenerator(gl)
    const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture
    pmremGenerator.dispose()
    
    return envMap
  }, [hdrEnabled, gl])

  const lightingConfig = useMemo(() => ({
    ambient: {
      color: LIGHTING_CONFIG.AMBIENT.COLOR,
      intensity: LIGHTING_CONFIG.AMBIENT.INTENSITY * intensity
    },
    key: {
      color: new Color('#FFFFFF'),
      intensity: 1.2 * intensity,
      position: new Vector3(5, 8, 5),
      target: new Vector3(0, 0, 0),
      castShadow: castShadows
    },
    fill: {
      color: new Color('#E6F3FF'),
      intensity: 0.4 * intensity,
      position: new Vector3(-3, 4, 3),
      target: new Vector3(0, 0, 0),
      castShadow: false
    },
    rim: {
      color: COLORS.THREE_COLORS.CONSTRUCTION_ORANGE,
      intensity: 0.6 * intensity,
      position: new Vector3(-5, 2, -5),
      target: new Vector3(0, 0, 0),
      castShadow: false
    },
    construction: {
      color: COLORS.THREE_COLORS.INDUSTRIAL_BLUE,
      intensity: 0.8 * intensity,
      position: new Vector3(2, 3, 2),
      distance: 10,
      decay: 2
    },
    accent: {
      color: COLORS.THREE_COLORS.CONSTRUCTION_ORANGE,
      intensity: 1.0 * intensity,
      position: new Vector3(0, 6, 4),
      target: new Vector3(0, 0, 0),
      angle: Math.PI / 6,
      penumbra: 0.5,
      distance: 15,
      decay: 2,
      castShadow: castShadows
    }
  }), [intensity, castShadows])

  const setupShadows = useCallback(() => {
    if (!castShadows) return

    gl.shadowMap.enabled = true
    gl.shadowMap.type = quality === 'high' || quality === 'ultra' ? 
      VSMShadowMap : PCFSoftShadowMap
    gl.shadowMap.autoUpdate = true

    if (directionalLightRef.current) {
      const light = directionalLightRef.current
      light.shadow.mapSize.setScalar(shadowMapSize)
      light.shadow.camera.near = 0.1
      light.shadow.camera.far = 50
      light.shadow.camera.left = -10
      light.shadow.camera.right = 10
      light.shadow.camera.top = 10
      light.shadow.camera.bottom = -10
      light.shadow.bias = -0.0001
      light.shadow.normalBias = 0.02
    }

    if (accentLightRef.current) {
      const light = accentLightRef.current
      light.shadow.mapSize.setScalar(shadowMapSize)
      light.shadow.camera.near = 0.1
      light.shadow.camera.far = 20
      light.shadow.bias = -0.0001
      light.shadow.normalBias = 0.02
    }
  }, [castShadows, gl, shadowMapSize, quality])

  const updateDynamicLighting = useCallback((time: number) => {
    if (!dynamicLighting) return

    const baseIntensity = intensity
    const variation = Math.sin(time * 0.001) * 0.1

    if (constructionLightRef.current) {
      constructionLightRef.current.intensity = 
        lightingConfig.construction.intensity * (1 + variation)
    }

    if (accentLightRef.current) {
      accentLightRef.current.intensity = 
        lightingConfig.accent.intensity * (1 + variation * 0.5)
      
      const originalPos = lightingConfig.accent.position
      accentLightRef.current.position.set(
        originalPos.x + Math.sin(time * 0.0008) * 0.5,
        originalPos.y + Math.cos(time * 0.0006) * 0.3,
        originalPos.z + Math.sin(time * 0.0007) * 0.4
      )
    }

    if (keyLightRef.current) {
      const temp = 0.5 + Math.sin(time * 0.0005) * 0.1
      keyLightRef.current.color.setRGB(1, 0.95 + temp * 0.05, 0.9 + temp * 0.1)
    }
  }, [dynamicLighting, intensity, lightingConfig])

  useFrame((state, deltaTime) => {
    if (!enabled) return

    updateDynamicLighting(animationTime)

    if (hdrEnvironment && scene.environment !== hdrEnvironment) {
      scene.environment = hdrEnvironment
      scene.background = hdrEnvironment
    }
  })

  React.useEffect(() => {
    setupShadows()
  }, [setupShadows])

  if (!enabled) return null

  return (
    <group>
      <ambientLight
        ref={ambientLightRef}
        color={lightingConfig.ambient.color}
        intensity={lightingConfig.ambient.intensity}
      />

      <hemisphereLight
        color={new Color('#87CEEB')}
        groundColor={COLORS.THREE_COLORS.STEEL_GRAY}
        intensity={0.3 * intensity}
        position={[0, 10, 0]}
      />

      <directionalLight
        ref={keyLightRef}
        color={lightingConfig.key.color}
        intensity={lightingConfig.key.intensity}
        position={lightingConfig.key.position.toArray()}
        target-position={lightingConfig.key.target.toArray()}
        castShadow={lightingConfig.key.castShadow}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />

      <directionalLight
        ref={fillLightRef}
        color={lightingConfig.fill.color}
        intensity={lightingConfig.fill.intensity}
        position={lightingConfig.fill.position.toArray()}
        target-position={lightingConfig.fill.target.toArray()}
        castShadow={false}
      />

      <directionalLight
        ref={rimLightRef}
        color={lightingConfig.rim.color}
        intensity={lightingConfig.rim.intensity}
        position={lightingConfig.rim.position.toArray()}
        target-position={lightingConfig.rim.target.toArray()}
        castShadow={false}
      />

      <pointLight
        ref={constructionLightRef}
        color={lightingConfig.construction.color}
        intensity={lightingConfig.construction.intensity}
        position={lightingConfig.construction.position.toArray()}
        distance={lightingConfig.construction.distance}
        decay={lightingConfig.construction.decay}
      />

      <spotLight
        ref={accentLightRef}
        color={lightingConfig.accent.color}
        intensity={lightingConfig.accent.intensity}
        position={lightingConfig.accent.position.toArray()}
        target-position={lightingConfig.accent.target.toArray()}
        angle={lightingConfig.accent.angle}
        penumbra={lightingConfig.accent.penumbra}
        distance={lightingConfig.accent.distance}
        decay={lightingConfig.accent.decay}
        castShadow={lightingConfig.accent.castShadow}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />

      <rectAreaLight
        color={new Color('#FFFFFF')}
        intensity={0.5 * intensity}
        width={2}
        height={1}
        position={[3, 4, 2]}
        lookAt={[0, 0, 0]}
      />

      <pointLight
        color={COLORS.THREE_COLORS.CONSTRUCTION_ORANGE}
        intensity={0.3 * intensity}
        position={[-4, 1, -2]}
        distance={8}
        decay={2}
      />

      <pointLight
        color={COLORS.THREE_COLORS.CONSTRUCTION_ORANGE}
        intensity={0.3 * intensity}
        position={[4, 1, -2]}
        distance={8}
        decay={2}
      />
    </group>
  )
}

export function ConstructionLighting({ 
  category = 'general',
  ...props 
}: LightingSystemProps & { 
  category?: 'electrical' | 'plumbing' | 'carpentry' | 'painting' | 'roofing' | 'hvac' | 'landscaping' | 'cleaning' | 'handyman' | 'general'
}) {
  const categoryLighting = {
    electrical: { accentColor: new Color('#FFD700'), intensity: 1.2, warmth: 0.9 },
    plumbing: { accentColor: new Color('#4682B4'), intensity: 1.0, warmth: 0.7 },
    carpentry: { accentColor: new Color('#8B4513'), intensity: 1.1, warmth: 1.2 },
    painting: { accentColor: COLORS.THREE_COLORS.CONSTRUCTION_ORANGE, intensity: 1.3, warmth: 1.0 },
    roofing: { accentColor: new Color('#696969'), intensity: 0.9, warmth: 0.8 },
    hvac: { accentColor: new Color('#C0C0C0'), intensity: 1.0, warmth: 0.6 },
    landscaping: { accentColor: new Color('#228B22'), intensity: 1.1, warmth: 0.9 },
    cleaning: { accentColor: new Color('#87CEEB'), intensity: 1.2, warmth: 0.8 },
    handyman: { accentColor: COLORS.THREE_COLORS.STEEL_GRAY, intensity: 1.0, warmth: 1.0 },
    general: { accentColor: COLORS.THREE_COLORS.INDUSTRIAL_BLUE, intensity: 1.0, warmth: 1.0 }
  }

  const config = categoryLighting[category]

  return (
    <LightingSystem
      {...props}
      intensity={(props.intensity || 1.0) * config.intensity}
    />
  )
}

export function AdaptiveLighting(props: LightingSystemProps) {
  const { quality, metrics } = usePerformance()
  
  const adaptiveProps = useMemo(() => {
    if (metrics.fps < 30) {
      return {
        ...props,
        castShadows: false,
        hdrEnabled: false,
        dynamicLighting: false
      }
    }
    
    if (metrics.fps < 45) {
      return {
        ...props,
        castShadows: quality !== 'low',
        hdrEnabled: quality === 'high' || quality === 'ultra',
        intensity: (props.intensity || 1.0) * 0.8
      }
    }
    
    return props
  }, [props, quality, metrics])
  
  return <LightingSystem {...adaptiveProps} />
}

export default LightingSystem
