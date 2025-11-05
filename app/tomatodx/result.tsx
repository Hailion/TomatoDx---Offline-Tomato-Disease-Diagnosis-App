// app/tomatodx/result.tsx - Result Screen
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getDiagnosisById } from '../../src/db/repository';

interface DiagnosisResult {
  disease: string;
  confidence: number;
  severity: string;
  image: string;
  imageUri?: string;
  description: string;
  treatment: string;
  prevention: string;
  diagnosedAt: string;
}

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
      const diseaseName = i18n.language === 'am' ? (diagnosis.nameAm || diagnosis.nameEn || 'Unknown') : (diagnosis.nameEn || 'Unknown');

      // Determine severity
      let severity = 'none';
      if (diseaseName.toLowerCase().includes('healthy')) {
        severity = 'none';
      } else if (confidence >= 90) {
        severity = 'high';
      } else if (confidence >= 70) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      // Get emoji
      let image = '🌱';
      if (diseaseName.toLowerCase().includes('healthy')) image = '✅';
      else if (diseaseName.toLowerCase().includes('blight')) image = '⚠️';
      else if (diseaseName.toLowerCase().includes('spot')) image = '🦠';
      else if (diseaseName.toLowerCase().includes('mildew')) image = '🍂';

      setResult({
        disease: diseaseName,
        confidence,
        severity,
        image,
        imageUri: diagnosis.filePath,
        description: diagnosis.symptoms || t('result.noDescription'),
        treatment: diagnosis.advice || t('result.noTreatment'),
        prevention: t('result.generalPrevention'),
        diagnosedAt: new Date(diagnosis.diagnosedAt).toLocaleString()
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading diagnosis:', error);
      Alert.alert(t('result.error'), t('result.loadError'));
      router.back();
    }
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
              <Text style={styles.diseaseEmoji}>{result.image}</Text>
            </View>
            <View style={styles.diseaseInfo}>
              <Text style={[styles.diseaseName, theme === 'dark' && styles.darkText]}>
                {result.disease}
              </Text>
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

          {/* Treatment Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={20} color="#ef4444" />
              <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
                {t('result.treatment')}
              </Text>
            </View>
            <Text style={[styles.sectionContent, theme === 'dark' && styles.darkSubtext]}>
              {result.treatment}
            </Text>
          </View>

          {/* Prevention Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
                {t('result.prevention')}
              </Text>
            </View>
            <Text style={[styles.sectionContent, theme === 'dark' && styles.darkSubtext]}>
              {result.prevention}
            </Text>
          </View>
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

        {/* Next Steps */}
        <View style={[styles.nextSteps, theme === 'dark' && styles.darkCard]}>
          <Text style={[styles.nextStepsTitle, theme === 'dark' && styles.darkText]}>
            {t('result.nextSteps')}
          </Text>
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="calendar" size={16} color="#10b981" />
              </View>
              <Text style={[styles.stepText, theme === 'dark' && styles.darkSubtext]}>
                {t('result.step1')}
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="water" size={16} color="#10b981" />
              </View>
              <Text style={[styles.stepText, theme === 'dark' && styles.darkSubtext]}>
                {t('result.step2')}
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="eye" size={16} color="#10b981" />
              </View>
              <Text style={[styles.stepText, theme === 'dark' && styles.darkSubtext]}>
                {t('result.step3')}
              </Text>
            </View>
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
    marginBottom: 4,
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
  nextSteps: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  steps: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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