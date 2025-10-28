export type DiseaseInfo = {
  id: string;
  nameEn: string;
  nameAm: string;
  description: string;
  symptoms: string[];
  treatment: {
    immediate: string[];
    longTerm: string[];
  };
  prevention: string[];
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  image?: string;
};

export const DISEASE_INFO: Record<string, DiseaseInfo> = {
  early_blight: {
    id: 'early_blight',
    nameEn: 'Early Blight',
    nameAm: 'ጥቂት ብርሃን',
    description: 'A fungal disease that affects leaves, stems, and fruits of tomato plants',
    symptoms: [
      'Dark brown spots on older leaves',
      'Yellowing and browning of leaf edges',
      'Concentric rings in lesions',
      'Premature leaf drop',
    ],
    treatment: {
      immediate: [
        'Remove affected leaves immediately',
        'Apply copper-based fungicide',
        'Improve air circulation',
        'Avoid overhead watering',
      ],
      longTerm: [
        'Rotate crops yearly',
        'Use disease-resistant varieties',
        'Practice proper plant spacing',
        'Remove plant debris at season end',
      ],
    },
    prevention: [
      'Water at the base of plants',
      'Space plants 24-36 inches apart',
      'Mulch around plants',
      'Monitor plants weekly',
    ],
    severity: 'High',
    image: '🍃',
  },
  late_blight: {
    id: 'late_blight',
    nameEn: 'Late Blight',
    nameAm: 'ዘገየ ብርሃን',
    description: 'A destructive fungal disease affecting leaves, stems, and fruits',
    symptoms: [
      'Greasy-looking dark green or gray lesions',
      'White fungal growth on underside of leaves',
      'Rapid plant collapse',
      'Browning and rotting of fruits',
    ],
    treatment: {
      immediate: [
        'Remove all affected plants immediately',
        'Apply chlorothalonil or mancozeb',
        'Ensure proper drainage',
        'Destroy infected plant material',
      ],
      longTerm: [
        'Plant resistant varieties',
        'Practice crop rotation',
        'Improve garden drainage',
        'Remove volunteer plants',
      ],
    },
    prevention: [
      'Avoid overhead irrigation',
      'Provide adequate plant spacing',
      'Use drip irrigation',
      'Select resistant varieties',
    ],
    severity: 'Critical',
    image: '🦠',
  },
  healthy: {
    id: 'healthy',
    nameEn: 'Healthy',
    nameAm: 'ጤናማ',
    description: 'Your tomato plant shows no signs of disease',
    symptoms: [
      'Green, vibrant leaves',
      'Strong stem growth',
      'Normal fruit development',
    ],
    treatment: {
      immediate: [
        'Continue current care routine',
        'Monitor for any changes',
        'Maintain regular watering schedule',
      ],
      longTerm: [
        'Continue preventive measures',
        'Maintain soil health',
        'Provide consistent nutrition',
      ],
    },
    prevention: [
      'Maintain current good practices',
      'Regular monitoring',
      'Proper watering schedule',
      'Balanced fertilization',
    ],
    severity: 'Low',
    image: '✅',
  },
  leaf_mold: {
    id: 'leaf_mold',
    nameEn: 'Leaf Mold',
    nameAm: 'ወገብ ቅርጽ',
    description: 'A fungal disease that thrives in humid conditions',
    symptoms: [
      'Pale green spots on upper leaf surface',
      'Gray-brown velvety growth on underside',
      'Leaf curling and yellowing',
      'Defoliation in severe cases',
    ],
    treatment: {
      immediate: [
        'Remove affected leaves',
        'Improve ventilation',
        'Apply copper fungicide',
        'Reduce humidity around plants',
      ],
      longTerm: [
        'Use fungicide sprays preventively',
        'Control greenhouse humidity',
        'Plant resistant varieties',
        'Improve air circulation',
      ],
    },
    prevention: [
      'Maintain humidity below 90%',
      'Provide good air circulation',
      'Space plants properly',
      'Avoid wetting leaves',
    ],
    severity: 'Medium',
    image: '🌫️',
  },
  septoria_leaf_spot: {
    id: 'septoria_leaf_spot',
    nameEn: 'Septoria Leaf Spot',
    nameAm: 'ሴፕቶሪያ ወገብ ነጠብጣብ',
    description: 'Fungal disease causing small dark spots on leaves',
    symptoms: [
      'Small dark brown spots on leaves',
      'Yellow halos around spots',
      'Black fruiting bodies in center',
      'Progressive leaf yellowing',
    ],
    treatment: {
      immediate: [
        'Remove affected leaves',
        'Apply chlorothalonil',
        'Improve air circulation',
        'Water at base only',
      ],
      longTerm: [
        'Remove plant debris',
        'Rotate crops',
        'Use resistant varieties',
        'Sanitize garden tools',
      ],
    },
    prevention: [
      'Water early in the day',
      'Avoid overhead watering',
      'Keep leaves dry',
      'Remove lower leaves that touch soil',
    ],
    severity: 'Medium',
    image: '⚫',
  },
};

export function getDiseaseInfo(diseaseId: string): DiseaseInfo | null {
  return DISEASE_INFO[diseaseId] || null;
}

