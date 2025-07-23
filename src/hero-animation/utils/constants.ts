import { Vector3, Color } from 'three'

export const COLORS = {
  INDUSTRIAL_BLUE: '#1E3A8A',
  CONSTRUCTION_ORANGE: '#F97316',
  STEEL_GRAY: '#64748B',
  
  THREE_COLORS: {
    INDUSTRIAL_BLUE: new Color('#1E3A8A'),
    CONSTRUCTION_ORANGE: new Color('#F97316'),
    STEEL_GRAY: new Color('#64748B'),
    WHITE: new Color('#FFFFFF'),
    BLACK: new Color('#000000')
  },
  
  MATERIALS: {
    METAL_CHROME: new Color('#E5E7EB'),
    METAL_STEEL: new Color('#6B7280'),
    WOOD_HANDLE: new Color('#92400E'),
    PLASTIC_GRIP: new Color('#1F2937'),
    RUBBER_BLACK: new Color('#111827')
  }
} as const

export const TIMING = {
  LOOP_DURATION: 4000,
  FLOAT_DURATION: 2000,
  FLOAT_AMPLITUDE: 20,
  ROTATION_DURATION: 4000,
  
  EASING: {
    SINE_IN_OUT: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
    LINEAR: 'linear',
    SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  
  STAGGER_DELAY: 200
} as const

export const VIEWPORT = {
  DEFAULT_WIDTH: 1920,
  DEFAULT_HEIGHT: 1080,
  ASPECT_RATIO: 1920 / 1080,
  
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1440,
    ULTRAWIDE: 2560
  }
} as const

export const SCENE_CONFIG = {
  CAMERA: {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000,
    POSITION: new Vector3(0, 0, 5),
    TARGET: new Vector3(0, 0, 0)
  },
  
  TOOL_POSITIONS: {
    HAMMER: new Vector3(-2.5, 1.2, 0),
    DRILL: new Vector3(2.5, 1.2, 0),
    LEVEL: new Vector3(-2.5, -1.2, 0),
    MEASURING_TAPE: new Vector3(2.5, -1.2, 0)
  },
  
  TOOL_SCALES: {
    HAMMER: new Vector3(1.0, 1.0, 1.0),
    DRILL: new Vector3(0.8, 0.8, 0.8),
    LEVEL: new Vector3(1.2, 1.2, 1.2),
    MEASURING_TAPE: new Vector3(0.9, 0.9, 0.9)
  }
} as const

export const PHYSICS_CONFIG = {
  GRAVITY: new Vector3(0, -0.3, 0),
  BUOYANCY_FORCE: 0.25,
  TOOL_MASS: 1.0,
  DAMPING: 0.15,
  ANGULAR_DAMPING: 0.1,
  ITERATIONS: 10,
  TOLERANCE: 0.001
} as const

export const PARTICLE_CONFIG = {
  DUST: {
    COUNT: 1200,
    SIZE: 0.015,
    SIZE_VARIATION: 0.008,
    OPACITY: 0.25,
    OPACITY_VARIATION: 0.15,
    VELOCITY: new Vector3(0, 0.08, 0),
    VELOCITY_VARIATION: new Vector3(0.04, 0.04, 0.04),
    LIFESPAN: 4000,
    COLOR: new Color('#64748B')
  },
  
  SPARKS: {
    COUNT: 800,
    SIZE: 0.02,
    SIZE_VARIATION: 0.01,
    OPACITY: 0.7,
    OPACITY_VARIATION: 0.3,
    VELOCITY: new Vector3(0, 0.15, 0),
    VELOCITY_VARIATION: new Vector3(0.08, 0.08, 0.08),
    LIFESPAN: 2000,
    COLOR: new Color('#F97316')
  }
} as const

export const LIGHTING_CONFIG = {
  HDR: {
    EXPOSURE: 1.0,
    BACKGROUND_INTENSITY: 0.3
  },
  
  AMBIENT: {
    COLOR: new Color('#FFFFFF'),
    INTENSITY: 0.4
  },
  
  DIRECTIONAL: {
    COLOR: new Color('#FFFFFF'),
    INTENSITY: 1.2,
    POSITION: new Vector3(5, 8, 5),
    CAST_SHADOW: true,
    SHADOW_MAP_SIZE: 2048
  },
  
  POINT_LIGHTS: [
    {
      COLOR: new Color('#F97316'),
      INTENSITY: 0.6,
      POSITION: new Vector3(-3, 2, 3),
      DISTANCE: 10,
      DECAY: 2
    },
    {
      COLOR: new Color('#1E3A8A'),
      INTENSITY: 0.5,
      POSITION: new Vector3(3, -2, 3),
      DISTANCE: 8,
      DECAY: 2
    }
  ]
} as const

export const MATERIAL_CONFIG = {
  METAL: {
    COLOR: new Color('#E5E7EB'),
    ROUGHNESS: 0.2,
    METALNESS: 0.9,
    NORMAL_SCALE: 1.0,
    EMISSIVE: new Color('#000000'),
    EMISSIVE_INTENSITY: 0.0
  },
  
  WOOD: {
    COLOR: new Color('#92400E'),
    ROUGHNESS: 0.8,
    METALNESS: 0.0,
    NORMAL_SCALE: 0.5,
    EMISSIVE: new Color('#000000'),
    EMISSIVE_INTENSITY: 0.0
  },
  
  PLASTIC: {
    COLOR: new Color('#1F2937'),
    ROUGHNESS: 0.4,
    METALNESS: 0.1,
    NORMAL_SCALE: 0.3,
    EMISSIVE: new Color('#000000'),
    EMISSIVE_INTENSITY: 0.0
  },
  
  RUBBER: {
    COLOR: new Color('#111827'),
    ROUGHNESS: 0.9,
    METALNESS: 0.0,
    NORMAL_SCALE: 0.8,
    EMISSIVE: new Color('#000000'),
    EMISSIVE_INTENSITY: 0.0
  }
} as const

export const POST_PROCESSING_CONFIG = {
  BLOOM: {
    INTENSITY: 0.8,
    THRESHOLD: 0.9,
    SMOOTH_WIDTH: 0.01,
    RADIUS: 0.5
  },
  
  DEPTH_OF_FIELD: {
    FOCUS_DISTANCE: 5.0,
    FOCAL_LENGTH: 0.02,
    BOKEH_SCALE: 2.0,
    HEIGHT: 480
  },
  
  FILM_GRAIN: {
    INTENSITY: 0.15,
    SIZE: 1.0,
    ANIMATED: true
  },
  
  COLOR_GRADING: {
    EXPOSURE: 0.1,
    BRIGHTNESS: 0.05,
    CONTRAST: 0.1,
    SATURATION: 0.2
  },
  
  MOTION_BLUR: {
    INTENSITY: 0.5,
    SAMPLES: 32
  },
  
  VOLUMETRIC_FOG: {
    DENSITY: 0.02,
    COLOR: new Color('#64748B'),
    NEAR: 1.0,
    FAR: 20.0
  }
} as const

export const GESTURE_CONFIG = {
  PINCH_SENSITIVITY: 0.01,
  ROTATION_SENSITIVITY: 0.005,
  PAN_SENSITIVITY: 0.002,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 3.0,
  HAPTIC_INTENSITY: 0.3,
  HAPTIC_DURATION: 50
} as const

export const PERFORMANCE_CONFIG = {
  TARGET_FPS: 60,
  MIN_FPS: 30,
  HIGH_QUALITY_PARTICLES: 1200,
  MEDIUM_QUALITY_PARTICLES: 800,
  LOW_QUALITY_PARTICLES: 400,
  HIGH_SHADOW_MAP_SIZE: 2048,
  MEDIUM_SHADOW_MAP_SIZE: 1024,
  LOW_SHADOW_MAP_SIZE: 512,
  ANTIALIAS: true,
  ALPHA: true,
  PRESERVE_DRAWING_BUFFER: false,
  POWER_PREFERENCE: 'high-performance' as const
} as const

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
