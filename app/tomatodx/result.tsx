// result.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import LoadingIndicator from '../../src/components/LoadingIndicator';
import { useToast } from '../../src/contexts/ToastContext';
import { getDiseaseInfo } from '../../src/data/diseaseInfo';
import { getDiagnosisById, insertDiagnosis, upsertDisease } from '../../src/db/repository';
import { initDb } from '../../src/db/schema';
import { predictFromUri } from '../../src/ml/inference';
import { initModel } from '../../src/ml/model';
import { createButtonPressAnimation, createEntranceAnimation } from '../../src/utils/animations';
import { useScreenSetup } from '../../src/utils/screenSetup';
import { handleShare } from '../../src/utils/shareUtils';

export default function ResultScreen() {

  const { t, i18n, tokens, insets } = useScreenSetup();

  const { showToast } = useToast();

  const params = useLocalSearchParams();

  const uri = (params.uri as string) || undefined;

  const imageId = (params.imageId as string) || undefined;

  const diagnosisIdParam = (params.diagnosisId as string) || undefined;

  const [resultData, setResultData] = useState<any | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const [loadingStage, setLoadingStage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isFromHistory = !!diagnosisIdParam;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpTitle = useRef(new Animated.Value(40)).current;
  const slideUpCard = useRef(new Animated.Value(50)).current;
  const slideUpButtons = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const didAnimateRef = useRef(false);
  const predictedForUriRef = useRef<string | null>(null);

  // Safely coerce i18n values to arrays when keys are missing or mis-typed
  const ensureStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) return value as string[];
    return [];
  };

  // Map model labels from metadata.json to our i18n keys
  // Model labels: ["Healthy","Tomato_mosaic_virus","Tomato_Yellow_Leaf_Curl_Virus","Target_Spot",
  //               "Spider_mites Two-spotted_spider_mite","Septoria_leaf_spot","Leaf_Mold",
  //               "Late_blight","Early_blight","Bacterial_spot"]
  const normalizeLabelToId = (label: string): string => {
    if (!label) return 'healthy';
    const normalized = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');

    // Map model labels to i18n keys
    if (normalized.includes('spider_mites')) return 'spider_mites_two_spotted_spider_mites';
    if (normalized === 'tomato_yellow_leaf_curl_virus') return 'tomato_yellow_leaf_curl';

    // Direct matches (already normalized correctly)
    const validIds = [
      'healthy', 'late_blight', 'early_blight', 'leaf_mold',
      'septoria_leaf_spot', 'tomato_mosaic_virus', 'target_spot', 'bacterial_spot'
    ];

    return validIds.includes(normalized) ? normalized : 'healthy';
  };



  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isFromHistory) {
      showToast(t('result.alreadySaved'), 'info', 3000);
      return;
    }

    if (isSaved) {
      showToast(t('result.saveSuccess'), 'info', 3000);
      return;
    }

    if (!resultData) {
      showToast(t('result.waitForAnalysis'), 'warning', 3000);
      return;
    }

    createButtonPressAnimation(pulseAnim, () => {
      if (!imageId) {
        showToast(t('result.missingImage'), 'error', 4000);
        return;
      }

      try {
        // ensure DB
        initDb();

        // upsert disease names/advice seen on screen
        upsertDisease(resultData.diseaseId, resultData.nameEn, resultData.nameAm, undefined, resultData.advice);

        // persist diagnosis
        const diagnosisId = uuidv4();
        insertDiagnosis(
          diagnosisId,
          imageId,
          resultData.diseaseId,
          resultData.confidence,
          new Date().toISOString(),
          undefined
        );

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsSaved(true);
        showToast(t('result.savedToHistory'), 'success', 3000, {
          label: t('result.viewHistory'),
          onPress: () => router.push('/tomatodx/history'),
        });
      } catch {
        showToast(t('result.failedToSave'), 'error', 4000);
      }
    });

  };



  const handleShareResult = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    createButtonPressAnimation(pulseAnim);

    await handleShare({
      resultData,
      uri,
      t,
      showToast,
    });
  };



  useEffect(() => {
    // Progress animation tracks current result confidence
    Animated.timing(progressAnim, {
      toValue: resultData ? resultData.confidence : 0,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    if (didAnimateRef.current) return;
    didAnimateRef.current = true;

    // Main entrance animations (run once)
    createEntranceAnimation(fadeAnim, scaleAnim, slideUpCard).start();

    // Additional animations
    Animated.timing(slideUpTitle, {
      toValue: 0,
      duration: 600,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true
    }).start();

    Animated.timing(slideUpButtons, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.back(1)),
      useNativeDriver: true
    }).start();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultData]);

  // Load saved diagnosis data when viewing from history
  useEffect(() => {
    if (!isFromHistory || !diagnosisIdParam) return;

    try {
      const savedDiagnosis = getDiagnosisById(diagnosisIdParam);
      if (savedDiagnosis) {
        const diseaseId = savedDiagnosis.diseaseId;
        const severity = savedDiagnosis.confidence >= 0.9 ? 'High' : savedDiagnosis.confidence >= 0.7 ? 'Medium' : 'Low';

        const symptoms = ensureStringArray(t(`diseases.${diseaseId}.symptoms`, { returnObjects: true }));
        const treatmentImmediate = ensureStringArray(
          t(`diseases.${diseaseId}.treatment.immediate`, { returnObjects: true })
        );
        const treatmentLongTerm = ensureStringArray(
          t(`diseases.${diseaseId}.treatment.longTerm`, { returnObjects: true })
        );
        const prevention = ensureStringArray(
          t(`diseases.${diseaseId}.prevention`, { returnObjects: true })
        );

        // Get names in both languages
        const nameEn = t(`diseases.${diseaseId}.name`, { lng: 'en' }) || diseaseId;
        const nameAm = t(`diseases.${diseaseId}.name`, { lng: 'am' }) || diseaseId;

        // Set primary name (current language) and secondary name (other language)
        const currentLang = i18n.language || 'en';
        const primaryName = currentLang === 'am' ? nameAm : nameEn;
        const secondaryName = currentLang === 'am' ? nameEn : nameAm;

        setResultData({
          diseaseId,
          nameEn,
          nameAm,
          primaryName,
          secondaryName,
          confidence: savedDiagnosis.confidence,
          description: t(`diseases.${diseaseId}.description`, { defaultValue: 'Disease detected' }),
          symptoms,
          treatment: {
            immediate: treatmentImmediate,
            longTerm: treatmentLongTerm,
          },
          preventionTips: prevention,
          advice: treatmentImmediate[0] || t('common.noTreatment'),
          severity: severity,
          image: getDiseaseInfo(diseaseId)?.image || '🌿'
        });

        setIsSaved(true); // Mark as already saved since it's from history
      }
    } catch (error) {
      console.error('Error loading diagnosis from history:', error);
    }
  }, [isFromHistory, diagnosisIdParam, t, i18n.language]);

  useEffect(() => {

    let cancelled = false;

    (async () => {

      if (!uri) return;

      // Skip analysis if this is a result from history - use saved data instead
      if (isFromHistory) return;

      if (predictedForUriRef.current === uri) return; // prevent duplicate predict for same uri

      predictedForUriRef.current = uri;


      try {

        // Loading stages
        setLoadingStage('Initializing model...');
        setLoadingProgress(0.2);
        await initModel();


        if (cancelled) return;

        setLoadingStage('Analyzing image...');
        setLoadingProgress(0.5);
        const pred = await predictFromUri(uri);


        if (cancelled) return;


        setLoadingStage('Processing results...');
        setLoadingProgress(0.8);

        // Get detailed disease information
        const diseaseId = normalizeLabelToId(pred.label);
        const diseaseInfo = getDiseaseInfo(diseaseId);
        const severity = pred.confidence >= 0.9 ? 'High' : pred.confidence >= 0.7 ? 'Medium' : 'Low';


        setLoadingProgress(1.0);
        setLoadingStage('Complete');

        const symptoms = ensureStringArray(t(`diseases.${diseaseId}.symptoms`, { returnObjects: true }));
        const treatmentImmediate = ensureStringArray(
          t(`diseases.${diseaseId}.treatment.immediate`, { returnObjects: true })
        );
        const treatmentLongTerm = ensureStringArray(
          t(`diseases.${diseaseId}.treatment.longTerm`, { returnObjects: true })
        );
        const prevention = ensureStringArray(
          t(`diseases.${diseaseId}.prevention`, { returnObjects: true })
        );

        // Get names in both languages
        const nameEn = t(`diseases.${diseaseId}.name`, { lng: 'en' }) || diseaseId;
        const nameAm = t(`diseases.${diseaseId}.name`, { lng: 'am' }) || diseaseId;

        // Set primary name (current language) and secondary name (other language)
        const currentLang = i18n.language || 'en';
        const primaryName = currentLang === 'am' ? nameAm : nameEn;
        const secondaryName = currentLang === 'am' ? nameEn : nameAm;

        setResultData({

          diseaseId,

          nameEn,
          nameAm,
          primaryName,  // Name in current language
          secondaryName, // Name in other language
          confidence: pred.confidence,

          description: t(`diseases.${diseaseId}.description`, { defaultValue: 'Disease detected' }),
          symptoms,
          treatment: {
            immediate: treatmentImmediate,
            longTerm: treatmentLongTerm,
          },
          preventionTips: prevention,
          advice: treatmentImmediate[0] || t('common.noTreatment'),
          severity: severity || diseaseInfo?.severity || 'low',
          // severity: diseaseInfo?.severity || 'low',
          image: diseaseInfo?.image || '🌿'
        });

      } catch (e: any) {

        showToast(`${t('result.predictionFailed')}: ${e?.message || t('common.unknownError')}`, 'error', 5000);
        setLoadingStage('');
        setLoadingProgress(0);
      }

    })();

    return () => { cancelled = true; };

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(24, insets.bottom) }]} showsVerticalScrollIndicator={false}>

          {!resultData ? (

            <View style={[styles.resultCard, { backgroundColor: tokens.surface, shadowColor: tokens.shadowLight }]}>

              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <LoadingIndicator stage={loadingStage || 'Processing...'} progress={loadingProgress} />
              </View>

            </View>

          ) : (

            <View style={[styles.resultCard, { backgroundColor: tokens.surface, shadowColor: tokens.shadowLight }]}>

              {/* Image Preview */}

              {uri ? (

                <Image source={{ uri }} style={styles.imagePreview} resizeMode="cover" />

              ) : null}



              {/* Disease Header */}

              <View style={styles.diseaseHeader}>
                <View style={styles.diseaseHeaderContent}>


                  <View style={styles.diseaseInfo}>

                    <Text style={[styles.diseaseName, { color: tokens.text }]}>{resultData.primaryName}</Text>

                    <Text style={[styles.diseaseNameAm, { color: tokens.muted }]}>{resultData.secondaryName}</Text>


                  </View>
                  <View style={styles.diseaseInfoContent}>

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
                    <View style={styles.diseaseIconContainer}>

                      <Text style={styles.diseaseIcon}>{resultData.image}</Text>

                    </View>
                  </View>
                </View>
                {resultData.description && (
                  <Text style={[styles.diseaseDescription, { color: tokens.muted }]}>{resultData.description}</Text>
                )}
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

                {resultData.preventionTips?.map((tip: string, index: number) => (
                  <View key={index} style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color={tokens.success} />
                    <Text style={[styles.tipText, { color: tokens.muted }]}>{tip}</Text>
                  </View>
                ))}
              </View>

              {/* Symptoms Section */}
              {resultData.symptoms && resultData.symptoms.length > 0 && (
                <View style={styles.symptomsSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="eye" size={20} color={tokens.warning} />
                    <Text style={styles.sectionTitle}>{t('common.symptoms')}</Text>
                  </View>
                  {resultData.symptoms.map((symptom: string, index: number) => (
                    <View key={index} style={styles.symptomItem}>
                      <Ionicons name="ellipse" size={8} color={tokens.warningDark} />
                      <Text style={[styles.symptomText, { color: tokens.textSecondary }]}>{symptom}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Detailed Treatment Section */}
              {resultData.treatment && (
                <View style={styles.treatmentSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="medical" size={20} color={tokens.primary} />
                    <Text style={styles.sectionTitle}>{t('common.treatmentSteps')}</Text>
                  </View>

                  <View style={styles.treatmentSubsection}>
                    <Text style={[styles.subsectionTitle, { color: tokens.primary }]}>{t('common.immediateActions')}:</Text>
                    {resultData.treatment.immediate.map((step: string, index: number) => (
                      <View key={index} style={styles.treatmentStep}>
                        <Text style={[styles.stepNumber, { color: tokens.primary }]}>{index + 1}.</Text>
                        <Text style={[styles.treatmentText, { color: tokens.textSecondary }]}>{step}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.treatmentSubsection}>
                    <Text style={[styles.subsectionTitle, { color: tokens.primary }]}>{t('common.longTermManagement')}:</Text>
                    {resultData.treatment.longTerm.map((step: string, index: number) => (
                      <View key={index} style={styles.treatmentStep}>
                        <Text style={[styles.stepNumber, { color: tokens.primary }]}>{index + 1}.</Text>
                        <Text style={[styles.treatmentText, { color: tokens.textSecondary }]}>{step}</Text>
                      </View>
                    ))}
                  </View>

                </View>
              )}
            </View>

          )}



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

              style={[

                styles.saveButton,

                {

                  backgroundColor: (isFromHistory || isSaved) ? '#9ca3af' : tokens.primary,

                  shadowColor: (isFromHistory || isSaved) ? '#9ca3af' : tokens.primary,

                  opacity: resultData ? 1 : 0.5

                }

              ]}

              onPress={handleSave}

              activeOpacity={0.8}

              disabled={!resultData || isFromHistory || isSaved}

            >

              <Ionicons name={(isFromHistory || isSaved) ? 'checkmark-done' : 'save'} size={24} color={tokens.whiteMuted} />

              <Text style={[styles.saveButtonText, { color: tokens.whiteMuted }]}>{(isFromHistory || isSaved) ? (t('result.saved') || 'Saved') : t('result.save')}</Text>

            </TouchableOpacity>



            <TouchableOpacity

              style={[styles.shareButton, { backgroundColor: tokens.surface, borderColor: tokens.border }]}

              onPress={handleShareResult}

              activeOpacity={0.8}

              disabled={!resultData}

            >

              <Ionicons name="share" size={24} color={tokens.text} />

              <Text style={[styles.shareButtonText, { color: tokens.text }]}>{t('result.share')}</Text>

            </TouchableOpacity>

          </Animated.View>

        </ScrollView>

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

  },

  scrollContent: {

    paddingHorizontal: 20,

    paddingBottom: 24,

    gap: 16,

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

  imagePreview: {

    width: '100%',

    height: 260,

    borderRadius: 16,

    marginBottom: 16,

  },

  // Disease header

  diseaseHeader: {

    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,

  },
  diseaseHeaderContent: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  diseaseInfo: {

    flex: 1,
    minHeight: 100,
    marginRight: 8,

  },

  diseaseName: {

    fontSize: 26,

    fontWeight: '800',

    color: '#1f2937',

    marginBottom: 8,
    marginRight: 8,


  },

  diseaseNameAm: {

    fontSize: 16,

    color: '#6b7280',

    fontWeight: '600',

  },

  diseaseInfoContent: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: "flex-end",
    gap: 10,
    minHeight: 100,


  },
  diseaseIconContainer: {

    width: '100%',

    // height: calc(100% - 20px),
    height: 90,

    borderRadius: 16,

    backgroundColor: '#f0fdf4',

    justifyContent: 'center',

    alignItems: 'center',

    // marginRight: 16,

    borderWidth: 2,

    borderColor: '#dcfce7',

  },

  diseaseIcon: {

    fontSize: 40,

  },


  diseaseDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    lineHeight: 18,
    padding: 4,

  },
  severityBadge: {
    width: "100%",

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

  // Tip items
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  // Symptoms section
  symptomsSection: {
    marginBottom: 20,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  symptomText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  // Treatment section
  treatmentSection: {
    marginBottom: 12,
  },
  treatmentSubsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  treatmentStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    width: 24,
  },
  treatmentText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  // Loading animation styles
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
})