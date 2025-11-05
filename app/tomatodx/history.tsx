// app/tomatodx/history.tsx - History Screen with Filters
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getRecentDiagnoses } from '../../src/db/repository';

interface DiagnosisItem {
  id: string;
  disease: string;
  confidence: number;
  date: string;
  timestamp: number;
  severity: string;
  status: string;
  image: string;
}

type FilterType = 'all' | 'healthy' | 'diseased' | 'high-risk' | 'treated' | 'pending';
type SortType = 'date-desc' | 'date-asc' | 'confidence-desc' | 'confidence-asc';

export default function HistoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeSort, setActiveSort] = useState<SortType>('date-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);

  // Load diagnoses from database
  useFocusEffect(
    useCallback(() => {
      loadDiagnoses();
    }, [])
  );

  const loadDiagnoses = () => {
    try {
      const dbDiagnoses = getRecentDiagnoses(100);
      const formatted = dbDiagnoses.map((d: any) => {
        const confidence = Math.round((d.confidence || 0) * 100);
        const diseaseName = i18n.language === 'am' ? (d.nameAm || d.nameEn || 'Unknown') : (d.nameEn || 'Unknown');
        const date = new Date(d.diagnosedAt);
        const timestamp = date.getTime();

        // Determine severity based on confidence
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

        // Determine status (you can add a status field to DB later)
        const status = severity === 'none' ? 'healthy' : 'pending';

        // Get emoji based on disease
        let image = '🌱';
        if (diseaseName.toLowerCase().includes('healthy')) image = '✅';
        else if (diseaseName.toLowerCase().includes('blight')) image = '⚠️';
        else if (diseaseName.toLowerCase().includes('spot')) image = '🦠';
        else if (diseaseName.toLowerCase().includes('mildew')) image = '🍂';

        return {
          id: d.diagnosisId,
          disease: diseaseName,
          confidence,
          date: date.toISOString().split('T')[0],
          timestamp,
          severity,
          status,
          image
        };
      });
      setDiagnoses(formatted);
    } catch (error) {
      console.error('Error loading diagnoses:', error);
      setDiagnoses([]);
    }
  };

  const filters: { key: FilterType; label: string; icon: string; color: string }[] = [
    { key: 'all', label: t('history.filters.all'), icon: 'apps', color: '#6b7280' },
    { key: 'healthy', label: t('history.filters.healthy'), icon: 'checkmark-circle', color: '#10b981' },
    { key: 'diseased', label: t('history.filters.diseased'), icon: 'warning', color: '#ef4444' },
    { key: 'high-risk', label: t('history.filters.highRisk'), icon: 'alert-circle', color: '#f59e0b' },
    { key: 'treated', label: t('history.filters.treated'), icon: 'medical', color: '#8b5cf6' },
    { key: 'pending', label: t('history.filters.pending'), icon: 'time', color: '#6b7280' },
  ];

  const sortOptions: { key: SortType; label: string; icon: string }[] = [
    { key: 'date-desc', label: t('history.sort.newest'), icon: 'arrow-down' },
    { key: 'date-asc', label: t('history.sort.oldest'), icon: 'arrow-up' },
    { key: 'confidence-desc', label: t('history.sort.highConfidence'), icon: 'trending-up' },
    { key: 'confidence-asc', label: t('history.sort.lowConfidence'), icon: 'trending-down' },
  ];

  const filteredAndSortedScans = useMemo(() => {
    let filtered = diagnoses;

    // Apply filters
    switch (activeFilter) {
      case 'healthy':
        filtered = filtered.filter(scan => scan.severity === 'none');
        break;
      case 'diseased':
        filtered = filtered.filter(scan => scan.severity !== 'none');
        break;
      case 'high-risk':
        filtered = filtered.filter(scan => scan.severity === 'high');
        break;
      case 'treated':
        filtered = filtered.filter(scan => scan.status === 'treated');
        break;
      case 'pending':
        filtered = filtered.filter(scan => scan.status === 'pending');
        break;
      default:
        filtered = diagnoses;
    }

    // Apply sorting
    switch (activeSort) {
      case 'date-desc':
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'date-asc':
        filtered.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'confidence-desc':
        filtered.sort((a, b) => b.confidence - a.confidence);
        break;
      case 'confidence-asc':
        filtered.sort((a, b) => a.confidence - b.confidence);
        break;
    }

    return filtered;
  }, [activeFilter, activeSort]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10b981';
      case 'treated': return '#8b5cf6';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return t('history.status.healthy');
      case 'treated': return t('history.status.treated');
      case 'pending': return t('history.status.pending');
      default: return t('history.status.unknown');
    }
  };

  // Group scans by date for section list
  const groupedScans = useMemo(() => {
    const groups: { [key: string]: DiagnosisItem[] } = {};

    filteredAndSortedScans.forEach(scan => {
      if (!groups[scan.date]) {
        groups[scan.date] = [];
      }
      groups[scan.date].push(scan);
    });

    return Object.entries(groups).map(([date, scans]) => ({
      title: date,
      data: scans,
    }));
  }, [filteredAndSortedScans]);

  const ScanItem = ({ item }: { item: DiagnosisItem }) => (
    <TouchableOpacity
      style={[styles.scanCard, theme === 'dark' && styles.darkCard]}
      onPress={() => router.push(`/tomatodx/result?id=${item.id}`)}
    >
      <View style={styles.scanHeader}>
        <View style={styles.scanImage}>
          <Text style={styles.scanEmoji}>{item.image}</Text>
        </View>
        <View style={styles.scanInfo}>
          <Text style={[styles.diseaseName, theme === 'dark' && styles.darkText]}>
            {item.disease}
          </Text>
          <View style={styles.scanMetaRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Ionicons name="ellipse" size={8} color={getStatusColor(item.status)} />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
            <Text style={[styles.scanDate, theme === 'dark' && styles.darkSubtext]}>
              {item.date}
            </Text>
          </View>
        </View>
        <View style={styles.scanMeta}>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>
              {item.confidence}%
            </Text>
          </View>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor(item.severity) + '20' }
            ]}
          >
            <Ionicons
              name={getSeverityIcon(item.severity) as any}
              size={16}
              color={getSeverityColor(item.severity)}
            />
          </View>
        </View>
      </View>

      <View style={styles.confidenceBar}>
        <View
          style={[
            styles.confidenceFill,
            {
              width: `${item.confidence}%`,
              backgroundColor: getSeverityColor(item.severity)
            }
          ]}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, theme === 'dark' && styles.darkText]}>
                {t('history.title')}
              </Text>
              <Text style={[styles.subtitle, theme === 'dark' && styles.darkSubtext]}>
                {t('history.subtitle', { count: filteredAndSortedScans.length })}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.filterButton, theme === 'dark' && styles.darkFilterButton]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons
                name="filter"
                size={20}
                color={theme === 'dark' ? '#fff' : '#666'}
              />
              <Text style={[styles.filterButtonText, theme === 'dark' && styles.darkText]}>
                {t('history.filters.title')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, theme === 'dark' && styles.darkCard]}>
              <Ionicons name="scan" size={20} color="#10b981" />
              <Text style={[styles.statNumber, theme === 'dark' && styles.darkText]}>
                {filteredAndSortedScans.length}
              </Text>
              <Text style={[styles.statLabel, theme === 'dark' && styles.darkSubtext]}>
                {t('history.totalScans')}
              </Text>
            </View>
            <View style={[styles.statCard, theme === 'dark' && styles.darkCard]}>
              <Ionicons name="trending-up" size={20} color="#10b981" />
              <Text style={[styles.statNumber, theme === 'dark' && styles.darkText]}>
                {Math.round(filteredAndSortedScans.reduce((acc, scan) => acc + scan.confidence, 0) / filteredAndSortedScans.length) || 0}%
              </Text>
              <Text style={[styles.statLabel, theme === 'dark' && styles.darkSubtext]}>
                {t('history.avgConfidence')}
              </Text>
            </View>
            <View style={[styles.statCard, theme === 'dark' && styles.darkCard]}>
              <Ionicons name="heart" size={20} color="#10b981" />
              <Text style={[styles.statNumber, theme === 'dark' && styles.darkText]}>
                {filteredAndSortedScans.filter(scan => scan.severity === 'none').length}
              </Text>
              <Text style={[styles.statLabel, theme === 'dark' && styles.darkSubtext]}>
                {t('history.healthy')}
              </Text>
            </View>
          </View>
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <View style={[styles.filtersPanel, theme === 'dark' && styles.darkCard]}>
            {/* Filter Types */}
            <Text style={[styles.filtersTitle, theme === 'dark' && styles.darkText]}>
              {t('history.filters.title')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
              <View style={styles.filtersRow}>
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterChip,
                      activeFilter === filter.key && styles.filterChipActive,
                      { borderColor: filter.color }
                    ]}
                    onPress={() => setActiveFilter(filter.key)}
                  >
                    <Ionicons
                      name={filter.icon as any}
                      size={16}
                      color={activeFilter === filter.key ? '#fff' : filter.color}
                    />
                    <Text style={[
                      styles.filterChipText,
                      activeFilter === filter.key && styles.filterChipTextActive
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Sort Options */}
            <Text style={[styles.filtersTitle, theme === 'dark' && styles.darkText]}>
              {t('history.sort.title')}
            </Text>
            <View style={styles.sortOptions}>
              {sortOptions.map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[
                    styles.sortOption,
                    activeSort === sort.key && styles.sortOptionActive,
                    theme === 'dark' && styles.darkSortOption
                  ]}
                  onPress={() => setActiveSort(sort.key)}
                >
                  <Ionicons
                    name={sort.icon as any}
                    size={16}
                    color={activeSort === sort.key ? '#10b981' : (theme === 'dark' ? '#999' : '#666')}
                  />
                  <Text style={[
                    styles.sortOptionText,
                    theme === 'dark' && styles.darkText,
                    activeSort === sort.key && styles.sortOptionTextActive
                  ]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Scan History */}
        <View style={styles.section}>
          {filteredAndSortedScans.length > 0 ? (
            <SectionList
              sections={groupedScans}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ScanItem item={item} />}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={[styles.sectionHeader, theme === 'dark' && styles.darkText]}>
                  {title}
                </Text>
              )}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={64} color="#999" />
              <Text style={[styles.emptyTitle, theme === 'dark' && styles.darkText]}>
                {t('history.noResults')}
              </Text>
              <Text style={[styles.emptyText, theme === 'dark' && styles.darkSubtext]}>
                {t('history.noResultsDesc')}
              </Text>
              <TouchableOpacity
                style={styles.resetFiltersButton}
                onPress={() => setActiveFilter('all')}
              >
                <Text style={styles.resetFiltersText}>
                  {t('history.resetFilters')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkFilterButton: {
    backgroundColor: '#1a1a1a',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filtersPanel: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  filtersScroll: {
    marginBottom: 20,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  darkSortOption: {
    backgroundColor: '#2d2d2d',
  },
  sortOptionActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  sortOptionTextActive: {
    color: '#10b981',
  },
  section: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
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
    marginBottom: 4,
  },
  scanMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  scanDate: {
    fontSize: 12,
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
    marginBottom: 20,
  },
  resetFiltersButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetFiltersText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});