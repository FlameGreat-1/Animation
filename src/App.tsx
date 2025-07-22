import React, { Suspense, useState, useCallback } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { HeroToolsAnimation, ResponsiveHeroToolsAnimation, ConstructionShowcase } from './hero-animation/components/HeroToolsAnimation'
import { COLORS, CONSTRUCTION_MESSAGING } from './hero-animation/utils/constants'

interface AppProps {
  mode?: 'demo' | 'showcase' | 'interactive' | 'minimal'
  category?: 'electrical' | 'plumbing' | 'carpentry' | 'painting' | 'roofing' | 'hvac' | 'landscaping' | 'cleaning' | 'handyman' | 'general'
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${COLORS.INDUSTRIAL_BLUE}, ${COLORS.STEEL_GRAY})`,
      color: '#FFFFFF',
      fontFamily: 'Inter, system-ui, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{
          color: COLORS.CONSTRUCTION_ORANGE,
          marginBottom: '20px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          BuildHive Tools Loading Error
        </h2>
        
        <p style={{
          marginBottom: '20px',
          fontSize: '16px',
          lineHeight: '1.5',
          opacity: 0.9
        }}>
          We're experiencing technical difficulties loading the professional tools animation.
        </p>
        
        <details style={{ marginBottom: '20px', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', color: COLORS.CONSTRUCTION_ORANGE }}>
            Technical Details
          </summary>
          <pre style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            marginTop: '10px',
            overflow: 'auto'
          }}>
            {error.message}
          </pre>
        </details>
        
        <button
          onClick={resetErrorBoundary}
          style={{
            background: COLORS.CONSTRUCTION_ORANGE,
            color: '#FFFFFF',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#E6650E'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = COLORS.CONSTRUCTION_ORANGE
          }}
        >
          Reload Professional Tools
        </button>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${COLORS.INDUSTRIAL_BLUE}, ${COLORS.STEEL_GRAY})`,
      color: '#FFFFFF',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: `4px solid ${COLORS.CONSTRUCTION_ORANGE}`,
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: COLORS.CONSTRUCTION_ORANGE,
          margin: 0
        }}>
          BuildHive
        </h1>
        
        <p style={{
          fontSize: '16px',
          opacity: 0.9,
          margin: 0
        }}>
          Loading Professional Construction Tools...
        </p>
        
        <div style={{
          fontSize: '14px',
          opacity: 0.7,
          textAlign: 'center',
          maxWidth: '400px',
          lineHeight: '1.4'
        }}>
          {CONSTRUCTION_MESSAGING.TAGLINES[0]}
        </div>
      </div>
    </div>
  )
}

function NavigationHeader({ 
  currentMode, 
  onModeChange, 
  currentCategory, 
  onCategoryChange 
}: {
  currentMode: string
  onModeChange: (mode: string) => void
  currentCategory: string
  onCategoryChange: (category: string) => void
}) {
  const modes = [
    { key: 'showcase', label: 'Showcase' },
    { key: 'interactive', label: 'Interactive' },
    { key: 'demo', label: 'Demo' },
    { key: 'minimal', label: 'Minimal' }
  ]

  const categories = [
    { key: 'general', label: 'General', icon: '🔧' },
    { key: 'electrical', label: 'Electrical', icon: '⚡' },
    { key: 'plumbing', label: 'Plumbing', icon: '🔧' },
    { key: 'carpentry', label: 'Carpentry', icon: '🔨' },
    { key: 'painting', label: 'Painting', icon: '🎨' },
    { key: 'roofing', label: 'Roofing', icon: '🏠' },
    { key: 'hvac', label: 'HVAC', icon: '❄️' },
    { key: 'landscaping', label: 'Landscaping', icon: '🌿' },
    { key: 'cleaning', label: 'Cleaning', icon: '🧽' },
    { key: 'handyman', label: 'Handyman', icon: '🛠️' }
  ]

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'rgba(30, 58, 138, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '10px 20px',
      zIndex: 1000,
      borderBottom: `2px solid ${COLORS.CONSTRUCTION_ORANGE}`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <h1 style={{
            color: COLORS.CONSTRUCTION_ORANGE,
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0
          }}>
            BuildHive
          </h1>
          
          <nav style={{ display: 'flex', gap: '10px' }}>
            {modes.map(mode => (
              <button
                key={mode.key}
                onClick={() => onModeChange(mode.key)}
                style={{
                  background: currentMode === mode.key ? COLORS.CONSTRUCTION_ORANGE : 'transparent',
                  color: '#FFFFFF',
                  border: `1px solid ${COLORS.CONSTRUCTION_ORANGE}`,
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {mode.label}
              </button>
            ))}
          </nav>
        </div>
        
        <select
          value={currentCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={{
            background: COLORS.STEEL_GRAY,
            color: '#FFFFFF',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {categories.map(cat => (
            <option key={cat.key} value={cat.key}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  )
}

function App({ mode = 'showcase', category = 'general' }: AppProps) {
  const [currentMode, setCurrentMode] = useState(mode)
  const [currentCategory, setCurrentCategory] = useState(category)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const handleToolSelect = useCallback((toolType: string) => {
    setSelectedTool(toolType)
    console.log(`Selected tool: ${toolType}`)
  }, [])

  const handleModeChange = useCallback((newMode: string) => {
    setCurrentMode(newMode)
  }, [])

  const handleCategoryChange = useCallback((newCategory: string) => {
    setCurrentCategory(newCategory)
  }, [])

  const renderAnimation = () => {
    switch (currentMode) {
      case 'showcase':
        return <ConstructionShowcase />
      
      case 'interactive':
        return (
          <ResponsiveHeroToolsAnimation
            category={currentCategory as any}
            autoPlay={true}
            enableInteraction={true}
            enableParticles={true}
            enablePostProcessing={true}
            performanceMode="auto"
            onToolSelect={handleToolSelect}
          />
        )
      
      case 'demo':
        return (
          <HeroToolsAnimation
            category={currentCategory as any}
            autoPlay={true}
            enableInteraction={true}
            enableParticles={true}
            enablePostProcessing={true}
            performanceMode="high"
            onToolSelect={handleToolSelect}
          />
        )
      
      case 'minimal':
        return (
          <HeroToolsAnimation
            category={currentCategory as any}
            autoPlay={true}
            enableInteraction={false}
            enableParticles={false}
            enablePostProcessing={false}
            performanceMode="low"
          />
        )
      
      default:
        return <ConstructionShowcase />
    }
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <div style={{
        width: '100vw',
        height: '100vh',
        background: `linear-gradient(135deg, ${COLORS.INDUSTRIAL_BLUE}20, ${COLORS.STEEL_GRAY}10)`,
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden'
      }}>
        <NavigationHeader
          currentMode={currentMode}
          onModeChange={handleModeChange}
          currentCategory={currentCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <main style={{
          width: '100%',
          height: '100%',
          paddingTop: '60px'
        }}>
          <Suspense fallback={<LoadingScreen />}>
            {renderAnimation()}
          </Suspense>
        </main>
        
        {selectedTool && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: COLORS.CONSTRUCTION_ORANGE,
            padding: '10px 15px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Selected: {selectedTool}
          </div>
        )}
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </ErrorBoundary>
  )
}

export default App
