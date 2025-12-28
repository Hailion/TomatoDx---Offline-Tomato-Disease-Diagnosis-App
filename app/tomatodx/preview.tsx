// app/tomatodx/preview.tsx - Preview Screen
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { deleteDiagnosis, insertDiagnosis, insertImage, upsertDisease } from '../../src/db/repository';

// Research service constants
const RESEARCH_OPT_IN_KEY = '@tomatodx_research_opt_in';
const RESEARCH_UPLOAD_COUNT_KEY = '@tomatodx_research_upload_count';
const RESEARCH_LAST_UPLOAD_KEY = '@tomatodx_research_last_upload';
const MAX_UPLOADS_PER_DAY = 10;
const MIN_UPLOAD_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface DiagnosisData {
  diseaseId: string;
  diseaseName: string;
  confidence: number;
  diagnosedAt: string;
}

// Research service functions
const isResearchOptedIn = async (): Promise<boolean> => {
  try {
    const optIn = await AsyncStorage.getItem(RESEARCH_OPT_IN_KEY);
    return optIn === 'true';
  } catch (error) {
    console.error('Error checking research opt-in:', error);
    return false;
  }
};

const canUploadForResearch = async (): Promise<boolean> => {
  try {
    const [totalUploads, lastUploadDate] = await Promise.all([
      AsyncStorage.getItem(RESEARCH_UPLOAD_COUNT_KEY),
      AsyncStorage.getItem(RESEARCH_LAST_UPLOAD_KEY)
    ]);

    // Check daily limit (simplified)
    const total = parseInt(totalUploads || '0', 10);
    if (total >= MAX_UPLOADS_PER_DAY) {
      return false;
    }

    // Check minimum interval
    if (lastUploadDate) {
      const lastUpload = new Date(lastUploadDate).getTime();
      const now = Date.now();
      if (now - lastUpload < MIN_UPLOAD_INTERVAL) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking upload limits:', error);
    return false;
  }
};

const shareForResearch = async (imageUri: string, diagnosis: DiagnosisData): Promise<void> => {
  try {
    // Check if user opted in
    const isOptedIn = await isResearchOptedIn();
    if (!isOptedIn) {
      console.log('User not opted in for research sharing');
      return;
    }

    // Check rate limits
    const canUpload = await canUploadForResearch();
    if (!canUpload) {
      console.log('Upload rate limit exceeded');
      return;
    }

    // Anonymize image
    const anonymizedImage = await manipulateAsync(
      imageUri,
      [{ resize: { width: 224, height: 224 } }],
      {
        compress: 0.8,
        format: SaveFormat.JPEG,
        base64: false
      }
    );

    // Generate anonymous data
    const researchData = {
      imageHash: `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      diagnosis: {
        diseaseName: diagnosis.diseaseName,
        confidence: diagnosis.confidence,
        diagnosedAt: new Date(diagnosis.diagnosedAt).toISOString()
      },
      deviceInfo: {
        platform: 'mobile',
        appVersion: '1.0.0',
        modelVersion: '1.0.0'
      },
      timestamp: Date.now(),
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Log research data (in production, this would upload to server)
    console.log('📊 Research Data Shared:', {
      imageHash: researchData.imageHash,
      diagnosis: researchData.diagnosis.diseaseName,
      confidence: researchData.diagnosis.confidence,
      timestamp: new Date(researchData.timestamp).toISOString()
    });

    // Update upload stats
    const currentCount = parseInt(await AsyncStorage.getItem(RESEARCH_UPLOAD_COUNT_KEY) || '0', 10);
    await Promise.all([
      AsyncStorage.setItem(RESEARCH_UPLOAD_COUNT_KEY, (currentCount + 1).toString()),
      AsyncStorage.setItem(RESEARCH_LAST_UPLOAD_KEY, new Date().toISOString())
    ]);

    console.log('✅ Research data shared successfully');
  } catch (error) {
    console.error('❌ Error sharing research data:', error);
  }
};

const { width } = Dimensions.get('window');

export default function PreviewScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const colors = Colors[theme];
  const [analyzing, setAnalyzing] = useState(false);
  const [showLowConfidenceModal, setShowLowConfidenceModal] = useState(false);
  const [pendingResult, setPendingResult] = useState<{
    prediction: any;
    imageId: string;
    diagnosisId: string;
    diseaseId: string;
  } | null>(null);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const startAnimations = useCallback(() => {
    scaleAnim.setValue(0.9);
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim, slideAnim]);

  useFocusEffect(
    useCallback(() => {
      startAnimations();
    }, [startAnimations])
  );

  const handleAnalyze = async () => {
    if (!uri) {
      Alert.alert(t('preview.error'), t('preview.noImage'));
      return;
    }

    setAnalyzing(true);

    try {
      // Dynamically import TensorFlow.js ML modules only when needed
      // This reduces initial bundle size significantly
      const [{ initModel }, { predictFromUri }] = await Promise.all([
        import('../../src/ml/model'),
        import('../../src/ml/inference'),
      ]);

      // Initialize ML model
      await initModel();

      // Run prediction
      const prediction = await predictFromUri(uri as string);

      // Generate unique IDs
      const imageId = `img_${Date.now()}`;
      const diagnosisId = `diag_${Date.now()}`;
      const diseaseId = prediction.label.toLowerCase().replace(/\s+/g, '_');

      // Save image to database
      insertImage(imageId, uri as string, new Date().toISOString(), 'device');

      // Save or update disease info
      upsertDisease(
        diseaseId,
        prediction.label, // English name
        undefined,             // no Amharic here – use translations instead
        '',               // symptoms
        ''                // advice
      );

      // Save diagnosis
      insertDiagnosis(
        diagnosisId,
        imageId,
        diseaseId,
        prediction.confidence,
        new Date().toISOString()
      );

      // Debug: Log prediction details
      console.log('🔍 Preview Debug - Prediction object:', {
        label: prediction.label,
        confidence: prediction.confidence,
        type: typeof prediction.confidence
      });

      // Share for research if user opted in (async, non-blocking)
      const diagnosisData: DiagnosisData = {
        diseaseId,
        diseaseName: prediction.label,
        confidence: prediction.confidence,
        diagnosedAt: new Date().toISOString()
      };

      console.log('🔍 Preview Debug - DiagnosisData:', diagnosisData);

      // Share research data in background (don't await to avoid blocking UI)
      shareForResearch(uri as string, diagnosisData).catch(error => {
        console.log('Research sharing failed (non-critical):', error);
      });

      setAnalyzing(false);

      // Check confidence threshold
      if (prediction.confidence < 0.7) {
        // Show low confidence modal
        setPendingResult({
          prediction,
          imageId,
          diagnosisId,
          diseaseId,
        });
        setShowLowConfidenceModal(true);
      } else {
        // Navigate to result screen directly
        router.push(`/tomatodx/result?id=${diagnosisId}`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalyzing(false);
      Alert.alert(
        t('preview.error'),
        t('preview.analysisError') + ': ' + (error as Error).message
      );
    }
  };

  const handleRetake = () => {
    router.back();
  };

  const handleLowConfidenceRetake = () => {
    if (pendingResult) {
      try {
        deleteDiagnosis(pendingResult.diagnosisId);
      } catch (error) {
        console.error('Failed to delete low-confidence diagnosis on retake:', error);
      }
    }
    setShowLowConfidenceModal(false);
    setPendingResult(null);
    router.back();
  };

  const handleLowConfidenceProceed = () => {
    setShowLowConfidenceModal(false);
    if (pendingResult) {
      router.push(`/tomatodx/result?id=${pendingResult.diagnosisId}`);
      setPendingResult(null);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/screenBg/preview.jpg')}
      style={styles.backgroundImage}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>

        <View style={[styles.container, { backgroundColor: theme === 'dark' ? `${colors.background}80` : `${colors.background}79`, borderColor: theme === 'dark' ? colors.borderLight : colors.borderDark }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('preview.title')}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Image Preview */}
          <ScrollView
            style={[styles.scrollView]}
            contentContainerStyle={styles.imageContainer}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[
              styles.imageWrapper,
              {
                backgroundColor: colors.card,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }, theme !== 'dark' ? styles.cardShadow : undefined
            ]}>
              <Image
                source={uri ? { uri: uri as string } : require('../../assets/images/sample-tomato-leaf.png')}
                style={styles.image}
                resizeMode="cover"
              />

              {/* Overlay Status */}
              <View style={[styles.statusBadge, { backgroundColor: `${colors.success}99` }]}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.statusText}>{t('preview.ready')}</Text>
              </View>

              {/* Image Quality Indicator */}
              {/* <View style={[styles.qualityIndicator, { backgroundColor: colors.whiteOverlay }]}>
            <Ionicons name="aperture" size={16} color={colors.success} />
            <Text style={[styles.qualityText, { color: colors.text }]}>
              {t('preview.highQuality')}
            </Text>
          </View> */}
            </Animated.View>

            {/* Analysis Tips */}
            <Animated.View style={[
              styles.tipsCard,
              {
                backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}CC`, borderColor: theme === 'dark' ? colors.borderLight : colors.borderDark,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }, theme !== 'dark' ? styles.cardShadow : undefined
            ]}>
              <Ionicons name="bulb" size={24} color={colors.warning} />
              <View style={styles.tipsContent}>
                <Text style={[styles.tipsTitle, { color: colors.text }]}>
                  {t('preview.tipsTitle')}
                </Text>
                <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
                  {t('preview.tipsText')}
                </Text>
              </View>
            </Animated.View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.analyzeButton, theme !== 'dark' ? styles.cardShadow : undefined]}
              onPress={handleAnalyze}
              disabled={analyzing}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={[styles.analyzeGradient]}
              >
                {analyzing ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.analyzeText}>{t('preview.analyzing')}</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="analytics" size={24} color="#fff" />
                    <Text style={styles.analyzeText}>{t('preview.analyze')}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.retakeButton, { backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}CC`, borderColor: theme === 'dark' ? colors.borderLight : colors.borderDark }, theme !== 'dark' ? styles.cardShadow : undefined]}
              onPress={handleRetake}
            >
              <Ionicons
                name="camera-reverse"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.retakeText, { color: colors.textSecondary }]}>
                {t('preview.retake')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Low Confidence Modal */}
          <Modal
            visible={showLowConfidenceModal}
            transparent
            animationType="fade"
            onRequestClose={handleLowConfidenceRetake}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                {/* Warning Icon */}
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryOverlay2 }]}>
                  <Ionicons name="warning" size={48} color={colors.warning} />
                </View>

                {/* Title */}
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t('preview.lowConfidence')}
                </Text>

                {/* Confidence Badge */}
                {pendingResult && (
                  <View style={[styles.confidenceBadge, { backgroundColor: colors.successOverlay2 }]}>
                    <Ionicons name="analytics" size={20} color={colors.danger} />
                    <Text style={[styles.confidenceText, { color: colors.danger }]}>
                      {Math.round(pendingResult.prediction.confidence * 100)}% {t('result.confidence')}
                    </Text>
                  </View>
                )}

                {/* Message */}
                <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                  {t('preview.lowConfidenceMessage')}
                </Text>

                {/* Tips */}
                <View style={[styles.tipsContainer, { backgroundColor: colors.backgroundAlt }, theme !== 'dark' ? styles.cardShadow : undefined]}>
                  <View style={styles.tipRow}>
                    <Ionicons name="sunny" size={18} color={colors.primary} />
                    <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                      {t('scan.tip1')}
                    </Text>
                  </View>
                  <View style={styles.tipRow}>
                    <Ionicons name="camera" size={18} color={colors.primary} />
                    <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                      {t('scan.tip2')}
                    </Text>
                  </View>
                  <View style={styles.tipRow}>
                    <Ionicons name="camera" size={18} color={colors.primary} />
                    <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                      {t('scan.tip3')}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalRetakeButton, { backgroundColor: colors.primary }]}
                    onPress={handleLowConfidenceRetake}
                  >
                    <Ionicons name="camera-reverse" size={20} color="#fff" />
                    <Text style={styles.modalButtonText}>{t('preview.retakeRecommended')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalProceedButton, { borderColor: colors.border }]}
                    onPress={handleLowConfidenceProceed}
                  >
                    <Text style={[styles.modalProceedText, { color: colors.textSecondary }]}>
                      {t('preview.proceedAnyway')}<Ionicons name="chevron-back" size={16} color={colors.background}></Ionicons>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>

      </View>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  imageWrapper: {
    borderRadius: 10,
    borderWidth: .4,
    outlineWidth: .5,
    outlineOffset: 2,
    outlineStyle: 'solid',
    outlineColor: '#ffffff7b',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: width - 50,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  qualityIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 20,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: .5
  },
  tipsContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 40,
    gap: 10,
  },
  analyzeButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 12,
  },
  analyzeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  retakeButton: {
    // flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  retakeText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 20,
    maxWidth: 400,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',

  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 16,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  tipsContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modalButtonContainer: {
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  modalRetakeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalProceedButton: {
    borderWidth: 2,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalProceedText: {
    fontSize: 16,
    fontWeight: '600',
  },
});