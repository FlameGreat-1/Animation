import { 
  CanvasTexture, 
  DataTexture, 
  RGBAFormat,
  FloatType, 
  LinearFilter, 
  RepeatWrapping,
  Color,
  Vector2
} from 'three'

export function createMetalAlbedoTexture(size: number = 512): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#E5E7EB')
  gradient.addColorStop(0.3, '#D1D5DB')
  gradient.addColorStop(0.7, '#9CA3AF')
  gradient.addColorStop(1, '#6B7280')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = Math.random() * 3 + 1
    const opacity = Math.random() * 0.3 + 0.1
    
    ctx.globalAlpha = opacity
    ctx.fillStyle = '#F3F4F6'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

export function createMetalNormalTexture(size: number = 512): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  ctx.fillStyle = '#8080FF'
  ctx.fillRect(0, 0, size, size)
  
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const noise = Math.random() * 0.2 - 0.1
      const normalX = 128 + noise * 127
      const normalY = 128 + noise * 127
      const normalZ = 255
      
      ctx.fillStyle = `rgb(${normalX}, ${normalY}, ${normalZ})`
      ctx.fillRect(x, y, 4, 4)
    }
  }
  
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(4, 4)
  return texture
}

export function createMetalRoughnessTexture(size: number = 512): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
  gradient.addColorStop(0, '#333333')
  gradient.addColorStop(0.5, '#555555')
  gradient.addColorStop(1, '#777777')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = Math.random() * 8 + 2
    const opacity = Math.random() * 0.4 + 0.2
    
    ctx.globalAlpha = opacity
    ctx.fillStyle = '#222222'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(1, 1)
  return texture
}

export function createWoodAlbedoTexture(size: number = 512): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  const gradient = ctx.createLinearGradient(0, 0, 0, size)
  gradient.addColorStop(0, '#D2691E')
  gradient.addColorStop(0.2, '#CD853F')
  gradient.addColorStop(0.4, '#A0522D')
  gradient.addColorStop(0.6, '#8B4513')
  gradient.addColorStop(0.8, '#654321')
  gradient.addColorStop(1, '#5D4037')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  for (let y = 0; y < size; y += 8) {
    const waveOffset = Math.sin(y * 0.02) * 20
    ctx.strokeStyle = '#3E2723'
    ctx.lineWidth = Math.random() * 2 + 1
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.quadraticCurveTo(size/2 + waveOffset, y + 4, size, y)
    ctx.stroke()
  }
  
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const width = Math.random() * 4 + 1
    const height = Math.random() * 20 + 10
    
    ctx.globalAlpha = 0.3
    ctx.fillStyle = '#2E1A0A'
    ctx.fillRect(x, y, width, height)
  }
  
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(1, 4)
  return texture
}

export function createWoodNormalTexture(size: number = 512): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  ctx.fillStyle = '#8080FF'
  ctx.fillRect(0, 0, size, size)
  
  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const grainNoise = Math.sin(y * 0.1) * 0.3 + Math.random() * 0.2 - 0.1
      const normalX = 128 + grainNoise * 50
      const normalY = 128 + Math.random() * 20 - 10
      const normalZ = 255
      
      ctx.fillStyle = `rgb(${normalX}, ${normalY}, ${normalZ})`
      ctx.fillRect(x, y, 2, 2)
    }
  }
  
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(2, 8)
  return texture
}

export function createPlasticAlbedoTexture(size: number = 512): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
  gradient.addColorStop(0, '#2D3748')
  gradient.addColorStop(0.7, '#1A202C')
  gradient.addColorStop(1, '#171923')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = Math.random() * 2 + 0.5
    
    ctx.globalAlpha = 0.1
    ctx.fillStyle = '#4A5568'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(1, 1)
  return texture
}

export function createPlasticNormalTexture(size: number = 512): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  ctx.fillStyle = '#8080FF'
  ctx.fillRect(0, 0, size, size)
  
  for (let y = 0; y < size; y += 8) {
    for (let x = 0; x < size; x += 8) {
      const noise = Math.random() * 0.1 - 0.05
      const normalX = 128 + noise * 127
      const normalY = 128 + noise * 127
      const normalZ = 255
      
      ctx.fillStyle = `rgb(${normalX}, ${normalY}, ${normalZ})`
      ctx.fillRect(x, y, 8, 8)
    }
  }
  
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(1, 1)
  return texture
}

export function createRubberAlbedoTexture(size: number = 512): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  ctx.fillStyle = '#1A1A1A'
  ctx.fillRect(0, 0, size, size)
  
  for (let y = 0; y < size; y += 16) {
    for (let x = 0; x < size; x += 16) {
      const pattern = (x + y) % 32 < 16
      ctx.fillStyle = pattern ? '#2D2D2D' : '#0F0F0F'
      ctx.fillRect(x, y, 16, 16)
    }
  }
  
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const radius = Math.random() * 1 + 0.5
    
    ctx.globalAlpha = 0.3
    ctx.fillStyle = '#404040'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(4, 4)
  return texture
}

export function createRubberNormalTexture(size: number = 512): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  ctx.fillStyle = '#8080FF'
  ctx.fillRect(0, 0, size, size)
  
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const bumpNoise = Math.random() * 0.4 - 0.2
      const normalX = 128 + bumpNoise * 100
      const normalY = 128 + bumpNoise * 100
      const normalZ = 255
      
      ctx.fillStyle = `rgb(${normalX}, ${normalY}, ${normalZ})`
      ctx.fillRect(x, y, 4, 4)
    }
  }
  
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(8, 8)
  return texture
}

export function createHDREnvironmentTexture(size: number = 1024): DataTexture {
  const data = new Float32Array(size * size * 3)
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const index = (i * size + j) * 3
      
      const u = i / size
      const v = j / size
      
      const phi = u * Math.PI * 2
      const theta = v * Math.PI
      
      const x = Math.sin(theta) * Math.cos(phi)
      const y = Math.cos(theta)
      const z = Math.sin(theta) * Math.sin(phi)
      
      const skyColor = new Color('#87CEEB')
      const horizonColor = new Color('#FFA500')
      const groundColor = new Color('#8B4513')
      
      let color: Color
      if (y > 0.1) {
        const t = Math.pow(y, 0.4)
        color = skyColor.clone().lerp(new Color('#4169E1'), t)
      } else if (y > -0.1) {
        const t = (y + 0.1) / 0.2
        color = groundColor.clone().lerp(horizonColor, t)
      } else {
        color = groundColor.clone()
      }
      
      const sunDirection = new Vector2(0.3, 0.7).normalize()
      const sunDot = Math.max(0, x * sunDirection.x + y * sunDirection.y)
      const sunIntensity = Math.pow(sunDot, 32) * 5
      
      color.r = Math.min(1, color.r + sunIntensity)
      color.g = Math.min(1, color.g + sunIntensity * 0.9)
      color.b = Math.min(1, color.b + sunIntensity * 0.7)
      
      data[index] = color.r
      data[index + 1] = color.g
      data[index + 2] = color.b
    }
  }
  
  const texture = new DataTexture(data, size, size, RGBAFormat, FloatType)
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  
  return texture
}

export function createParticleTexture(size: number = 64): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  const centerX = size / 2
  const centerY = size / 2
  const radius = size / 2
  
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export function createSparkTexture(size: number = 32): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  const centerX = size / 2
  const centerY = size / 2
  
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size/2)
  gradient.addColorStop(0, 'rgba(255, 165, 0, 1)')
  gradient.addColorStop(0.4, 'rgba(255, 69, 0, 0.8)')
  gradient.addColorStop(0.8, 'rgba(255, 0, 0, 0.4)')
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.beginPath()
  ctx.arc(centerX, centerY, 2, 0, Math.PI * 2)
  ctx.fill()
  
  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export function generateNoiseTexture(size: number, scale: number = 1): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  const imageData = ctx.createImageData(size, size)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 255 * scale
    data[i] = noise
    data[i + 1] = noise
    data[i + 2] = noise
    data[i + 3] = 255
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  return texture
}

export function createGradientTexture(color1: string, color2: string, size: number = 256): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  
  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}
