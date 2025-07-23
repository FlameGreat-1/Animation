import React, { useMemo } from 'react'
import { MeshStandardMaterial, MeshPhysicalMaterial, Color } from 'three'
import { MATERIAL_CONFIG, COLORS } from '../../utils/constants'
import {
  createMetalAlbedoTexture,
  createMetalNormalTexture,
  createMetalRoughnessTexture,
  createWoodAlbedoTexture,
  createWoodNormalTexture,
  createPlasticAlbedoTexture,
  createPlasticNormalTexture,
  createRubberAlbedoTexture,
  createRubberNormalTexture
} from '../../utils/textureGenerators'

interface MaterialProps {
  type: 'metal' | 'wood' | 'plastic' | 'rubber'
  variant?: 'chrome' | 'steel' | 'oak' | 'pine' | 'black' | 'yellow'
  roughness?: number
  metalness?: number
  normalScale?: number
  emissiveIntensity?: number
}

export function PBRMaterial({ 
  type, 
  variant = 'chrome',
  roughness,
  metalness,
  normalScale,
  emissiveIntensity 
}: MaterialProps) {
  const material = useMemo(() => {
    switch (type) {
      case 'metal':
        return createMetalMaterial(variant, roughness, metalness, normalScale, emissiveIntensity)
      case 'wood':
        return createWoodMaterial(variant, roughness, metalness, normalScale, emissiveIntensity)
      case 'plastic':
        return createPlasticMaterial(variant, roughness, metalness, normalScale, emissiveIntensity)
      case 'rubber':
        return createRubberMaterial(variant, roughness, metalness, normalScale, emissiveIntensity)
      default:
        return createMetalMaterial('chrome')
    }
  }, [type, variant, roughness, metalness, normalScale, emissiveIntensity])

  return <primitive object={material} />
}

function createMetalMaterial(
  variant: string = 'chrome',
  roughnessOverride?: number,
  metalnessOverride?: number,
  normalScaleOverride?: number,
  emissiveIntensityOverride?: number
): MeshPhysicalMaterial {
  const albedoTexture = createMetalAlbedoTexture(512)
  const normalTexture = createMetalNormalTexture(512)
  const roughnessTexture = createMetalRoughnessTexture(512)

  const baseColor = variant === 'steel' ? 
    COLORS.MATERIALS.METAL_STEEL : 
    COLORS.MATERIALS.METAL_CHROME

  const material = new MeshPhysicalMaterial({
    map: albedoTexture,
    normalMap: normalTexture,
    roughnessMap: roughnessTexture,
    color: baseColor,
    roughness: roughnessOverride ?? MATERIAL_CONFIG.METAL.ROUGHNESS,
    metalness: metalnessOverride ?? MATERIAL_CONFIG.METAL.METALNESS,
    normalScale: normalScaleOverride ?? MATERIAL_CONFIG.METAL.NORMAL_SCALE,
    emissive: MATERIAL_CONFIG.METAL.EMISSIVE,
    emissiveIntensity: emissiveIntensityOverride ?? MATERIAL_CONFIG.METAL.EMISSIVE_INTENSITY,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
    reflectivity: 0.9,
    envMapIntensity: 1.2,
    transparent: false,
    side: 2
  })

  return material
}

function createWoodMaterial(
  variant: string = 'oak',
  roughnessOverride?: number,
  metalnessOverride?: number,
  normalScaleOverride?: number,
  emissiveIntensityOverride?: number
): MeshStandardMaterial {
  const albedoTexture = createWoodAlbedoTexture(512)
  const normalTexture = createWoodNormalTexture(512)

  const material = new MeshStandardMaterial({
    map: albedoTexture,
    normalMap: normalTexture,
    color: COLORS.MATERIALS.WOOD_HANDLE,
    roughness: roughnessOverride ?? MATERIAL_CONFIG.WOOD.ROUGHNESS,
    metalness: metalnessOverride ?? MATERIAL_CONFIG.WOOD.METALNESS,
    normalScale: normalScaleOverride ?? MATERIAL_CONFIG.WOOD.NORMAL_SCALE,
    emissive: MATERIAL_CONFIG.WOOD.EMISSIVE,
    emissiveIntensity: emissiveIntensityOverride ?? MATERIAL_CONFIG.WOOD.EMISSIVE_INTENSITY,
    envMapIntensity: 0.3,
    transparent: false,
    side: 2
  })

  return material
}

function createPlasticMaterial(
  variant: string = 'black',
  roughnessOverride?: number,
  metalnessOverride?: number,
  normalScaleOverride?: number,
  emissiveIntensityOverride?: number
): MeshPhysicalMaterial {
  const albedoTexture = createPlasticAlbedoTexture(512)
  const normalTexture = createPlasticNormalTexture(512)

  const baseColor = variant === 'yellow' ? 
    COLORS.THREE_COLORS.CONSTRUCTION_ORANGE : 
    COLORS.MATERIALS.PLASTIC_GRIP

  const material = new MeshPhysicalMaterial({
    map: albedoTexture,
    normalMap: normalTexture,
    color: baseColor,
    roughness: roughnessOverride ?? MATERIAL_CONFIG.PLASTIC.ROUGHNESS,
    metalness: metalnessOverride ?? MATERIAL_CONFIG.PLASTIC.METALNESS,
    normalScale: normalScaleOverride ?? MATERIAL_CONFIG.PLASTIC.NORMAL_SCALE,
    emissive: MATERIAL_CONFIG.PLASTIC.EMISSIVE,
    emissiveIntensity: emissiveIntensityOverride ?? MATERIAL_CONFIG.PLASTIC.EMISSIVE_INTENSITY,
    clearcoat: 0.1,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.5,
    transparent: false,
    side: 2
  })

  return material
}

function createRubberMaterial(
  variant: string = 'black',
  roughnessOverride?: number,
  metalnessOverride?: number,
  normalScaleOverride?: number,
  emissiveIntensityOverride?: number
): MeshStandardMaterial {
  const albedoTexture = createRubberAlbedoTexture(512)
  const normalTexture = createRubberNormalTexture(512)

  const material = new MeshStandardMaterial({
    map: albedoTexture,
    normalMap: normalTexture,
    color: COLORS.MATERIALS.RUBBER_BLACK,
    roughness: roughnessOverride ?? MATERIAL_CONFIG.RUBBER.ROUGHNESS,
    metalness: metalnessOverride ?? MATERIAL_CONFIG.RUBBER.METALNESS,
    normalScale: normalScaleOverride ?? MATERIAL_CONFIG.RUBBER.NORMAL_SCALE,
    emissive: MATERIAL_CONFIG.RUBBER.EMISSIVE,
    emissiveIntensity: emissiveIntensityOverride ?? MATERIAL_CONFIG.RUBBER.EMISSIVE_INTENSITY,
    envMapIntensity: 0.1,
    transparent: false,
    side: 2
  })

  return material
}

export function HammerMaterials() {
  return (
    <>
      <PBRMaterial type="metal" variant="steel" />
      <PBRMaterial type="wood" variant="oak" />
      <PBRMaterial type="rubber" variant="black" />
    </>
  )
}

export function DrillMaterials() {
  return (
    <>
      <PBRMaterial type="metal" variant="chrome" />
      <PBRMaterial type="plastic" variant="black" />
      <PBRMaterial type="plastic" variant="yellow" />
      <PBRMaterial type="rubber" variant="black" />
    </>
  )
}

export function LevelMaterials() {
  return (
    <>
      <PBRMaterial type="metal" variant="chrome" />
      <PBRMaterial type="plastic" variant="yellow" />
      <PBRMaterial type="rubber" variant="black" />
    </>
  )
}

export function MeasuringTapeMaterials() {
  return (
    <>
      <PBRMaterial type="plastic" variant="yellow" />
      <PBRMaterial type="metal" variant="steel" />
      <PBRMaterial type="rubber" variant="black" />
    </>
  )
}

export function createConstructionMaterial(
  category: 'electrical' | 'plumbing' | 'carpentry' | 'painting' | 'roofing' | 'hvac' | 'landscaping' | 'cleaning' | 'handyman' | 'general'
): MeshPhysicalMaterial {
  const materialConfigs = {
    electrical: {
      color: new Color('#FFD700'),
      roughness: 0.3,
      metalness: 0.8,
      emissive: new Color('#FFA500'),
      emissiveIntensity: 0.1
    },
    plumbing: {
      color: new Color('#4682B4'),
      roughness: 0.4,
      metalness: 0.7,
      emissive: new Color('#000000'),
      emissiveIntensity: 0.0
    },
    carpentry: {
      color: new Color('#8B4513'),
      roughness: 0.8,
      metalness: 0.1,
      emissive: new Color('#000000'),
      emissiveIntensity: 0.0
    },
    painting: {
      color: COLORS.THREE_COLORS.CONSTRUCTION_ORANGE,
      roughness: 0.6,
      metalness: 0.2,
      emissive: new Color('#000000'),
      emissiveIntensity: 0.0
    },
    roofing: {
      color: new Color('#696969'),
      roughness: 0.7,
      metalness: 0.5,
      emissive: new Color('#000000'),
      emissiveIntensity: 0.0
    },
    hvac: {
      color: new Color('#C0C0C0'),
      roughness: 0.3,
      metalness: 0.9,
      emissive: new Color('#000000'),
      emissiveIntensity: 0.0
    },
    landscaping: {
      color: new Color('#228B22'),
      roughness: 0.9,
      metalness: 0.0,
      emissive: new Color('#000000'),
      emissiveIntensity: 0.0
    },
    cleaning: {
      color: new Color('#87CEEB'),
      roughness: 0.2,
      metalness: 0.1,
      emissive: new Color('#000000'),
      emissiveIntensity: 0.0
    },
    handyman: {
      color: COLORS.THREE_COLORS.STEEL_GRAY,
      roughness: 0.5,
      metalness: 0.6,
      emissive: new Color('#000000'),
      emissiveIntensity: 0.0
    },
    general: {
      color: COLORS.THREE_COLORS.INDUSTRIAL_BLUE,
      roughness: 0.4,
      metalness: 0.3,
      emissive: new Color('#000000'),
      emissiveIntensity: 0.0
    }
  }

  const config = materialConfigs[category]
  
  return new MeshPhysicalMaterial({
    color: config.color,
    roughness: config.roughness,
    metalness: config.metalness,
    emissive: config.emissive,
    emissiveIntensity: config.emissiveIntensity,
    clearcoat: 0.2,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.8,
    transparent: false,
    side: 2
  })
}

export function MaterialPresets() {
  const presets = useMemo(() => ({
    professionalMetal: new MeshPhysicalMaterial({
      color: COLORS.MATERIALS.METAL_CHROME,
      roughness: 0.15,
      metalness: 0.95,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      envMapIntensity: 1.5
    }),
    
    industrialSteel: new MeshPhysicalMaterial({
      color: COLORS.MATERIALS.METAL_STEEL,
      roughness: 0.25,
      metalness: 0.9,
      clearcoat: 0.2,
      clearcoatRoughness: 0.3,
      envMapIntensity: 1.0
    }),
    
    constructionWood: new MeshStandardMaterial({
      color: COLORS.MATERIALS.WOOD_HANDLE,
      roughness: 0.85,
      metalness: 0.0,
      envMapIntensity: 0.2
    }),
    
    safetyPlastic: new MeshPhysicalMaterial({
      color: COLORS.THREE_COLORS.CONSTRUCTION_ORANGE,
      roughness: 0.4,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
      envMapIntensity: 0.6
    }),
    
    gripRubber: new MeshStandardMaterial({
      color: COLORS.MATERIALS.RUBBER_BLACK,
      roughness: 0.95,
      metalness: 0.0,
      envMapIntensity: 0.05
    })
  }), [])

  return presets
}

export function OptimizedMaterial({ 
  type, 
  performanceLevel = 'high' 
}: { 
  type: 'metal' | 'wood' | 'plastic' | 'rubber'
  performanceLevel?: 'low' | 'medium' | 'high'
}) {
  const material = useMemo(() => {
    const baseConfig = MATERIAL_CONFIG[type.toUpperCase() as keyof typeof MATERIAL_CONFIG]
    
    if (performanceLevel === 'low') {
      return new MeshStandardMaterial({
        color: baseConfig.COLOR,
        roughness: baseConfig.ROUGHNESS,
        metalness: baseConfig.METALNESS
      })
    }
    
    if (performanceLevel === 'medium') {
      return new MeshStandardMaterial({
        color: baseConfig.COLOR,
        roughness: baseConfig.ROUGHNESS,
        metalness: baseConfig.METALNESS,
        envMapIntensity: 0.5
      })
    }
    
    return new MeshPhysicalMaterial({
      color: baseConfig.COLOR,
      roughness: baseConfig.ROUGHNESS,
      metalness: baseConfig.METALNESS,
      normalScale: baseConfig.NORMAL_SCALE,
      emissive: baseConfig.EMISSIVE,
      emissiveIntensity: baseConfig.EMISSIVE_INTENSITY,
      clearcoat: type === 'metal' ? 0.5 : 0.1,
      clearcoatRoughness: type === 'metal' ? 0.1 : 0.3,
      envMapIntensity: type === 'metal' ? 1.2 : 0.3
    })
  }, [type, performanceLevel])

  return <primitive object={material} />
}

export { PBRMaterial as default }
