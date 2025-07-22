import React from 'react'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App'
import './index.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Failed to find the root element. Make sure you have a div with id="root" in your HTML.')
}

const root = createRoot(container)

function AppWithErrorBoundary() {
  return (
    <StrictMode>
      <App mode="showcase" category="general" />
    </StrictMode>
  )
}

function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return !!gl
  } catch (e) {
    return false
  }
}

function detectDeviceCapabilities() {
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent)
  const memory = (navigator as any).deviceMemory || 4
  const cores = navigator.hardwareConcurrency || 4
  
  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    memory,
    cores,
    webglSupported: detectWebGLSupport(),
    pixelRatio: window.devicePixelRatio || 1
  }
}

function UnsupportedBrowser() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1E3A8A, #64748B)',
      color: '#FFFFFF',
      fontFamily: 'Inter, system-ui, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '600px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{
          color: '#F97316',
          marginBottom: '20px',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          BuildHive Professional Tools
        </h1>
        
        <h2 style={{
          color: '#F97316',
          marginBottom: '20px',
          fontSize: '20px'
        }}>
          Browser Not Supported
        </h2>
        
        <p style={{
          marginBottom: '20px',
          fontSize: '16px',
          lineHeight: '1.6',
          opacity: 0.9
        }}>
          This professional construction tools animation requires WebGL support for 3D graphics. 
          Your browser doesn't support the required features.
        </p>
        
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#F97316', marginBottom: '10px' }}>Recommended Browsers:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Google Chrome 90+</li>
            <li>Mozilla Firefox 88+</li>
            <li>Safari 14+</li>
            <li>Microsoft Edge 90+</li>
          </ul>
        </div>
        
        <p style={{
          fontSize: '14px',
          opacity: 0.7,
          marginBottom: '20px'
        }}>
          Please update your browser or try a different one to experience our professional construction tools showcase.
        </p>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#F97316',
            color: '#FFFFFF',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

function initializeApp() {
  const capabilities = detectDeviceCapabilities()
  
  console.log('BuildHive Tools - Device Capabilities:', capabilities)
  
  if (!capabilities.webglSupported) {
    root.render(<UnsupportedBrowser />)
    return
  }
  
  if (capabilities.isMobile && capabilities.memory < 2) {
    console.warn('Low-end mobile device detected. Performance may be limited.')
  }
  
  const performanceMode = capabilities.isMobile ? 'low' : 
                         capabilities.memory < 4 ? 'medium' : 
                         capabilities.memory >= 8 ? 'high' : 'auto'
  
  root.render(
    <StrictMode>
      <App 
        mode="showcase" 
        category="general"
      />
    </StrictMode>
  )
}

function setupGlobalErrorHandling() {
  window.addEventListener('error', (event) => {
    console.error('BuildHive Tools - Global Error:', event.error)
    
    if (event.error?.message?.includes('WebGL')) {
      root.render(<UnsupportedBrowser />)
    }
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('BuildHive Tools - Unhandled Promise Rejection:', event.reason)
  })
}

function setupPerformanceMonitoring() {
  if ('performance' in window && 'PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log('BuildHive Tools - Page Load Time:', entry.duration)
          }
          if (entry.entryType === 'paint') {
            console.log(`BuildHive Tools - ${entry.name}:`, entry.startTime)
          }
        })
      })
      
      observer.observe({ entryTypes: ['navigation', 'paint'] })
    } catch (error) {
      console.warn('Performance monitoring not available:', error)
    }
  }
}

function preloadCriticalResources() {
  const criticalFonts = [
    'Inter-Regular.woff2',
    'Inter-Bold.woff2'
  ]
  
  criticalFonts.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    link.href = `/fonts/${font}`
    document.head.appendChild(link)
  })
}

function setViewportMeta() {
  let viewport = document.querySelector('meta[name="viewport"]')
  if (!viewport) {
    viewport = document.createElement('meta')
    viewport.setAttribute('name', 'viewport')
    document.head.appendChild(viewport)
  }
  
  const capabilities = detectDeviceCapabilities()
  const viewportContent = capabilities.isMobile 
    ? 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    : 'width=device-width, initial-scale=1.0'
  
  viewport.setAttribute('content', viewportContent)
}

function updateDocumentMeta() {
  document.title = 'BuildHive - Professional Construction Tools Animation'
  
  const metaTags = [
    { name: 'description', content: 'Professional 3D construction tools animation showcasing BuildHive\'s platform for electrical, plumbing, carpentry, and general construction services.' },
    { name: 'keywords', content: 'construction, tools, 3D animation, BuildHive, electrical, plumbing, carpentry, professional services' },
    { name: 'author', content: 'BuildHive' },
    { name: 'theme-color', content: '#1E3A8A' },
    { property: 'og:title', content: 'BuildHive - Professional Construction Tools' },
    { property: 'og:description', content: 'Experience professional construction tools in stunning 3D animation' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
  
  metaTags.forEach(tag => {
    let meta = document.querySelector(`meta[${tag.name ? 'name' : 'property'}="${tag.name || tag.property}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      if (tag.name) meta.setAttribute('name', tag.name)
      if (tag.property) meta.setAttribute('property', tag.property)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', tag.content)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('BuildHive Professional Construction Tools - Initializing...')
  
  updateDocumentMeta()
  setViewportMeta()
  setupGlobalErrorHandling()
  setupPerformanceMonitoring()
  preloadCriticalResources()
  
  setTimeout(() => {
    initializeApp()
  }, 100)
})

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default
    root.render(
      <StrictMode>
        <NextApp mode="showcase" category="general" />
      </StrictMode>
    )
  })
}
