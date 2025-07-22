import { Vector3, Euler, Color, Material, Mesh, BufferGeometry } from 'three'
import { SpringValue } from '@react-spring/three'

// ============================================================================
// CORE ANIMATION TYPES
// ============================================================================

export interface AnimationConfig {
  duration: number
  delay: number
  easing: string
  loop: boolean
  autoplay: boolean
}

export interface FloatingMotion {
  amplitude: number
  frequency: number
  phase: number
  easing: 'sine' | 'cosine' | 'ease-in-out'
}

export interface RotationConfig {
  axis: 'x' | 'y' | 'z'
  speed: number
  direction: 1 | -1
  easing: 'linear' | 'ease-in-out'
}

// ============================================================================
// CONSTRUCTION TOOL TYPES
// ============================================================================

export type ToolType = 'hammer' | 'drill' | 'level' | 'measuring-tape'

export interface ToolModel {
  id: string
  type: ToolType
  name: string
  position: Vector3
  rotation: Euler
  scale: Vector3
  material: ToolMaterial
  geometry: BufferGeometry
  mesh?: Mesh
}

export interface ToolMaterial {
  type: 'metal' | 'plastic' | 'rubber' | 'wood'
  color: Color
  roughness: number
  metalness: number
  normalScale: number
  emissive: Color
  emissiveIntensity: number
}

export interface ToolAnimation {
  floating: FloatingMotion
  rotation: RotationConfig
  physics: PhysicsProperties
  particles: ParticleConfig
}

// ============================================================================
// PHYSICS SIMULATION TYPES
// ============================================================================

export interface PhysicsProperties {
  mass: number
  gravity: Vector3
  buoyancy: number
  damping: number
  angularDamping: number
  friction: number
  restitution: number
}

export interface PhysicsWorld {
  gravity: Vector3
  broadphase: 'naive' | 'sap'
  solver: 'gs' | 'split'
  allowSleep: boolean
  iterations: number
  tolerance: number
}

// ============================================================================
// PARTICLE SYSTEM TYPES
// ============================================================================

export interface ParticleConfig {
  count: number
  size: number
  sizeVariation: number
  color: Color
  opacity: number
  opacityVariation: number
  velocity: Vector3
  velocityVariation: Vector3
  acceleration: Vector3
  lifespan: number
  lifespanVariation: number
}

export interface ParticleSystem {
  id: string
  type: 'dust' | 'sparks' | 'debris'
  config: ParticleConfig
  emitter: ParticleEmitter
  active: boolean
}

export interface ParticleEmitter {
  position: Vector3
  radius: number
  rate: number
  burst: boolean
  burstCount: number
}

// ============================================================================
// VISUAL EFFECTS TYPES
// ============================================================================

export interface PostProcessingConfig {
  bloom: BloomConfig
  depthOfField: DOFConfig
  filmGrain: FilmGrainConfig
  colorGrading: ColorGradingConfig
  motionBlur: MotionBlurConfig
  volumetricFog: VolumetricFogConfig
}

export interface BloomConfig {
  enabled: boolean
  intensity: number
  threshold: number
  smoothWidth: number
  radius: number
}

export interface DOFConfig {
  enabled: boolean
  focusDistance: number
  focalLength: number
  bokehScale: number
  height: number
}

export interface FilmGrainConfig {
  enabled: boolean
  intensity: number
  size: number
  animated: boolean
}

export interface ColorGradingConfig {
  enabled: boolean
  exposure: number
  brightness: number
  contrast: number
  saturation: number
  temperature: number
  tint: number
}

export interface MotionBlurConfig {
  enabled: boolean
  intensity: number
  samples: number
}

export interface VolumetricFogConfig {
  enabled: boolean
  density: number
  color: Color
  near: number
  far: number
}

// ============================================================================
// LIGHTING SYSTEM TYPES
// ============================================================================

export interface LightingConfig {
  ambient: AmbientLightConfig
  directional: DirectionalLightConfig[]
  point: PointLightConfig[]
  spot: SpotLightConfig[]
  hdr: HDRConfig
}

export interface AmbientLightConfig {
  color: Color
  intensity: number
}

export interface DirectionalLightConfig {
  color: Color
  intensity: number
  position: Vector3
  target: Vector3
  castShadow: boolean
  shadowMapSize: number
  shadowCamera: ShadowCameraConfig
}

export interface PointLightConfig {
  color: Color
  intensity: number
  position: Vector3
  distance: number
  decay: number
  castShadow: boolean
}

export interface SpotLightConfig {
  color: Color
  intensity: number
  position: Vector3
  target: Vector3
  angle: number
  penumbra: number
  decay: number
  distance: number
  castShadow: boolean
}

export interface ShadowCameraConfig {
  left: number
  right: number
  top: number
  bottom: number
  near: number
  far: number
}

export interface HDRConfig {
  enabled: boolean
  exposure: number
  background: string | null
  environment: string | null
}

// ============================================================================
// CAMERA SYSTEM TYPES
// ============================================================================

export interface CameraConfig {
  position: Vector3
  target: Vector3
  fov: number
  near: number
  far: number
  aspect: number
}

export interface CameraAnimation {
  enabled: boolean
  duration: number
  easing: string
  path: CameraKeyframe[]
  loop: boolean
}

export interface CameraKeyframe {
  time: number
  position: Vector3
  target: Vector3
  fov: number
}

// ============================================================================
// INTERACTION TYPES
// ============================================================================

export interface GestureConfig {
  enabled: boolean
  pinchToZoom: boolean
  rotate: boolean
  pan: boolean
  hapticFeedback: boolean
  voiceCommands: boolean
}

export interface TouchGesture {
  type: 'pinch' | 'rotate' | 'pan' | 'tap' | 'double-tap'
  startPosition: Vector3
  currentPosition: Vector3
  delta: Vector3
  scale: number
  rotation: number
  velocity: Vector3
}

export interface VoiceCommand {
  command: string
  action: string
  parameters?: Record<string, any>
}

// ============================================================================
// PERFORMANCE MONITORING TYPES
// ============================================================================

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage: number
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
  programs: number
}

export interface PerformanceConfig {
  targetFPS: number
  adaptiveQuality: boolean
  maxParticles: number
  shadowMapSize: number
  antialias: boolean
  pixelRatio: number
}

// ============================================================================
// ANIMATION STATE TYPES
// ============================================================================

export interface AnimationState {
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  duration: number
  progress: number
  loop: boolean
  direction: 'forward' | 'reverse'
}

export interface SpringAnimationState {
  position: SpringValue<Vector3>
  rotation: SpringValue<Euler>
  scale: SpringValue<Vector3>
  opacity: SpringValue<number>
}

// ============================================================================
// CONSTRUCTION INDUSTRY TYPES
// ============================================================================

export type ConstructionCategory = 
  | 'electrical'
  | 'plumbing'
  | 'carpentry'
  | 'painting'
  | 'roofing'
  | 'hvac'
  | 'landscaping'
  | 'cleaning'
  | 'handyman'
  | 'general'

export interface ConstructionTool {
  id: string
  name: string
  category: ConstructionCategory
  description: string
  commonUses: string[]
  safetyRating: 'low' | 'medium' | 'high'
  professionalGrade: boolean
}

// ============================================================================
// RESPONSIVE DESIGN TYPES
// ============================================================================

export interface ResponsiveConfig {
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
    ultrawide: number
  }
  adaptiveSettings: {
    mobile: Partial<PerformanceConfig>
    tablet: Partial<PerformanceConfig>
    desktop: Partial<PerformanceConfig>
    ultrawide: Partial<PerformanceConfig>
  }
}

export interface ViewportConfig {
  width: number
  height: number
  aspect: number
  pixelRatio: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

export interface AnimationError {
  code: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  context?: Record<string, any>
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: any
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  Vector3,
  Euler,
  Color,
  Material,
  Mesh,
  BufferGeometry
} from 'three'

export type { SpringValue } from '@react-spring/three'
