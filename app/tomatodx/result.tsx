// app/tomatodx/result.tsx - Result Screen
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getDiseaseInfo } from '../../src/data/diseaseInfo';
import { getDiagnosisById } from '../../src/db/repository';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    color: '#1a1a1a',
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
    backgroundColor: '#fff',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  diseaseIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  diseaseImage: {
    width: 60,
    height: 60,
  },
  diseaseEmoji: {
    fontSize: 24,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  diseaseNameAlt: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  diseaseDesc: {
    fontSize: 14,
    color: '#666',
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
    fontSize: 12,
    fontWeight: '700',
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
    color: '#666',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e5e5e5',
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
    color: '#1a1a1a',
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  subsection: {
    marginTop: 12,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
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
    backgroundColor: '#f59e0b',
    marginTop: 6,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
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
    backgroundColor: '#fff',
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
    color: '#666',
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
    color: '#666',
  },
});

export default function ResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiagnosis();
  }, [id]);

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
      setLoading(false);
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
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#10b981';
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

  const handleSave = () => {
    setSaved(true);
    Alert.alert(
      t('result.saved'),
      t('result.savedMessage'),
      [{ text: t('common.ok') }]
    );
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
      <View style={[styles.container, theme === 'dark' && styles.darkContainer, styles.centered]}>
        <Text style={[styles.loadingText, theme === 'dark' && styles.darkText]}>
          {t('result.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
      {/* Header */}
      <LinearGradient
        colors={theme === 'dark' ? ['#1a1a1a', '#2d2d2d'] : ['#f8fafc', '#e2e8f0']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme === 'dark' ? '#fff' : '#1a1a1a'}
          />
        </TouchableOpacity>
        <Text style={[styles.title, theme === 'dark' && styles.darkText]}>
          {t('result.title')}
        </Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Result Card */}
        <View style={[styles.resultCard, theme === 'dark' && styles.darkCard]}>
          {/* Diagnosis Header */}
          <View style={styles.diagnosisHeader}>
            <View style={styles.diseaseIcon}>
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
            <View style={styles.diseaseInfo}>
              <Text style={[styles.diseaseName, theme === 'dark' && styles.darkText]}>
                {result.disease}
              </Text>
              {result.diseaseAlt && (
                <Text style={[styles.diseaseNameAlt, theme === 'dark' && styles.darkSubtext]}>
                  {result.diseaseAlt}
                </Text>
              )}
              <Text style={[styles.diseaseDesc, theme === 'dark' && styles.darkSubtext]}>
                {result.description}
              </Text>
            </View>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(result.severity) + '20' }
              ]}
            >
              <Ionicons
                name={getSeverityIcon(result.severity) as any}
                size={16}
                color={getSeverityColor(result.severity)}
              />
              <Text
                style={[
                  styles.severityText,
                  { color: getSeverityColor(result.severity) }
                ]}
              >
                {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}
              </Text>
            </View>
          </View>

          {/* Confidence Meter */}
          <View style={styles.confidenceSection}>
            <View style={styles.confidenceHeader}>
              <Text style={[styles.confidenceLabel, theme === 'dark' && styles.darkSubtext]}>
                {t('result.confidence')}
              </Text>
              <Text style={[styles.confidenceValue, theme === 'dark' && styles.darkText]}>
                {result.confidence}%
              </Text>
            </View>
            <View style={styles.confidenceBar}>
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
                <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
                  {t('result.symptoms', { defaultValue: 'Symptoms' })}
                </Text>
              </View>
              <View style={styles.listContainer}>
                {result.symptoms.map((symptom, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={[styles.listText, theme === 'dark' && styles.darkSubtext]}>
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
              <Ionicons name="medical" size={20} color="#ef4444" />
              <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
                {t('result.treatment')}
              </Text>
            </View>
            {result.treatmentImmediate && result.treatmentImmediate.length > 0 && (
              <View style={styles.subsection}>
                <Text style={[styles.subsectionTitle, theme === 'dark' && styles.darkText]}>
                  {t('result.immediateActions', { defaultValue: 'Immediate Actions' })}
                </Text>
                <View style={styles.listContainer}>
                  {result.treatmentImmediate.map((action, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={[styles.bulletPoint, { backgroundColor: '#ef4444' }]} />
                      <Text style={[styles.listText, theme === 'dark' && styles.darkSubtext]}>
                        {action}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {result.treatmentLongTerm && result.treatmentLongTerm.length > 0 && (
              <View style={styles.subsection}>
                <Text style={[styles.subsectionTitle, theme === 'dark' && styles.darkText]}>
                  {t('result.longTermActions', { defaultValue: 'Long-term Actions' })}
                </Text>
                <View style={styles.listContainer}>
                  {result.treatmentLongTerm.map((action, index) => (
                    <View key={index} style={styles.listItem}>
                      <View style={[styles.bulletPoint, { backgroundColor: '#f59e0b' }]} />
                      <Text style={[styles.listText, theme === 'dark' && styles.darkSubtext]}>
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
                <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
                  {t('result.prevention')}
                </Text>
              </View>
              <View style={styles.listContainer}>
                {result.prevention.map((tip, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: '#10b981' }]} />
                    <Text style={[styles.listText, theme === 'dark' && styles.darkSubtext]}>
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.actionsTitle, theme === 'dark' && styles.darkText]}>
            {t('result.quickActions')}
          </Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, theme === 'dark' && styles.darkActionButton]}
              onPress={handleSave}
            >
              <Ionicons
                name={saved ? "checkmark" : "bookmark"}
                size={20}
                color={saved ? "#10b981" : (theme === 'dark' ? '#fff' : '#666')}
              />
              <Text style={[
                styles.actionText,
                theme === 'dark' && styles.darkText,
                saved && styles.savedText
              ]}>
                {saved ? t('result.saved') : t('result.save')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, theme === 'dark' && styles.darkActionButton]}
              onPress={handleShare}
            >
              <Ionicons
                name="share"
                size={20}
                color={theme === 'dark' ? '#fff' : '#666'}
              />
              <Text style={[styles.actionText, theme === 'dark' && styles.darkText]}>
                {t('result.share')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Fixed Action Button */}
      <View style={styles.fixedActions}>
        <TouchableOpacity
          style={[styles.newScanButton, styles.shadow]}
          onPress={handleNewScan}
        >
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.newScanGradient}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.newScanText}>{t('result.newScan')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}