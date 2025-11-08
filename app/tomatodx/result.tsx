// app/tomatodx/result.tsx - Result Screen
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getDiseaseInfo } from '../../src/data/diseaseInfo';
import { getDiagnosisById, updateDiagnosisNotes } from '../../src/db/repository';

interface DiagnosisResult {
  disease: string;
  diseaseAlt?: string;
  diseaseId: string;
  confidence: number;
  severity: string;
  image: string;
  imageUri?: string;
  description: string;
  symptoms: string[];
  treatmentImmediate: string[];
  treatmentLongTerm: string[];
  prevention: string[];
  diagnosedAt: string;
}

export default function ResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const colors = Colors[theme];
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [existingNotes, setExistingNotes] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDiagnosis();
  }, [id, i18n.language]);

  const loadDiagnosis = () => {
    try {
      if (!id) {
        router.back();
        return;
      }

      const diagnosis = getDiagnosisById(id as string);

      if (!diagnosis) {
        Alert.alert(t('result.error'), t('result.notFound'));
        router.back();
        return;
      }

      const confidence = Math.round((diagnosis.confidence || 0) * 100);

      // Map disease name to disease ID
      const diseaseId = mapDiseaseNameToId(diagnosis.nameEn || 'Unknown');
      const diseaseInfo = getDiseaseInfo(diseaseId);

      // Get disease name from translations
      const diseaseNameEn = t(`diseases.${diseaseId}.name`, { lng: 'en', defaultValue: diagnosis.nameEn || 'Unknown' });
      const diseaseNameAm = t(`diseases.${diseaseId}.name`, { lng: 'am', defaultValue: diagnosis.nameAm || diseaseNameEn });
      const diseaseName = i18n.language === 'am' ? diseaseNameAm : diseaseNameEn;
      const diseaseNameAlt = i18n.language === 'am' ? diseaseNameEn : diseaseNameAm;

      // Determine severity from disease info or confidence
      let severity = 'none';
      if (diseaseInfo) {
        const severityMap: Record<string, string> = {
          'Low': 'low',
          'Medium': 'medium',
          'High': 'high',
          'Critical': 'high'
        };
        severity = severityMap[diseaseInfo.severity] || 'medium';
      } else if (diseaseName.toLowerCase().includes('healthy')) {
        severity = 'none';
      } else if (confidence >= 90) {
        severity = 'high';
      } else if (confidence >= 70) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      // Get emoji from disease info
      const image = diseaseInfo?.image || '🌱';

      // Get disease information from translations
      const description = t(`diseases.${diseaseId}.description`, { defaultValue: t('result.noDescription') });
      const symptoms = t(`diseases.${diseaseId}.symptoms`, { returnObjects: true, defaultValue: [] }) as string[];
      const treatmentImmediate = t(`diseases.${diseaseId}.treatment.immediate`, { returnObjects: true, defaultValue: [] }) as string[];
      const treatmentLongTerm = t(`diseases.${diseaseId}.treatment.longTerm`, { returnObjects: true, defaultValue: [] }) as string[];
      const prevention = t(`diseases.${diseaseId}.prevention`, { returnObjects: true, defaultValue: [] }) as string[];

      setResult({
        disease: diseaseName,
        diseaseAlt: diseaseNameAlt,
        diseaseId,
        confidence,
        severity,
        image,
        imageUri: diagnosis.filePath,
        description,
        symptoms: Array.isArray(symptoms) ? symptoms : [],
        treatmentImmediate: Array.isArray(treatmentImmediate) ? treatmentImmediate : [],
        treatmentLongTerm: Array.isArray(treatmentLongTerm) ? treatmentLongTerm : [],
        prevention: Array.isArray(prevention) ? prevention : [],
        diagnosedAt: new Date(diagnosis.diagnosedAt).toLocaleString()
      });
      setExistingNotes(diagnosis.notes || null);
      setLoading(false);

      // Start animations
      Animated.stagger(100, [
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } catch (error) {
      console.error('Error loading diagnosis:', error);
      Alert.alert(t('result.error'), t('result.loadError'));
      router.back();
    }
  };

  const mapDiseaseNameToId = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('early') && nameLower.includes('blight')) return 'early_blight';
    if (nameLower.includes('late') && nameLower.includes('blight')) return 'late_blight';
    if (nameLower.includes('healthy')) return 'healthy';
    if (nameLower.includes('leaf') && nameLower.includes('mold')) return 'leaf_mold';
    if (nameLower.includes('septoria')) return 'septoria_leaf_spot';
    if (nameLower.includes('yellow') && nameLower.includes('curl')) return 'tomato_yellow_leaf_curl';
    if (nameLower.includes('target') && nameLower.includes('spot')) return 'target_spot';
    if (nameLower.includes('spider') && nameLower.includes('mite')) return 'spider_mites_two_spotted_spider_mites';
    if (nameLower.includes('mosaic')) return 'tomato_mosaic_virus';
    if (nameLower.includes('bacterial') && nameLower.includes('spot')) return 'bacterial_spot';
    return 'healthy';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return colors.danger;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.success;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return 'warning';
      case 'medium': return 'alert-circle';
      case 'low': return 'checkmark-circle';
      default: return 'leaf';
    }
  };

  const handleAddNotes = () => {
    setNoteText(existingNotes || '');
    setShowNotesModal(true);
    // Animate modal
    modalAnim.setValue(0);
    Animated.spring(modalAnim, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleSaveNotes = () => {
    if (noteText.trim()) {
      try {
        updateDiagnosisNotes(id as string, noteText.trim());
        setExistingNotes(noteText.trim());
        setShowNotesModal(false);
        Alert.alert(
          t('common.success'),
          t('result.notesSaved', { defaultValue: 'Notes saved successfully' })
        );
      } catch (error) {
        console.error('Error saving notes:', error);
        Alert.alert(
          t('common.error'),
          t('result.notesError', { defaultValue: 'Failed to save notes' })
        );
      }
    } else {
      // Allow saving empty notes to clear them
      try {
        updateDiagnosisNotes(id as string, '');
        setExistingNotes(null);
        setShowNotesModal(false);
      } catch (error) {
        console.error('Error clearing notes:', error);
      }
    }
  };

  const handleShare = () => {
    Alert.alert(
      t('result.share'),
      t('result.shareMessage'),
      [{ text: t('common.ok') }]
    );
  };

  const handleNewScan = () => {
    router.push('/tomatodx/scan');
  };

  if (loading || !result) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }, styles.centered]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t('result.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.background, colors.backgroundAlt]}
        style={styles.header}
      >
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
          {t('result.title')}
        </Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Result Card */}
        <Animated.View style={[
          styles.resultCard,
          {
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          {/* Diagnosis Header */}
          <View style={styles.diagnosisHeader}>
            <View style={styles.diseaseIconContainer}>
              <View style={[styles.diseaseIcon, { backgroundColor: colors.primaryOverlay }]}>
                {result.imageUri ? (
                  <Image
                    source={{ uri: result.imageUri }}
                    style={styles.diseaseImage}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.diseaseEmoji}>{result.image}</Text>
                )}
              </View>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(result.severity) }
                ]}
              >
                <Ionicons
                  name={getSeverityIcon(result.severity) as any}
                  size={12}
                  color="#fff"
                />
                <Text
                  style={[
                    styles.severityText,
                    { color: '#fff' }
                  ]}
                >
                  {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.diseaseInfo}>
              <Text style={[styles.diseaseName, { color: colors.text }]}>
                {result.disease}
              </Text>
              {result.diseaseAlt && (
                <Text style={[styles.diseaseNameAlt, { color: colors.textTertiary }]}>
                  {result.diseaseAlt}
                </Text>
              )}
              <Text style={[styles.diseaseDesc, { color: colors.textSecondary }]}>
                {result.description}
              </Text>
            </View>
          </View>

          {/* Confidence Meter */}
          <View style={styles.confidenceSection}>
            <View style={styles.confidenceHeader}>
              <Text style={[styles.confidenceLabel, { color: colors.textSecondary }]}>
                {t('result.confidence')}
              </Text>
              <Text style={[styles.confidenceValue, { color: colors.text }]}>
                {result.confidence}%
              </Text>
            </View>
            <View style={[styles.confidenceBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.confidenceFill,
                  {
                    width: `${result.confidence}%`,
                    backgroundColor: getSeverityColor(result.severity)
                  }
                ]}
              />
            </View>
          </View>

          {/* Symptoms Section */}
          {result.symptoms && result.symptoms.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="alert-circle" size={20} color={colors.warning} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('result.symptoms', { defaultValue: 'Symptoms' })}
                </Text>
              </View>
              <View style={styles.listContainer}>
                {result.symptoms.map((symptom, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: colors.warning }]} />
                    <Text style={[styles.listText, { color: colors.textSecondary }]}>
                      {symptom}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Treatment Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={20} color={colors.danger} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('result.treatment')}
              </Text>
            </View>
            {result.treatmentImmediate && result.treatmentImmediate.length > 0 && (
              <View style={styles.subsection}>
                <Text style={[styles.subsectionTitle, { color: colors.text }]}>
                  {t('result.immediateActions', { defaultValue: 'Immediate Actions' })}
                </Text>
                <View style={styles.listContainer}>
                  {result.treatmentImmediate.map((action, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={[styles.bulletPoint, { backgroundColor: colors.danger }]} />
                      <Text style={[styles.listText, { color: colors.textSecondary }]}>
                        {action}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {result.treatmentLongTerm && result.treatmentLongTerm.length > 0 && (
              <View style={styles.subsection}>
                <Text style={[styles.subsectionTitle, { color: colors.text }]}>
                  {t('result.longTermActions', { defaultValue: 'Long-term Actions' })}
                </Text>
                <View style={styles.listContainer}>
                  {result.treatmentLongTerm.map((action, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={[styles.bulletPoint, { backgroundColor: colors.warning }]} />
                      <Text style={[styles.listText, { color: colors.textSecondary }]}>
                        {action}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Prevention Section */}
          {result.prevention && result.prevention.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-checkmark" size={20} color={colors.success} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('result.prevention')}
                </Text>
              </View>
              <View style={styles.listContainer}>
                {result.prevention.map((tip, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: colors.success }]} />
                    <Text style={[styles.listText, { color: colors.textSecondary }]}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>

        {/* Notes Section */}
        {existingNotes && (
          <Animated.View style={[
            styles.notesSection,
            {
              backgroundColor: colors.card,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <View style={styles.notesSectionHeader}>
              <View style={styles.notesHeaderLeft}>
                <Ionicons name="document-text" size={20} color={colors.primary} />
                <Text style={[styles.notesSectionTitle, { color: colors.text }]}>
                  {t('result.notes', { defaultValue: 'Notes' })}
                </Text>
              </View>
              <TouchableOpacity onPress={handleAddNotes}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.notesText, { color: colors.textSecondary }]}>
              {existingNotes}
            </Text>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View style={[
          styles.quickActions,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <Text style={[styles.actionsTitle, { color: colors.text }]}>
            {t('result.quickActions')}
          </Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={handleAddNotes}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                {t('result.addNotes', { defaultValue: 'Add Notes' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={handleShare}
            >
              <Ionicons
                name="share"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                {t('result.share')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

      </ScrollView>

      {/* Fixed Action Button */}
      <View style={styles.fixedActions}>
        <TouchableOpacity
          style={[styles.newScanButton, styles.shadow]}
          onPress={handleNewScan}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.newScanGradient}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.newScanText}>{t('result.newScan')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            {
              backgroundColor: colors.card,
              opacity: modalAnim,
              transform: [
                {
                  scale: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1]
                  })
                }
              ]
            }
          ]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('result.addNotes', { defaultValue: 'Add Notes' })}
            </Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              {t('result.addNotesDesc', { defaultValue: 'Add notes about this diagnosis' })}
            </Text>
            <TextInput
              style={[styles.notesInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder={t('result.notesPlaceholder', { defaultValue: 'Enter your notes here...' })}
              placeholderTextColor={colors.textTertiary}
              value={noteText}
              onChangeText={setNoteText}
              multiline
              numberOfLines={4}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.background }]}
                onPress={() => setShowNotesModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={handleSaveNotes}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: '#000',
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
  darkText: {
    color: '#fff',
  },
  darkSubtext: {
    color: '#999',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  resultCard: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  darkCard: {
    backgroundColor: '#1a1a1a',
  },
  diagnosisHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  diseaseIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  diseaseIcon: {
    width: 300,
    height: 300,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  diseaseImage: {
    width: 300,
    height: 300,
  },
  diseaseEmoji: {
    fontSize: 48,
  },
  severityBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  diseaseInfo: {
    alignItems: 'center',
  },
  diseaseName: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  diseaseNameAlt: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 10,
    textAlign: 'center',
  },
  diseaseDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
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
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  subsection: {
    marginTop: 12,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkActionButton: {
    backgroundColor: '#1a1a1a',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  savedText: {
    color: '#10b981',
  },

  fixedActions: {
    padding: 20,
    paddingBottom: 30,
  },
  newScanButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  newScanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  newScanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  shadow: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    // Primary button styles applied via backgroundColor prop
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonPrimaryText: {
    color: '#fff',
  },
  notesSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notesSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});