// app/tomatodx/history.tsx - History Screen with Filters
import Colors from '@/constants/Colors';
import { formatEthiopianDate } from '@/src/utils/ethiopianCalendar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, Modal, ScrollView, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../../src/contexts/ThemeContext';
import { deleteDiagnosis, getRecentDiagnoses } from '../../src/db/repository';

interface DiagnosisItem {
  id: string;
  disease: string;
  diseaseAlt?: string;
  confidence: number;
  date: string;        // date + time (for the row)
  timestamp: number;
  severity: string;
  status: string;
  image: string;
  emoji: string;
  imageUri?: string;
  groupDate: string;   // NEW: date-only (for section header)
}

type FilterType = 'all' | 'healthy' | 'diseased' | 'high-risk' | 'treated' | 'pending';
type SortType = 'date-desc' | 'date-asc' | 'confidence-desc' | 'confidence-asc';

export default function HistoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const colors = Colors[theme];
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeSort, setActiveSort] = useState<SortType>('date-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DiagnosisItem | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  // Load diagnoses from database
  useFocusEffect(
    useCallback(() => {
      loadDiagnoses();
      startAnimations();
    }, [])
  );

  const startAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadDiagnoses = () => {
    try {
      const dbDiagnoses = getRecentDiagnoses(100);
      const formatted = dbDiagnoses.map((d: any) => {
        const confidence = Math.round((d.confidence || 0) * 100);

        // Map disease name to disease ID for translation lookup
        const diseaseId = mapDiseaseNameToId(d.nameEn || 'Unknown');

        // Get disease name from translations
        const diseaseNameEn = t(`diseases.${diseaseId}.name`, { lng: 'en', defaultValue: d.nameEn || 'Unknown' });
        const diseaseNameAm = t(`diseases.${diseaseId}.name`, { lng: 'am', defaultValue: d.nameAm || diseaseNameEn });
        const diseaseName = i18n.language === 'am' ? diseaseNameAm : diseaseNameEn;
        const diseaseNameAlt = i18n.language === 'am' ? diseaseNameEn : diseaseNameAm;

        const date = new Date(d.diagnosedAt);
        const timestamp = date.getTime();

        // Determine severity based on confidence
        let severity = 'none';
        if (diseaseId.toLowerCase().includes('healthy')) {
          severity = 'none';
        } else if (confidence >= 90) {
          severity = 'high';
        } else if (confidence >= 70) {
          severity = 'medium';
        } else {
          severity = 'low';
        }

        // Determine status (you can add a status field to DB later)
        const status = diseaseId === 'healthy' ? 'healthy' : 'pending';

        // Get emoji based on disease
        let emoji = '🌱';
        if (diseaseId.toLowerCase().includes('healthy')) emoji = '✅';
        else if (diseaseName.toLowerCase().includes('blight')) emoji = '⚠️';
        else if (diseaseName.toLowerCase().includes('spot')) emoji = '🦠';
        else if (diseaseName.toLowerCase().includes('mildew')) emoji = '🍂';
        
        
        // Date + time for the row
        const displayDate = i18n.language === 'am'
          ? formatEthiopianDate(date)           // your Ethiopian formatter WITH time
          : date.toLocaleString();              // includes time in English

        // Date-only for grouping / section headers
        const groupDate = i18n.language === 'am'
          ? formatEthiopianDate(date).split('፣')[0]  // take only "day month year"
          : date.toLocaleDateString();               // date only in English

      return {
      id: d.diagnosisId,
      disease: diseaseName,
      diseaseAlt: diseaseNameAlt,
      confidence,
      date: displayDate,     // used in <Text>{item.date}</Text> (with time)
      timestamp,
      severity,
      status,
      image: d.filePath,
      emoji,
      imageUri: d.filePath,
      groupDate,             // used only for grouping / section titles
    };
    });
    setDiagnoses(formatted);
    } catch (error) {
      console.error('Error loading diagnoses:', error);
      setDiagnoses([]);
    }
  };

  const filters: { key: FilterType; label: string; icon: string; color: string }[] = [
    { key: 'all', label: t('history.filters.all'), icon: 'apps', color: colors.muted },
    { key: 'healthy', label: t('history.filters.healthy'), icon: 'checkmark-circle', color: colors.success },
    { key: 'diseased', label: t('history.filters.diseased'), icon: 'warning', color: colors.danger },
    { key: 'high-risk', label: t('history.filters.highRisk'), icon: 'alert-circle', color: colors.warning },
    { key: 'treated', label: t('history.filters.treated'), icon: 'medical', color: colors.primary },
    { key: 'pending', label: t('history.filters.pending'), icon: 'time', color: colors.muted },
  ];

  const sortOptions: { key: SortType; label: string; icon: string }[] = [
    { key: 'date-desc', label: t('history.sort.newest'), icon: 'arrow-down' },
    { key: 'date-asc', label: t('history.sort.oldest'), icon: 'arrow-up' },
    { key: 'confidence-desc', label: t('history.sort.highConfidence'), icon: 'trending-up' },
    { key: 'confidence-asc', label: t('history.sort.lowConfidence'), icon: 'trending-down' },
  ];

  const filteredAndSortedScans = useMemo(() => {
    let filtered = [...diagnoses];

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
        filtered = [...diagnoses];
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
  }, [diagnoses, activeFilter, activeSort]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return colors.success;
      case 'treated': return colors.primary;
      case 'pending': return colors.warning;
      default: return colors.muted;
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
      if (!groups[scan.groupDate]) {
        groups[scan.groupDate] = [];
      }
      groups[scan.groupDate].push(scan);
    });

    return Object.entries(groups).map(([date, scans]) => ({
      title: date,
      data: scans,
    }));
  }, [filteredAndSortedScans]);

  const handleDeletePress = (item: DiagnosisItem) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      try {
        deleteDiagnosis(itemToDelete.id);
        setDiagnoses(prev => prev.filter(d => d.id !== itemToDelete.id));
        setDeleteModalVisible(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Error deleting diagnosis:', error);
        Alert.alert(t('common.error'), t('history.deleteError'));
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const renderRightActions = (
    item: DiagnosisItem,
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: colors.danger }]}
        onPress={() => handleDeletePress(item)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const ScanItem = ({ item }: { item: DiagnosisItem }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(item, progress, dragX)}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.scanCard, { backgroundColor: colors.card }]}
        onPress={() => router.push(`/tomatodx/result?id=${item.id}`)}
      >
        <View style={styles.scanHeader}>
          <View style={[styles.scanImage, { backgroundColor: colors.primaryOverlay }]}>
            {item.imageUri ? (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.scanImagePhoto}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.scanEmoji}>{item.emoji}</Text>
            )}
          </View>
          <View style={styles.scanInfo}>
            <Text style={[styles.diseaseName, { color: colors.text }]}>
              {item.disease}
            </Text>
            {item.diseaseAlt && (
              <Text style={[styles.diseaseNameAlt, { color: colors.textTertiary }]}>
                {item.diseaseAlt}
              </Text>
            )}
            <View style={styles.scanMetaRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Ionicons name="ellipse" size={8} color={getStatusColor(item.status)} />
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
              <Text style={[styles.scanDate, { color: colors.textSecondary }]}>
                {item.date}
              </Text>
            </View>
          </View>
          <View style={styles.scanMeta}>
            <View style={[styles.confidenceBadge, { backgroundColor: colors.primary }]}>
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

        <View style={[styles.confidenceBar, { backgroundColor: colors.border }]}>
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
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.headerTop}>
              <View style={styles.titleContainer}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {t('history.title')}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {t('history.subtitle', { count: filteredAndSortedScans.length })}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: colors.card }]}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Ionicons
                  name="filter"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={[styles.filterButtonText, { color: colors.textSecondary }]}>
                  {t('history.filters.title')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="scan" size={20} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {filteredAndSortedScans.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('history.totalScans')}
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="trending-up" size={20} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {Math.round(filteredAndSortedScans.reduce((acc, scan) => acc + scan.confidence, 0) / filteredAndSortedScans.length) || 0}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('history.avgConfidence')}
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="heart" size={20} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {filteredAndSortedScans.filter(scan => scan.severity === 'none').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('history.healthy')}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Filters Panel */}
          {showFilters && (
            <View style={[styles.filtersPanel, { backgroundColor: colors.card }]}>
              {/* Filter Types */}
              <Text style={[styles.filtersTitle, { color: colors.text }]}>
                {t('history.filters.title')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
                <View style={styles.filtersRow}>
                  {filters.map((filter) => (
                    <TouchableOpacity
                      key={filter.key}
                      style={[
                        styles.filterChip,
                        activeFilter === filter.key && [styles.filterChipActive, { backgroundColor: colors.primary }],
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
                        { color: activeFilter === filter.key ? '#fff' : filter.color }
                      ]}>
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Sort Options */}
              <Text style={[styles.filtersTitle, { color: colors.text }]}>
                {t('history.sort.title')}
              </Text>
              <View style={styles.sortOptions}>
                {sortOptions.map((sort) => (
                  <TouchableOpacity
                    key={sort.key}
                    style={[
                      styles.sortOption,
                      { backgroundColor: colors.backgroundAlt },
                      activeSort === sort.key && [styles.sortOptionActive, { backgroundColor: colors.successBg }],
                    ]}
                    onPress={() => setActiveSort(sort.key)}
                  >
                    <Ionicons
                      name={sort.icon as any}
                      size={16}
                      color={activeSort === sort.key ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                      styles.sortOptionText,
                      { color: colors.textSecondary },
                      activeSort === sort.key && { color: colors.primary }
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
                  <Text style={[styles.sectionHeader, { color: colors.text }]}>
                    {title}
                  </Text>
                )}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={64} color={colors.muted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t('history.noResults')}
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('history.noResultsDesc')}
                </Text>
                <TouchableOpacity
                  style={[styles.resetFiltersButton, { backgroundColor: colors.primary }]}
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

        {/* Delete Confirmation Modal */}
        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={handleDeleteCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalIcon, { backgroundColor: colors.danger + '20' }]}>
                <Text style={styles.modalEmoji}>{itemToDelete?.emoji || '⚠️'}</Text>
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('history.deleteConfirmTitle')}
              </Text>
              <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                {t('history.deleteConfirmMessage')}
              </Text>
              {itemToDelete && (
                <Text style={[styles.modalDiseaseName, { color: colors.text }]}>
                  {itemToDelete.disease}
                </Text>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: colors.backgroundAlt }]}
                  onPress={handleDeleteCancel}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonDelete, { backgroundColor: colors.danger }]}
                  onPress={handleDeleteConfirm}
                >
                  <Text style={styles.modalButtonTextDelete}>
                    {t('common.delete')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  filtersPanel: {
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
    borderColor: 'transparent',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  sortOptionActive: {
    borderColor: '#10b981',
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  scanCard: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  scanImagePhoto: {
    width: 40,
    height: 40,
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
    marginBottom: 2,
  },
  diseaseNameAlt: {
    fontSize: 11,
    fontStyle: 'italic',
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
  },
  scanMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  confidenceBadge: {
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetFiltersButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetFiltersText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 12,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 48,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalDiseaseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonDelete: {
    backgroundColor: '#ef4444',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextDelete: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});