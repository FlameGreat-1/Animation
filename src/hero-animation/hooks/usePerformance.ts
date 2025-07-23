import { useRef, useCallback, useMemo, useEffect } from 'react'
import { PERFORMANCE_CONFIG } from '../utils/constants'

interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage: number
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
  programs: number
  gpuMemory: number
  cpuUsage: number
}

interface PerformanceConfig {
  targetFPS?: number
  adaptiveQuality?: boolean
  maxParticles?: number
  shadowMapSize?: number
  antialias?: boolean
  pixelRatio?: number
  monitoringInterval?: number
  enableProfiling?: boolean
}

interface QualityLevel {
  level: 'low' | 'medium' | 'high' | 'ultra'
  particleCount: number
  shadowMapSize: number
  pixelRatio: number
  antialias: boolean
  postProcessing: boolean
}

export function usePerformance(config: PerformanceConfig = {}) {
  const {
    targetFPS = PERFORMANCE_CONFIG.TARGET_FPS,
    adaptiveQuality = true,
    maxParticles = PERFORMANCE_CONFIG.HIGH_QUALITY_PARTICLES,
    shadowMapSize = PERFORMANCE_CONFIG.HIGH_SHADOW_MAP_SIZE,
    antialias = PERFORMANCE_CONFIG.ANTIALIAS,
    pixelRatio = window.devicePixelRatio || 1,
    monitoringInterval = 1000,
    enableProfiling = true
  } = config

  const performanceMetrics = useRef<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    programs: 0,
    gpuMemory: 0,
    cpuUsage: 0
  })

  const frameCount = useRef<number>(0)
  const lastTime = useRef<number>(performance.now())
  const fpsHistory = useRef<number[]>([])
  const frameTimeHistory = useRef<number[]>([])
  const currentQuality = useRef<QualityLevel['level']>('high')
  const adaptiveTimer = useRef<number>(0)
  const performanceObserver = useRef<PerformanceObserver | null>(null)
  const frameId = useRef<number>(0)
  const gl = useRef<any>(null)
  const scene = useRef<any>(null)
  const camera = useRef<any>(null)

  const qualityLevels: Record<QualityLevel['level'], QualityLevel> = useMemo(() => ({
    low: {
      level: 'low',
      particleCount: PERFORMANCE_CONFIG.LOW_QUALITY_PARTICLES,
      shadowMapSize: PERFORMANCE_CONFIG.LOW_SHADOW_MAP_SIZE,
      pixelRatio: 1,
      antialias: false,
      postProcessing: false
    },
    medium: {
      level: 'medium',
      particleCount: PERFORMANCE_CONFIG.MEDIUM_QUALITY_PARTICLES,
      shadowMapSize: PERFORMANCE_CONFIG.MEDIUM_SHADOW_MAP_SIZE,
      pixelRatio: Math.min(1.5, pixelRatio),
      antialias: false,
      postProcessing: true
    },
    high: {
      level: 'high',
      particleCount: PERFORMANCE_CONFIG.HIGH_QUALITY_PARTICLES,
      shadowMapSize: PERFORMANCE_CONFIG.HIGH_SHADOW_MAP_SIZE,
      pixelRatio: Math.min(2, pixelRatio),
      antialias: true,
      postProcessing: true
    },
    ultra: {
      level: 'ultra',
      particleCount: maxParticles,
      shadowMapSize: shadowMapSize * 2,
      pixelRatio: pixelRatio,
      antialias: true,
      postProcessing: true
    }
  }), [maxParticles, shadowMapSize, pixelRatio])

  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize / 1024 / 1024
    }
    return 0
  }, [])

  const getGPUMemoryUsage = useCallback((): number => {
    if (!gl.current || !gl.current.info) return 0
    const info = gl.current.info
    if (info.memory) {
      return info.memory.geometries + info.memory.textures
    }
    return 0
  }, [])

  const getRenderInfo = useCallback(() => {
    if (!gl.current || !gl.current.info) {
      return {
        drawCalls: 0,
        triangles: 0,
        geometries: 0,
        textures: 0,
        programs: 0
      }
    }
    const info = gl.current.info.render
    return {
      drawCalls: info.calls,
      triangles: info.triangles,
      geometries: gl.current.info.memory.geometries,
      textures: gl.current.info.memory.textures,
      programs: gl.current.info.programs?.length || 0
    }
  }, [])

  const calculateAverageFPS = useCallback((): number => {
    if (fpsHistory.current.length === 0) return 0
    const sum = fpsHistory.current.reduce((a, b) => a + b, 0)
    return sum / fpsHistory.current.length
  }, [])

  const calculateAverageFrameTime = useCallback((): number => {
    if (frameTimeHistory.current.length === 0) return 0
    const sum = frameTimeHistory.current.reduce((a, b) => a + b, 0)
    return sum / frameTimeHistory.current.length
  }, [])

  const updateMetrics = useCallback((deltaTime: number) => {
    const currentTime = performance.now()
    const fps = 1 / deltaTime
    const frameTime = deltaTime * 1000
    
    fpsHistory.current.push(fps)
    frameTimeHistory.current.push(frameTime)
    
    if (fpsHistory.current.length > 60) {
      fpsHistory.current.shift()
      frameTimeHistory.current.shift()
    }
    
    const renderInfo = getRenderInfo()
    
    performanceMetrics.current = {
      fps: calculateAverageFPS(),
      frameTime: calculateAverageFrameTime(),
      memoryUsage: getMemoryUsage(),
      gpuMemory: getGPUMemoryUsage(),
      cpuUsage: Math.min(100, (frameTime / 16.67) * 100),
      ...renderInfo
    }
    
    frameCount.current++
    lastTime.current = currentTime
  }, [calculateAverageFPS, calculateAverageFrameTime, getRenderInfo, getMemoryUsage, getGPUMemoryUsage])

  const adjustQuality = useCallback((targetLevel: QualityLevel['level']) => {
    if (currentQuality.current === targetLevel || !gl.current || !scene.current) return
    
    const quality = qualityLevels[targetLevel]
    currentQuality.current = targetLevel
    
    gl.current.setPixelRatio(quality.pixelRatio)
    
    scene.current.traverse((object: any) => {
      if (object.material) {
        if (object.material.map) {
          object.material.map.anisotropy = quality.antialias ? 4 : 1
        }
      }
      
      if (object.isLight && object.castShadow) {
        if (object.shadow && object.shadow.mapSize) {
          object.shadow.mapSize.setScalar(quality.shadowMapSize)
          object.shadow.map?.dispose()
          object.shadow.map = null
        }
      }
    })
    
    gl.current.shadowMap.enabled = quality.shadowMapSize > 0
    gl.current.shadowMap.needsUpdate = true
  }, [qualityLevels])

  const adaptiveQualityControl = useCallback((deltaTime: number) => {
    if (!adaptiveQuality) return
    
    adaptiveTimer.current += deltaTime * 1000
    
    if (adaptiveTimer.current < monitoringInterval) return
    
    adaptiveTimer.current = 0
    const avgFPS = calculateAverageFPS()
    const avgFrameTime = calculateAverageFrameTime()
    
    if (avgFPS < targetFPS * 0.8 && avgFrameTime > 20) {
      if (currentQuality.current === 'ultra') {
        adjustQuality('high')
      } else if (currentQuality.current === 'high') {
        adjustQuality('medium')
      } else if (currentQuality.current === 'medium') {
        adjustQuality('low')
      }
    } else if (avgFPS > targetFPS * 1.1 && avgFrameTime < 12) {
      if (currentQuality.current === 'low') {
        adjustQuality('medium')
      } else if (currentQuality.current === 'medium') {
        adjustQuality('high')
      } else if (currentQuality.current === 'high' && avgFPS > targetFPS * 1.3) {
        adjustQuality('ultra')
      }
    }
  }, [adaptiveQuality, monitoringInterval, calculateAverageFPS, calculateAverageFrameTime, targetFPS, adjustQuality])

  const updatePerformanceFrame = useCallback((deltaTime: number) => {
    updateMetrics(deltaTime)
    adaptiveQualityControl(deltaTime)
  }, [updateMetrics, adaptiveQualityControl])

  const detectDeviceCapabilities = useCallback(() => {
    const capabilities = {
      maxTextureSize: gl.current?.capabilities?.maxTextureSize || 2048,
      maxVertexTextures: gl.current?.capabilities?.maxVertexTextures || 4,
      maxFragmentUniforms: gl.current?.capabilities?.maxFragmentUniforms || 1024,
      maxVertexUniforms: gl.current?.capabilities?.maxVertexUniforms || 1024,
      maxVaryings: gl.current?.capabilities?.maxVaryings || 8,
      maxSamples: gl.current?.capabilities?.maxSamples || 4,
      floatTextures: gl.current?.extensions?.has('OES_texture_float') || false,
      halfFloatTextures: gl.current?.extensions?.has('OES_texture_half_float') || false,
      anisotropicFiltering: gl.current?.extensions?.has('EXT_texture_filter_anisotropic') || false,
      shaderTextureLOD: gl.current?.extensions?.has('EXT_shader_texture_lod') || false,
      standardDerivatives: gl.current?.extensions?.has('OES_standard_derivatives') || false,
      vertexArrayObject: gl.current?.extensions?.has('OES_vertex_array_object') || false,
      instancedArrays: gl.current?.extensions?.has('ANGLE_instanced_arrays') || false,
      multipleRenderTargets: gl.current?.extensions?.has('WEBGL_draw_buffers') || false
    }
    
    const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    const memoryInfo = (navigator as any).deviceMemory || 4
    
    let recommendedQuality: QualityLevel['level'] = 'medium'
    
    if (deviceType === 'mobile' || memoryInfo < 4) {
      recommendedQuality = 'low'
    } else if (memoryInfo >= 8 && capabilities.maxTextureSize >= 4096) {
      recommendedQuality = 'high'
    } else if (memoryInfo >= 16 && capabilities.maxTextureSize >= 8192) {
      recommendedQuality = 'ultra'
    }
    
    return { capabilities, deviceType, memoryInfo, recommendedQuality }
  }, [])

  const startProfiling = useCallback((name: string) => {
    if (enableProfiling && performance.mark) {
      performance.mark(`${name}-start`)
    }
  }, [enableProfiling])

  const endProfiling = useCallback((name: string) => {
    if (enableProfiling && performance.mark && performance.measure) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }
  }, [enableProfiling])

  const getPerformanceReport = useCallback(() => {
    const deviceInfo = detectDeviceCapabilities()
    const metrics = performanceMetrics.current
    
    return {
      metrics,
      quality: currentQuality.current,
      deviceInfo,
      recommendations: {
        shouldReduceParticles: metrics.fps < targetFPS * 0.9,
        shouldReduceShadows: metrics.frameTime > 20,
        shouldReducePixelRatio: metrics.gpuMemory > 500,
        shouldEnableAdaptiveQuality: metrics.fps < targetFPS * 0.8
      }
    }
  }, [detectDeviceCapabilities, targetFPS])

  const optimizeForDevice = useCallback(() => {
    const { recommendedQuality } = detectDeviceCapabilities()
    adjustQuality(recommendedQuality)
  }, [detectDeviceCapabilities, adjustQuality])

  useEffect(() => {
    try {
      const { useFrame, useThree } = require('@react-three/fiber')
      const { gl: glRef, scene: sceneRef, camera: cameraRef } = useThree()
      gl.current = glRef
      scene.current = sceneRef
      camera.current = cameraRef

      useFrame((state, deltaTime) => {
        updatePerformanceFrame(deltaTime)
      })
    } catch {
      let lastTime = performance.now()
      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTime) / 1000
        lastTime = currentTime
        updatePerformanceFrame(deltaTime)
        frameId.current = requestAnimationFrame(animate)
      }
      frameId.current = requestAnimationFrame(animate)
    }

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
    }
  }, [updatePerformanceFrame])

  useEffect(() => {
    optimizeForDevice()
  }, [optimizeForDevice])

  const performanceData = useMemo(() => ({
    metrics: performanceMetrics.current,
    quality: currentQuality.current,
    qualityLevels,
    isOptimal: performanceMetrics.current.fps >= targetFPS * 0.9,
    needsOptimization: performanceMetrics.current.fps < targetFPS * 0.8,
    memoryPressure: performanceMetrics.current.memoryUsage > 100,
    adaptiveQuality,
    targetFPS
  }), [qualityLevels, targetFPS, adaptiveQuality])

  return {
    ...performanceData,
    adjustQuality,
    optimizeForDevice,
    getPerformanceReport,
    startProfiling,
    endProfiling,
    detectDeviceCapabilities
  }
}

export function useFrameRate() {
  const fps = useRef<number>(0)
  const frameCount = useRef<number>(0)
  const lastTime = useRef<number>(performance.now())
  const frameId = useRef<number>(0)

  const updateFrameRate = useCallback(() => {
    frameCount.current++
    const currentTime = performance.now()
    
    if (currentTime - lastTime.current >= 1000) {
      fps.current = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current))
      frameCount.current = 0
      lastTime.current = currentTime
    }
  }, [])

  useEffect(() => {
    try {
      const { useFrame } = require('@react-three/fiber')
      useFrame(() => {
        updateFrameRate()
      })
    } catch {
      const animate = () => {
        updateFrameRate()
        frameId.current = requestAnimationFrame(animate)
      }
      frameId.current = requestAnimationFrame(animate)
    }

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
    }
  }, [updateFrameRate])

  return fps.current
}

export function useMemoryMonitor() {
  const memoryUsage = useRef<number>(0)
  const memoryHistory = useRef<number[]>([])
  const frameId = useRef<number>(0)

  const updateMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usage = memory.usedJSHeapSize / 1024 / 1024
      
      memoryUsage.current = usage
      memoryHistory.current.push(usage)
      
      if (memoryHistory.current.length > 100) {
        memoryHistory.current.shift()
      }
    }
  }, [])

  useEffect(() => {
    try {
      const { useFrame } = require('@react-three/fiber')
      useFrame(() => {
        updateMemory()
      })
    } catch {
      const animate = () => {
        updateMemory()
        frameId.current = requestAnimationFrame(animate)
      }
      frameId.current = requestAnimationFrame(animate)
    }

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
    }
  }, [updateMemory])

  const getAverageMemoryUsage = useCallback(() => {
    if (memoryHistory.current.length === 0) return 0
    const sum = memoryHistory.current.reduce((a, b) => a + b, 0)
    return sum / memoryHistory.current.length
  }, [])

  const getMemoryTrend = useCallback(() => {
    if (memoryHistory.current.length < 10) return 'stable'
    
    const recent = memoryHistory.current.slice(-10)
    const older = memoryHistory.current.slice(-20, -10)
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
    
    const diff = recentAvg - olderAvg
    
    if (diff > 5) return 'increasing'
    if (diff < -5) return 'decreasing'
    return 'stable'
  }, [])

  return {
    current: memoryUsage.current,
    average: getAverageMemoryUsage(),
    trend: getMemoryTrend(),
    history: memoryHistory.current
  }
}

export default usePerformance


