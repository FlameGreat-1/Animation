import React, { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { 
  BufferGeometry, 
  BufferAttribute, 
  Points, 
  ShaderMaterial, 
  AdditiveBlending, 
  Vector3, 
  Color,
  Texture
} from 'three'
import { PARTICLE_CONFIG, COLORS, TIMING } from '../../utils/constants'
import { createParticleTexture, createSparkTexture } from '../../utils/textureGenerators'
import { useAnimation } from '../../hooks/useAnimation'
import { usePerformance } from '../../hooks/usePerformance'

interface ParticleSystemProps {
  type?: 'dust' | 'sparks' | 'debris'
  count?: number
  position?: Vector3
  enabled?: boolean
  toolType?: 'hammer' | 'drill' | 'level' | 'measuring-tape'
  intensity?: number
}

const particleVertexShader = `
  attribute float size;
  attribute float alpha;
  attribute vec3 velocity;
  attribute float lifespan;
  attribute float age;
  
  uniform float time;
  uniform float globalAlpha;
  uniform vec3 gravity;
  uniform float buoyancy;
  
  varying float vAlpha;
  varying float vLifeProgress;
  
  void main() {
    vAlpha = alpha * globalAlpha;
    vLifeProgress = age / lifespan;
    
    vec3 pos = position;
    
    // Apply physics simulation
    float t = age * 0.001;
    pos += velocity * t;
    pos += gravity * t * t * 0.5;
    pos.y += sin(time * 0.002 + position.x) * buoyancy;
    
    // Apply floating motion
    pos.y += sin(time * 0.003 + position.x * 0.1) * 0.02;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation with distance
    float distanceAttenuation = 1.0 / (1.0 + 0.1 * length(mvPosition.xyz));
    gl_PointSize = size * distanceAttenuation * (1.0 - vLifeProgress * 0.5);
  }
`

const particleFragmentShader = `
  uniform sampler2D particleTexture;
  uniform vec3 color;
  uniform float time;
  
  varying float vAlpha;
  varying float vLifeProgress;
  
  void main() {
    vec2 uv = gl_PointCoord;
    vec4 texColor = texture2D(particleTexture, uv);
    
    // Fade out over lifetime
    float alpha = vAlpha * texColor.a * (1.0 - vLifeProgress);
    
    // Add shimmer effect for construction dust
    float shimmer = sin(time * 0.01 + gl_FragCoord.x * 0.1) * 0.1 + 0.9;
    
    gl_FragColor = vec4(color * shimmer, alpha);
    
    if (gl_FragColor.a < 0.01) discard;
  }
`

export function ParticleSystem({
  type = 'dust',
  count,
  position = new Vector3(0, 0, 0),
  enabled = true,
  toolType = 'hammer',
  intensity = 1.0
}: ParticleSystemProps) {
  const particlesRef = useRef<Points>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  
  const { animationTime } = useAnimation()
  const { quality, metrics } = usePerformance()

  const particleCount = useMemo(() => {
    if (count) return count
    
    const baseCount = PARTICLE_CONFIG[type.toUpperCase() as keyof typeof PARTICLE_CONFIG]?.COUNT || 1000
    
    // Adjust based on performance
    switch (quality) {
      case 'low': return Math.floor(baseCount * 0.3)
      case 'medium': return Math.floor(baseCount * 0.6)
      case 'high': return baseCount
      case 'ultra': return Math.floor(baseCount * 1.5)
      default: return baseCount
    }
  }, [count, type, quality])

  const particleConfig = useMemo(() => {
    const config = PARTICLE_CONFIG[type.toUpperCase() as keyof typeof PARTICLE_CONFIG]
    
    const toolMultipliers = {
      hammer: { size: 1.2, velocity: 1.1, alpha: 0.8 },
      drill: { size: 0.8, velocity: 1.5, alpha: 1.0 },
      level: { size: 0.6, velocity: 0.7, alpha: 0.6 },
      'measuring-tape': { size: 0.5, velocity: 0.5, alpha: 0.4 }
    }
    
    const multiplier = toolMultipliers[toolType]
    
    return {
      ...config,
      SIZE: config.SIZE * multiplier.size,
      VELOCITY: config.VELOCITY.clone().multiplyScalar(multiplier.velocity),
      OPACITY: config.OPACITY * multiplier.alpha
    }
  }, [type, toolType])

  const particleTexture = useMemo(() => {
    return type === 'sparks' ? createSparkTexture(32) : createParticleTexture(64)
  }, [type])

  const { geometry, material } = useMemo(() => {
    const geo = new BufferGeometry()
    
    // Position attributes
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const alphas = new Float32Array(particleCount)
    const velocities = new Float32Array(particleCount * 3)
    const lifespans = new Float32Array(particleCount)
    const ages = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Random positions around the tool
      positions[i3] = position.x + (Math.random() - 0.5) * 2
      positions[i3 + 1] = position.y + (Math.random() - 0.5) * 2
      positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2
      
      // Particle properties
      sizes[i] = particleConfig.SIZE + Math.random() * particleConfig.SIZE_VARIATION
      alphas[i] = particleConfig.OPACITY + (Math.random() - 0.5) * particleConfig.OPACITY_VARIATION
      
      // Velocity based on particle type
      const vel = particleConfig.VELOCITY.clone()
      vel.x += (Math.random() - 0.5) * particleConfig.VELOCITY_VARIATION.x
      vel.y += (Math.random() - 0.5) * particleConfig.VELOCITY_VARIATION.y
      vel.z += (Math.random() - 0.5) * particleConfig.VELOCITY_VARIATION.z
      
      velocities[i3] = vel.x
      velocities[i3 + 1] = vel.y
      velocities[i3 + 2] = vel.z
      
      // Lifespan
      lifespans[i] = particleConfig.LIFESPAN + (Math.random() - 0.5) * particleConfig.LIFESPAN_VARIATION
      ages[i] = Math.random() * lifespans[i] // Start at random age for continuous effect
    }
    
    geo.setAttribute('position', new BufferAttribute(positions, 3))
    geo.setAttribute('size', new BufferAttribute(sizes, 1))
    geo.setAttribute('alpha', new BufferAttribute(alphas, 1))
    geo.setAttribute('velocity', new BufferAttribute(velocities, 3))
    geo.setAttribute('lifespan', new BufferAttribute(lifespans, 1))
    geo.setAttribute('age', new BufferAttribute(ages, 1))
    
    const mat = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        particleTexture: { value: particleTexture },
        color: { value: particleConfig.COLOR },
        globalAlpha: { value: intensity },
        gravity: { value: new Vector3(0, -0.1, 0) },
        buoyancy: { value: 0.05 }
      },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      vertexColors: false
    })
    
    return { geometry: geo, material: mat }
  }, [particleCount, position, particleConfig, particleTexture, intensity])

  const resetParticle = useCallback((index: number) => {
    const positions = geometry.attributes.position.array as Float32Array
    const velocities = geometry.attributes.velocity.array as Float32Array
    const ages = geometry.attributes.age.array as Float32Array
    const lifespans = geometry.attributes.lifespan.array as Float32Array
    
    const i3 = index * 3
    
    // Reset position near tool
    positions[i3] = position.x + (Math.random() - 0.5) * 0.5
    positions[i3 + 1] = position.y + (Math.random() - 0.5) * 0.5
    positions[i3 + 2] = position.z + (Math.random() - 0.5) * 0.5
    
    // Reset velocity
    const vel = particleConfig.VELOCITY.clone()
    vel.x += (Math.random() - 0.5) * particleConfig.VELOCITY_VARIATION.x
    vel.y += (Math.random() - 0.5) * particleConfig.VELOCITY_VARIATION.y
    vel.z += (Math.random() - 0.5) * particleConfig.VELOCITY_VARIATION.z
    
    velocities[i3] = vel.x
    velocities[i3 + 1] = vel.y
    velocities[i3 + 2] = vel.z
    
    // Reset age
    ages[index] = 0
    
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.velocity.needsUpdate = true
    geometry.attributes.age.needsUpdate = true
  }, [geometry, position, particleConfig])

  useFrame((state, deltaTime) => {
    if (!enabled || !materialRef.current) return
    
    // Update shader uniforms
    materialRef.current.uniforms.time.value = animationTime
    materialRef.current.uniforms.globalAlpha.value = intensity
    
    // Update particle ages
    const ages = geometry.attributes.age.array as Float32Array
    const lifespans = geometry.attributes.lifespan.array as Float32Array
    
    for (let i = 0; i < particleCount; i++) {
      ages[i] += deltaTime * 1000
      
      // Reset particles that have exceeded their lifespan
      if (ages[i] > lifespans[i]) {
        resetParticle(i)
      }
    }
    
    geometry.attributes.age.needsUpdate = true
  })

  if (!enabled) return null

  return (
    <points ref={particlesRef} geometry={geometry} material={material}>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        args={[{
          uniforms: material.uniforms,
          vertexShader: particleVertexShader,
          fragmentShader: particleFragmentShader,
          blending: AdditiveBlending,
          transparent: true,
          depthWrite: false
        }]}
      />
    </points>
  )
}

export function ConstructionDustSystem({ 
  toolPositions, 
  enabled = true 
}: { 
  toolPositions: Vector3[]
  enabled?: boolean 
}) {
  return (
    <group>
      {toolPositions.map((position, index) => (
        <ParticleSystem
          key={`dust-${index}`}
          type="dust"
          position={position}
          enabled={enabled}
          toolType={['hammer', 'drill', 'level', 'measuring-tape'][index] as any}
          intensity={0.8}
        />
      ))}
    </group>
  )
}

export function DrillSparksSystem({ 
  position, 
  enabled = true,
  intensity = 1.0 
}: { 
  position: Vector3
  enabled?: boolean
  intensity?: number
}) {
  return (
    <ParticleSystem
      type="sparks"
      position={position}
      enabled={enabled}
      toolType="drill"
      intensity={intensity}
      count={800}
    />
  )
}

export function ConstructionDebrisSystem({ 
  positions, 
  enabled = true 
}: { 
  positions: Vector3[]
  enabled?: boolean 
}) {
  return (
    <group>
      {positions.map((position, index) => (
        <ParticleSystem
          key={`debris-${index}`}
          type="debris"
          position={position}
          enabled={enabled}
          intensity={0.6}
          count={200}
        />
      ))}
    </group>
  )
}

export function AdaptiveParticleSystem({ 
  ...props 
}: ParticleSystemProps) {
  const { quality, metrics } = usePerformance()
  
  const adaptiveProps = useMemo(() => {
    const baseIntensity = props.intensity || 1.0
    
    if (metrics.fps < 30) {
      return {
        ...props,
        enabled: false
      }
    }
    
    if (metrics.fps < 45) {
      return {
        ...props,
        intensity: baseIntensity * 0.5,
        count: props.count ? Math.floor(props.count * 0.3) : undefined
      }
    }
    
    return props
  }, [props, quality, metrics])
  
  return <ParticleSystem {...adaptiveProps} />
}

export default ParticleSystem
