// result.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { predictFromUri } from '../../src/ml/inference';
import { initModel } from '../../src/ml/model';

const { width, height } = Dimensions.get('window');

// Mock data store
const mockDataStore = {
  '1': {
    diseaseId: 'early_blight',
    nameEn: 'Early Blight',
    nameAm: 'ጥቂት ብርሃን',
    confidence: 0.92,
    advice: 'Remove affected leaves; apply fungicide. Ensure proper spacing between plants for air circulation.',
    severity: 'High',
    prevention: 'Rotate crops yearly, avoid overhead watering, remove plant debris.',
    image: '🌱'
  },
  '2': {
    diseaseId: 'healthy',
    nameEn: 'Healthy',
    nameAm: 'ጤናማ',
    confidence: 0.95,
    advice: 'Your tomato plant is healthy! Continue regular care and monitoring.',
    severity: 'None',
    prevention: 'Maintain current practices, regular watering, and proper nutrition.',
    image: '✅'
  }
};

export default function ResultScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const uri = (params.uri as string) || undefined;
  const id = (params.id as string) || undefined;
  const [resultData, setResultData] = useState(
    (id ? mockDataStore[id as keyof typeof mockDataStore] : undefined) || mockDataStore['1']
  );
  const { theme } = useTheme();
  const tokens = Colors[theme];

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpTitle = useRef(new Animated.Value(40)).current;
  const slideUpCard = useRef(new Animated.Value(50)).current;
  const slideUpButtons = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const didAnimateRef = useRef(false);

  const handleSave = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Alert.alert(
        t('result.saveSuccess'),
        t('result.saveMessage'),
        [{ text: t('result.ok'), onPress: () => router.push('/tomatodx/history') }]
      );
    });
  };

  const handleShare = async () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      if (await Sharing.isAvailableAsync()) {
        const shareText = `${t('result.shareText')}\n${t('result.disease')}: ${resultData.nameEn}\n${t('result.confidence')}: ${Math.round(resultData.confidence * 100)}%\n${t('result.advice')}: ${resultData.advice}`;

        await Sharing.shareAsync('data:text/plain;charset=utf-8,' + encodeURIComponent(shareText), {
          mimeType: 'text/plain',
          dialogTitle: t('result.shareTitle')
        });
      } else {
        Alert.alert(t('result.shareError'), t('result.shareNotAvailable'));
      }
    } catch (error) {
      Alert.alert(t('result.shareError'), t('result.shareFailed'));
    }
  };

  useEffect(() => {
    // Progress animation tracks current result confidence
    Animated.timing(progressAnim, {
      toValue: resultData.confidence,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    if (didAnimateRef.current) return;
    didAnimateRef.current = true;

    // Main entrance animations (run once)
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(slideUpTitle, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 700, easing: Easing.elastic(1), useNativeDriver: true })
      ]),
      Animated.timing(slideUpCard, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(slideUpButtons, { toValue: 0, duration: 500, easing: Easing.out(Easing.back(1)), useNativeDriver: true })
    ]).start();
  }, [resultData.confidence]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!uri) return;
      try {
        await initModel();
        const pred = await predictFromUri(uri);
        if (cancelled) return;
        const severity = pred.confidence >= 0.9 ? 'High' : pred.confidence >= 0.7 ? 'Medium' : 'Low';
        setResultData({
          diseaseId: pred.label,
          nameEn: pred.label,
          nameAm: pred.label,
          confidence: pred.confidence,
          advice: 'Inspect leaves and follow local best practices.',
          severity,
          prevention: 'Ensure good airflow and remove affected leaves.',
          image: '🌿'
        });
      } catch (e) {
        // keep fallback
      }
    })();
    return () => { cancelled = true; };
  }, [uri]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return tokens.danger;
      case 'high': return tokens.warning;
      case 'medium': return tokens.warningDark;
      case 'low': return tokens.primaryDarker;
      default: return tokens.primaryDark;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'warning';
      case 'high': return 'alert-circle';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'leaf';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.background }]}>
      {/* Background Elements */}
      <Animated.View style={[styles.backgroundCircle, styles.circle1, { opacity: fadeAnim, backgroundColor: tokens.primaryOverlay }]} />
      <Animated.View style={[styles.backgroundCircle, styles.circle2, { opacity: fadeAnim, backgroundColor: tokens.successOverlay }]} />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideUpTitle },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <Text style={[styles.title, { color: tokens.primaryDark }]}>🔍 {t('result.title')}</Text>
        <Text style={[styles.subtitle, { color: tokens.muted }]}>{t("result.subtitle")}</Text>
      </Animated.View>

      {/* Result Card */}
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpCard }]
          }
        ]}
      >
        <View style={[styles.resultCard, { backgroundColor: tokens.surface, shadowColor: tokens.shadowLight }]}>
          {/* Disease Header */}
          <View style={styles.diseaseHeader}>
            <View style={styles.diseaseIconContainer}>
              <Text style={styles.diseaseIcon}>{resultData.image}</Text>
            </View>
            <View style={styles.diseaseInfo}>
              <Text style={[styles.diseaseName, { color: tokens.text }]}>{resultData.nameEn}</Text>
              <Text style={[styles.diseaseNameAm, { color: tokens.muted }]}>{resultData.nameAm}</Text>
            </View>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(resultData.severity) + '20' }
              ]}
            >
              <Ionicons
                name={getSeverityIcon(resultData.severity) as any}
                size={16}
                color={getSeverityColor(resultData.severity)}
              />
              <Text
                style={[
                  styles.severityText,
                  { color: getSeverityColor(resultData.severity) }
                ]}
              >
                {resultData.severity}
              </Text>
            </View>
          </View>

          {/* Confidence Meter */}
          <View style={styles.confidenceSection}>
            <View style={styles.confidenceHeader}>
              <Text style={[styles.confidenceLabel, { color: tokens.textSecondary }]}>{t("result.confidenceLevel")}</Text>
              <Animated.Text style={[styles.confidenceValue, { color: tokens.primaryDark }]}>
                {Math.round(resultData.confidence * 100)}%
              </Animated.Text>
            </View>
            <View style={[styles.confidenceBar, { backgroundColor: tokens.backgroundAlt }]}>
              <Animated.View
                style={[
                  styles.confidenceFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }),
                    backgroundColor: getSeverityColor(resultData.severity)
                  }
                ]}
              />
            </View>
          </View>

          {/* Advice Section */}
          <View style={styles.adviceSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={20} color={tokens.warning} />
              <Text style={styles.sectionTitle}>{t('result.recommendation')}</Text>
            </View>
            <Text style={[styles.adviceText, { color: tokens.textSecondary }]}>{resultData.advice}</Text>
          </View>

          {/* Prevention Section */}
          <View style={styles.preventionSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={20} color={tokens.success} />
              <Text style={styles.sectionTitle}>{t('result.prevTips')} </Text>
            </View>
            <Text style={[styles.preventionText, { color: tokens.muted }]}>{resultData.prevention}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.actionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpButtons }]
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: tokens.primary, shadowColor: tokens.primary }]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Ionicons name="save" size={24} color={tokens.whiteMuted} />
            <Text style={[styles.saveButtonText, { color: tokens.whiteMuted }]}>{t('result.save')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share" size={24} color={tokens.text} />
            <Text style={[styles.shareButtonText, { color: tokens.text }]}>{t('result.share')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffc',
  },
  // Background elements
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 500,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -80,
    right: -80,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -50,
    left: -50,
    backgroundColor: 'rgba(134, 239, 172, 0.05)',
  },
  // Header
  header: {
    paddingHorizontal: 12,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#166534',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Card container
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    // marginBottom:20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  // Disease header
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  diseaseIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#dcfce7',
  },
  diseaseIcon: {
    fontSize: 24,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  diseaseNameAm: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  severityText: {
    fontSize: 14,
    fontWeight: '700',
  },
  // Confidence section
  confidenceSection: {
    marginBottom: 24,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
  },
  confidenceBar: {
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 6,
  },
  // Advice section
  adviceSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569ff',
  },
  adviceText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    fontWeight: '500',
  },
  // Prevention section
  preventionSection: {
    marginBottom: 8,
  },
  preventionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    fontWeight: '500',
  },
  // Actions
  actionsContainer: {
    // paddingHorizontal: 20,
    paddingTop: 13,
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 6,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1e40af',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shareButtonText: {
    color: '#1e40af',
    fontSize: 18,
    fontWeight: '700',
  },
})