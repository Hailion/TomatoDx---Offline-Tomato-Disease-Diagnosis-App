// app/tomatodx/history.tsx - History Screen
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

const mockScans = [
  {
    id: '1',
    disease: 'Early Blight',
    confidence: 92,
    date: '2024-01-15',
    severity: 'medium',
    image: '🌱'
  },
  {
    id: '2',
    disease: 'Healthy',
    confidence: 95,
    date: '2024-01-14',
    severity: 'none',
    image: '✅'
  },
  {
    id: '3',
    disease: 'Late Blight',
    confidence: 88,
    date: '2024-01-13',
    severity: 'high',
    image: '⚠️'
  }
];

export default function HistoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslation();

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

  return (
    <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, theme === 'dark' && styles.darkText]}>
            {t('history.title')}
          </Text>
          <Text style={[styles.subtitle, theme === 'dark' && styles.darkSubtext]}>
            {t('history.subtitle', { count: mockScans.length })}
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, theme === 'dark' && styles.darkCard]}>
            <Ionicons name="scan" size={24} color="#10b981" />
            <Text style={[styles.statNumber, theme === 'dark' && styles.darkText]}>
              {mockScans.length}
            </Text>
            <Text style={[styles.statLabel, theme === 'dark' && styles.darkSubtext]}>
              {t('history.totalScans')}
            </Text>
          </View>
          <View style={[styles.statCard, theme === 'dark' && styles.darkCard]}>
            <Ionicons name="trending-up" size={24} color="#10b981" />
            <Text style={[styles.statNumber, theme === 'dark' && styles.darkText]}>
              92%
            </Text>
            <Text style={[styles.statLabel, theme === 'dark' && styles.darkSubtext]}>
              {t('history.accuracy')}
            </Text>
          </View>
        </View>

        {/* Scan History */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
            {t('history.recentScans')}
          </Text>
          {mockScans.map((scan) => (
            <TouchableOpacity
              key={scan.id}
              style={[styles.scanCard, theme === 'dark' && styles.darkCard]}
              onPress={() => router.push(`/tomatodx/result?id=${scan.id}`)}
            >
              <View style={styles.scanHeader}>
                <View style={styles.scanImage}>
                  <Text style={styles.scanEmoji}>{scan.image}</Text>
                </View>
                <View style={styles.scanInfo}>
                  <Text style={[styles.diseaseName, theme === 'dark' && styles.darkText]}>
                    {scan.disease}
                  </Text>
                  <Text style={[styles.scanDate, theme === 'dark' && styles.darkSubtext]}>
                    {scan.date}
                  </Text>
                </View>
                <View style={styles.scanMeta}>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      {scan.confidence}%
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(scan.severity) + '20' }
                    ]}
                  >
                    <Ionicons
                      name={getSeverityIcon(scan.severity) as any}
                      size={16}
                      color={getSeverityColor(scan.severity)}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${scan.confidence}%`,
                      backgroundColor: getSeverityColor(scan.severity)
                    }
                  ]}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty State */}
        {mockScans.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#999" />
            <Text style={[styles.emptyTitle, theme === 'dark' && styles.darkText]}>
              {t('history.noScans')}
            </Text>
            <Text style={[styles.emptyText, theme === 'dark' && styles.darkSubtext]}>
              {t('history.noScansDesc')}
            </Text>
          </View>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  darkText: {
    color: '#fff',
  },
  darkSubtext: {
    color: '#999',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#1a1a1a',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  scanCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scanImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scanEmoji: {
    fontSize: 20,
  },
  scanInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  scanDate: {
    fontSize: 14,
    color: '#666',
  },
  scanMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  confidenceBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  severityBadge: {
    padding: 4,
    borderRadius: 4,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});