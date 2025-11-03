// result.tsx

import { Ionicons } from '@expo/vector-icons';

import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';

import * as Sharing from 'expo-sharing';

import React, { useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';



import {
  Animated,

  Easing,

  Image,

  Platform,

  ScrollView,

  Share,

  StyleSheet,

  Text,

  TouchableOpacity,

  View
} from 'react-native';

import 'react-native-get-random-values';

import { v4 as uuidv4 } from 'uuid';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

import LoadingIndicator from '../../src/components/LoadingIndicator';
import { useTheme } from '../../src/contexts/ThemeContext';

import { useToast } from '../../src/contexts/ToastContext';
import { getDiseaseInfo } from '../../src/data/diseaseInfo';
import { insertDiagnosis, upsertDisease } from '../../src/db/repository';

import { initDb } from '../../src/db/schema';

import { predictFromUri } from '../../src/ml/inference';

import { initModel } from '../../src/ml/model';



export default function ResultScreen() {

  const { t, i18n } = useTranslation();

  const params = useLocalSearchParams();

  const uri = (params.uri as string) || undefined;

  const imageId = (params.imageId as string) || undefined;

  const diagnosisIdParam = (params.diagnosisId as string) || undefined;

  const [resultData, setResultData] = useState<any | null>(null);

  const [loadingStage, setLoadingStage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isFromHistory = !!diagnosisIdParam;

  const { theme } = useTheme();

  const tokens = Colors[theme];
  const insets = useSafeAreaInsets();

  const { showToast } = useToast();

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



  const handleSave = () => {

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isFromHistory) {

      showToast('This result is already saved in your history', 'info', 3000);
      return;

    }

    if (!resultData) {

      showToast('Please wait for analysis to complete', 'warning', 3000);
      return;

    }

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

      if (!imageId) {

        showToast('Missing image. Please retake the photo.', 'error', 4000);
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
        showToast('Result saved to history!', 'success', 3000, {
          label: 'View History',
          onPress: () => router.push('/tomatodx/history'),
        });
      } catch {
        showToast('Failed to save result. Please try again.', 'error', 4000);
      }

    });

  };



  const handleShare = async () => {

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

      if (!resultData || !uri) {
        showToast('No result or image to share', 'warning', 3000);
        return;
      }

      if (!(await Sharing.isAvailableAsync())) {
        showToast('Sharing is not available on this device', 'warning', 3000);
        return;
      }

      // Build comprehensive share text
      const shareText = `🍅 ${t('result.shareText')}\n\n` +
        `📋 ${t('result.disease')}: ${resultData.primaryName}${resultData.secondaryName ? ` (${resultData.secondaryName})` : ''}\n` +
        `📊 ${t('result.confidence')}: ${Math.round(resultData.confidence * 100)}%\n` +
        `⚠️ ${t('result.recommendation')}: ${resultData.advice}\n\n` +
        `Diagnosed via TomatoDx App`;

      // Strategy: Use platform-specific approaches for best results
      // iOS: Share API supports image + text together
      // Android: Share image first, then text (more reliable)

      if (Platform.OS === 'ios') {
        // iOS: Try Share API with both image and text
        try {
          const shareOptions: any = {
            message: shareText,
            title: `${resultData.primaryName} - ${t('result.shareTitle')}` || 'Share Diagnosis',
          };

          if (uri && (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('http://') || uri.startsWith('https://'))) {
            shareOptions.url = uri;
          }

          const result = await Share.share(shareOptions);

          if (result.action === Share.sharedAction) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            showToast('Shared successfully with both image and diagnosis details!', 'success', 2000);
          } else if (result.action === Share.dismissedAction) {
            return;
          }
          return;
        } catch (iosShareError) {
          console.warn('iOS Share API failed, falling back:', iosShareError);
          // Fall through to expo-sharing
        }
      }

      // Android or iOS fallback: Share image with expo-sharing (more reliable for images)
      if (uri && (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('http://') || uri.startsWith('https://'))) {
        try {
          // Share image first (this works reliably on both platforms)
          await Sharing.shareAsync(uri, {
            mimeType: 'image/jpeg',
            dialogTitle: `${resultData.primaryName} - ${t('result.shareTitle')}` || 'Share Diagnosis',
            UTI: 'public.jpeg',
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // On Android, immediately share text file to ensure both are available
          if (Platform.OS === 'android') {
            // Create text file for sharing
            const textFileName = `tomatodx-diagnosis-${Date.now()}.txt`;
            let textFileUri: string | null = null;

            try {
              // Use documentDirectory from legacy API
              const docPath = FileSystem.documentDirectory;
              if (docPath) {
                const dir = `${docPath}shares/`;
                await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => { });
                textFileUri = `${dir}${textFileName}`;
                await FileSystem.writeAsStringAsync(textFileUri, shareText);
              }
            } catch (fileErr) {
              console.warn('Could not create text file:', fileErr);
            }

            // Share text file immediately after image (ensures both are shared)
            if (textFileUri) {
              setTimeout(async () => {
                try {
                  await Sharing.shareAsync(textFileUri!, {
                    mimeType: 'text/plain',
                    dialogTitle: 'Diagnosis Details',
                  });

                  // Clean up text file
                  setTimeout(async () => {
                    try {
                      await FileSystem.deleteAsync(textFileUri!, { idempotent: true });
                    } catch { }
                  }, 2000);
                } catch (textError) {
                  console.warn('Text file sharing failed:', textError);
                }
              }, 400);
            } else {
              // If text file creation failed, share text as data URI
              setTimeout(async () => {
                try {
                  await Share.share({
                    message: shareText,
                    title: 'Diagnosis Details',
                  });
                } catch { }
              }, 400);
            }
          }
          return;
        } catch (imageShareError: any) {
          // If image sharing fails, share text as fallback
          console.warn('Image sharing failed, sharing text instead:', imageShareError);
          await Share.share({
            message: shareText,
            title: t('result.shareTitle') || 'Share Diagnosis',
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        // No image URI, share text only
        await Share.share({
          message: shareText,
          title: t('result.shareTitle') || 'Share Diagnosis',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

    } catch (error: any) {
      console.error('Share error:', error);
      showToast(`Failed to share: ${error?.message || 'Unknown error'}`, 'error', 4000);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

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

    Animated.sequence([

      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),

      Animated.parallel([

        Animated.timing(slideUpTitle, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),

        Animated.timing(scaleAnim, { toValue: 1, duration: 700, easing: Easing.elastic(1), useNativeDriver: true })

      ]),

      Animated.timing(slideUpCard, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),

      Animated.timing(slideUpButtons, { toValue: 0, duration: 500, easing: Easing.out(Easing.back(1)), useNativeDriver: true })

    ]).start();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultData]);



  useEffect(() => {

    let cancelled = false;

    (async () => {

      if (!uri) return;

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

        showToast(`Prediction failed: ${e?.message || 'Unknown error'}`, 'error', 5000);
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

                  backgroundColor: isFromHistory ? '#9ca3af' : tokens.primary,

                  shadowColor: isFromHistory ? '#9ca3af' : tokens.primary,

                  opacity: resultData ? 1 : 0.5

                }

              ]}

              onPress={handleSave}

              activeOpacity={0.8}

              disabled={!resultData || isFromHistory}

            >

              <Ionicons name={isFromHistory ? 'checkmark-done' : 'save'} size={24} color={tokens.whiteMuted} />

              <Text style={[styles.saveButtonText, { color: tokens.whiteMuted }]}>{isFromHistory ? (t('result.saved') || 'Saved') : t('result.save')}</Text>

            </TouchableOpacity>



            <TouchableOpacity

              style={[styles.shareButton, { backgroundColor: tokens.surface, borderColor: tokens.border }]}

              onPress={handleShare}

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