export type DiseaseInfo = {
  id: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  image?: string;
};

export const DISEASE_IDS = {
  EARLY_BLIGHT: 'early_blight',
  LATE_BLIGHT: 'late_blight',
  HEALTHY: 'healthy',
  LEAF_MOLD: 'leaf_mold',
  SEPTORIA_LEAF_SPOT: 'septoria_leaf_spot',
  TOMATO_YELLOW_LEAF_CURL: 'tomato_yellow_leaf_curl',
  TARGET_SPOT: 'target_spot',
  SPIDER_MITES_TWO_SPOTTED_SPIDER_MITES: 'spider_mites_two_spotted_spider_mites',
  TOMATO_MOSAIC_VIRUS: 'tomato_mosaic_virus',
  BACTERIAL_SPOT: 'bacterial_spot',
};

export const DISEASE_INFO: Record<string, DiseaseInfo> = {
  early_blight: {
    id: 'early_blight',
    severity: 'High',
    image: '🍂',
  },
  late_blight: {
    id: 'late_blight',
    severity: 'Critical',
    image: '🔥',
  },
  healthy: {
    id: 'healthy',
    severity: 'Low',
    image: '✅',
  },
  leaf_mold: {
    id: 'leaf_mold',
    severity: 'Medium',
    image: '🍄',
  },
  septoria_leaf_spot: {
    id: 'septoria_leaf_spot',
    severity: 'Medium',
    image: '🔴',
  },
  tomato_yellow_leaf_curl: {
    id: 'tomato_yellow_leaf_curl',
    severity: 'Medium',
    image: '🔄',
  },
  target_spot: {
    id: 'target_spot',
    severity: 'Medium',
    image: '🎯',
  },
  spider_mites_two_spotted_spider_mites: {
    id: 'spider_mites_two_spotted_spider_mites',
    severity: 'Medium',
    image: '🕷️',
  },
  tomato_mosaic_virus: {
    id: 'tomato_mosaic_virus',
    severity: 'Medium',
    image: '🧩',
  },
  bacterial_spot: {
    id: 'bacterial_spot',
    severity: 'Medium',
    image: '💧',
  },
};

export function getDiseaseInfo(diseaseId: string): DiseaseInfo | null {
  return DISEASE_INFO[diseaseId] || null;
}

export function getDiseaseName(diseaseId: string, language: string): string {
  if (language === 'am') {
    return `diseases.${diseaseId}.name`;
  }
  return `diseases.${diseaseId}.name`;
}

export function getDiseaseDescription(diseaseId: string, language: string): string {
  return `diseases.${diseaseId}.description`;
}

export function getDiseaseSymptoms(diseaseId: string): string {
  return `diseases.${diseaseId}.symptoms`;
}

export function getDiseaseTreatmentImmediate(diseaseId: string): string {
  return `diseases.${diseaseId}.treatment.immediate`;
}

export function getDiseaseTreatmentLongTerm(diseaseId: string): string {
  return `diseases.${diseaseId}.treatment.longTerm`;
}

export function getDiseasePrevention(diseaseId: string): string {
  return `diseases.${diseaseId}.prevention`;
}

