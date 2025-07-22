import { Vector3, Color } from 'three'

// ============================================================================
// BUILDHIVE BRAND COLOR PALETTE
// ============================================================================

export const COLORS = {
  // Primary Brand Colors (Exact Specification)
  INDUSTRIAL_BLUE: '#1E3A8A',
  CONSTRUCTION_ORANGE: '#F97316',
  STEEL_GRAY: '#64748B',
  
  // Three.js Color Objects for Direct Use
  THREE_COLORS: {
    INDUSTRIAL_BLUE: new Color('#1E3A8A'),
    CONSTRUCTION_ORANGE: new Color('#F97316'),
    STEEL_GRAY: new Color('#64748B'),
    WHITE: new Color('#FFFFFF'),
    BLACK: new Color('#000000')
  },
  
  // Material-Specific Colors
  MATERIALS: {
    METAL_CHROME: new Color('#E5E7EB'),
    METAL_STEEL: new Color('#6B7280'),
    WOOD_HANDLE: new Color('#92400E'),
    PLASTIC_GRIP: new Color('#1F2937'),
    RUBBER_BLACK: new Color('#111827')
  }
} as const

// ============================================================================
// ANIMATION TIMING CONSTANTS (4-Second Loop)
// ============================================================================

export const TIMING = {
  // Main Loop Duration
  LOOP_DURATION: 4000, // 4 seconds total
  
  // Floating Motion (±20px amplitude, 2-second cycle)
  FLOAT_DURATION: 2000, // 2 seconds up/down
  FLOAT_AMPLITUDE: 20, // ±20px vertical movement
  
  // Rotation (360° Y-axis, 4 seconds)
  ROTATION_DURATION: 4000, // 4 seconds per full rotation
  
  // Easing Functions
  EASING: {
    SINE_IN_OUT: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)', // ease-in-out sine wave
    LINEAR: 'linear', // for rotation
    SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' // for physics
  },
  
  // Animation Delays
  STAGGER_DELAY: 200 // 0.2s between tool animations
} as const

// ============================================================================
// CANVAS DIMENSIONS (1920x1080 Responsive)
// ============================================================================

export const VIEWPORT = {
  // Target Canvas Size
  DEFAULT_WIDTH: 1920,
  DEFAULT_HEIGHT: 1080,
  ASPECT_RATIO: 1920 / 1080,
  
  // Responsive Breakpoints
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1440,
    ULTRAWIDE: 2560
  }
} as const

// ============================================================================
// 3D SCENE CONFIGURATION
// ============================================================================

export const SCENE_CONFIG = {
  // Camera Settings
  CAMERA: {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000,
    POSITION: new Vector3(0, 0, 5),
    TARGET: new Vector3(0, 0, 0)
  },
  
  // Tool Positions (Professional Layout)
  TOOL_POSITIONS: {
    HAMMER: new Vector3(-2.5, 1.2, 0),
    DRILL: new Vector3(2.5, 1.2, 0),
    LEVEL: new Vector3(-2.5, -1.2, 0),
    MEASURING_TAPE: new Vector3(2.5, -1.2, 0)
  },
  
  // Tool Scales
  TOOL_SCALES: {
    HAMMER: new Vector3(1.0, 1.0, 1.0),
    DRILL: new Vector3(0.8, 0.8, 0.8),
    LEVEL: new Vector3(1.2, 1.2, 1.2),
    MEASURING_TAPE: new Vector3(0.9, 0.9, 0.9)
  }
} as const

// ============================================================================
// PHYSICS SIMULATION CONSTANTS
// ============================================================================

export const PHYSICS_CONFIG = {
  // World Physics
  GRAVITY: new Vector3(0, -0.3, 0), // Subtle downward pull
  BUOYANCY_FORCE: 0.25, // Gentle upward resistance
  
  // Tool Physics Properties
  TOOL_MASS: 1.0,
  DAMPING: 0.15,
  ANGULAR_DAMPING: 0.1,
  
  // Simulation Settings
  ITERATIONS: 10,
  TOLERANCE: 0.001
} as const

// ============================================================================
// PARTICLE SYSTEM CONSTANTS (1,000+ GPU-Accelerated)
// ============================================================================

export const PARTICLE_CONFIG = {
  // Construction Dust Particles
  DUST: {
    COUNT: 1200,
    SIZE: 0.015,
    SIZE_VARIATION: 0.008,
    OPACITY: 0.25,
    OPACITY_VARIATION: 0.15,
    VELOCITY: new Vector3(0, 0.08, 0),
    VELOCITY_VARIATION: new Vector3(0.04, 0.04, 0.04),
    LIFESPAN: 4000,
    COLOR: COLORS.THREE_COLORS.STEEL_GRAY
  },
  
  // Tool-Specific Particles
  SPARKS: {
    COUNT: 800,
    SIZE: 0.02,
    SIZE_VARIATION: 0.01,
    OPACITY: 0.7,
    OPACITY_VARIATION: 0.3,
    VELOCITY: new Vector3(0, 0.15, 0),
    VELOCITY_VARIATION: new Vector3(0.08, 0.08, 0.08),
    LIFESPAN: 2000,
    COLOR: COLORS.THREE_COLORS.CONSTRUCTION_ORANGE
  }
} as const

// ============================================================================
// LIGHTING SYSTEM CONSTANTS
// ============================================================================

export const LIGHTING_CONFIG = {
  // HDR Environment
  HDR: {
    EXPOSURE: 1.0,
    BACKGROUND_INTENSITY: 0.3
  },
  
  // Ambient Lighting
  AMBIENT: {
    COLOR: COLORS.THREE_COLORS.WHITE,
    INTENSITY: 0.4
  },
  
  // Directional Light (Main)
  DIRECTIONAL: {
    COLOR: COLORS.THREE_COLORS.WHITE,
    INTENSITY: 1.2,
    POSITION: new Vector3(5, 8, 5),
    CAST_SHADOW: true,
    SHADOW_MAP_SIZE: 2048
  },
  
  // Point Lights (Accent)
  POINT_LIGHTS: [
    {
      COLOR: COLORS.THREE_COLORS.CONSTRUCTION_ORANGE,
      INTENSITY: 0.6,
      POSITION: new Vector3(-3, 2, 3),
      DISTANCE: 10,
      DECAY: 2
    },
    {
      COLOR: COLORS.THREE_COLORS.INDUSTRIAL_BLUE,
      INTENSITY: 0.5,
      POSITION: new Vector3(3, -2, 3),
      DISTANCE: 8,
      DECAY: 2
    }
  ]
} as const

// ============================================================================
// PBR MATERIAL CONSTANTS
// ============================================================================

export const MATERIAL_CONFIG = {
  // Metal Materials (Hammer, Drill)
  METAL: {
    COLOR: COLORS.MATERIALS.METAL_CHROME,
    ROUGHNESS: 0.2,
    METALNESS: 0.9,
    NORMAL_SCALE: 1.0,
    EMISSIVE: new Color('#000000'),
    EMISSIVE_INTENSITY: 0.0
  },
  
  // Wood Materials (Tool Handles)
  WOOD: {
    COLOR: COLORS.MATERIALS.WOOD_HANDLE,
    ROUGHNESS: 0.8,
    METALNESS: 0.0,
    NORMAL_SCALE: 0.5,
    EMISSIVE: new Color('#000000'),
    EMISSIVE_INTENSITY: 0.0
  },
  
  // Plastic Materials (Drill Housing)
  PLASTIC: {
    COLOR: COLORS.MATERIALS.PLASTIC_GRIP,
    ROUGHNESS: 0.4,
    METALNESS: 0.1,
    NORMAL_SCALE: 0.3,
    EMISSIVE: new Color('#000000'),
    EMISSIVE_INTENSITY: 0.0
  },
  
  // Rubber Materials (Grips)
  RUBBER: {
    COLOR: COLORS.MATERIALS.RUBBER_BLACK,
    ROUGHNESS: 0.9,
    METALNESS: 0.0,
    NORMAL_SCALE: 0.8,
    EMISSIVE: new Color('#000000'),
    EMISSIVE_INTENSITY: 0.0
  }
} as const

// ============================================================================
// POST-PROCESSING EFFECTS CONSTANTS
// ============================================================================

export const POST_PROCESSING_CONFIG = {
  // Bloom Effect
  BLOOM: {
    INTENSITY: 0.8,
    THRESHOLD: 0.9,
    SMOOTH_WIDTH: 0.01,
    RADIUS: 0.5
  },
  
  // Depth of Field
  DEPTH_OF_FIELD: {
    FOCUS_DISTANCE: 5.0,
    FOCAL_LENGTH: 0.02,
    BOKEH_SCALE: 2.0,
    HEIGHT: 480
  },
  
  // Film Grain
  FILM_GRAIN: {
    INTENSITY: 0.15,
    SIZE: 1.0,
    ANIMATED: true
  },
  
  // Color Grading
  COLOR_GRADING: {
    EXPOSURE: 0.1,
    BRIGHTNESS: 0.05,
    CONTRAST: 0.1,
    SATURATION: 0.2
  },
  
  // Motion Blur
  MOTION_BLUR: {
    INTENSITY: 0.5,
    SAMPLES: 32
  },
  
  // Volumetric Fog
  VOLUMETRIC_FOG: {
    DENSITY: 0.02,
    COLOR: COLORS.THREE_COLORS.STEEL_GRAY,
    NEAR: 1.0,
    FAR: 20.0
  }
} as const

// ============================================================================
// GESTURE CONTROL CONSTANTS
// ============================================================================

export const GESTURE_CONFIG = {
  // Multi-touch Settings
  PINCH_SENSITIVITY: 0.01,
  ROTATION_SENSITIVITY: 0.005,
  PAN_SENSITIVITY: 0.002,
  
  // Zoom Limits
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 3.0,
  
  // Haptic Feedback
  HAPTIC_INTENSITY: 0.3,
  HAPTIC_DURATION: 50
} as const

// ============================================================================
// PERFORMANCE OPTIMIZATION CONSTANTS
// ============================================================================

export const PERFORMANCE_CONFIG = {
  // Target Performance
  TARGET_FPS: 60,
  MIN_FPS: 30,
  
  // Adaptive Quality
  HIGH_QUALITY_PARTICLES: 1200,
  MEDIUM_QUALITY_PARTICLES: 800,
  LOW_QUALITY_PARTICLES: 400,
  
  // Shadow Quality
  HIGH_SHADOW_MAP_SIZE: 2048,
  MEDIUM_SHADOW_MAP_SIZE: 1024,
  LOW_SHADOW_MAP_SIZE: 512,
  
  // Render Settings
  ANTIALIAS: true,
  ALPHA: true,
  PRESERVE_DRAWING_BUFFER: false,
  POWER_PREFERENCE: 'high-performance' as const
} as const

// ============================================================================
// CONSTRUCTION INDUSTRY MESSAGING
// ============================================================================

export const CONSTRUCTION_MESSAGING = {
  TAGLINES: [
    'Professional Tools for Professional Results',
    'Build Your Future with BuildHive',
    'Connecting Skilled Contractors Nationwide',
    'Quality Work, Trusted Professionals',
    'Your Construction Partner'
  ],
  
  TOOL_DESCRIPTIONS: {
    HAMMER: 'Precision Framing & Finishing',
    DRILL: 'Power Tools for Every Project',
    LEVEL: 'Accuracy in Every Measurement',
    MEASURING_TAPE: 'Professional Grade Precision'
  }
} as const

// ============================================================================
// EXPORT ALL CONSTANTS
// ============================================================================

export {
  COLORS,
  TIMING,
  VIEWPORT,
  SCENE_CONFIG,
  PHYSICS_CONFIG,
  PARTICLE_CONFIG,
  LIGHTING_CONFIG,
  MATERIAL_CONFIG,
  POST_PROCESSING_CONFIG,
  GESTURE_CONFIG,
  PERFORMANCE_CONFIG,
  CONSTRUCTION_MESSAGING
}
