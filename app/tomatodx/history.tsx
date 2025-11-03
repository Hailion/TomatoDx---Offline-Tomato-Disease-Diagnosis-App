// history.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { deleteDiagnosis, getDiagnosesPage } from '../../src/db/repository';
import { initDb } from '../../src/db/schema';
import i18n from '../../src/i18n/i18n';
import { ethiopianToGregorian, formatEthiopianDate } from '../../src/utils/ethiopianCalendar';
import { NavigationUtils } from '../../src/utils/navigation';

type HistoryItem = {
  diagnosisId: string;
  imageId: string;
  diseaseId: string;
  confidence?: number;
  diagnosedAt?: string;
  filePath?: string;
  capturedAt?: string;
  nameEn?: string;
  nameAm?: string;
  severity?: string;
};

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const tokens = Colors[theme];
  const insets = useSafeAreaInsets();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpHeader = useRef(new Animated.Value(30)).current;
  const slideUpList = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  const [items, setItems] = useState<HistoryItem[]>([]);
  const PAGE_SIZE = 20;
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Week' | 'Month' | 'Custom'>('All');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDay, setCustomDay] = useState('');
  const [customMonth, setCustomMonth] = useState('');
  const [customYear, setCustomYear] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    initDb();
  }, []);

  // Helper function to derive severity from confidence
  const deriveSeverity = (confidence?: number) => {
    if (typeof confidence !== 'number') return 'Low';
    return confidence >= 0.9 ? 'High' : confidence >= 0.7 ? 'Medium' : 'Low';
  };

  // Helper function to get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case 'Today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'Week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        return { start: weekStart, end: now };
      case 'Month':
        const monthStart = new Date(today);
        monthStart.setDate(today.getDate() - 30);
        return { start: monthStart, end: now };
      case 'Custom':
        return customDateRange;
      default:
        return { start: null, end: null };
    }
  };

  // Helper function to filter items by all criteria
  const getFilteredItems = (items: HistoryItem[]) => {
    return items.filter(item => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const nameEn = (item.nameEn || '').toLowerCase();
        const nameAm = (item.nameAm || '').toLowerCase();
        if (!nameEn.includes(searchLower) && !nameAm.includes(searchLower)) {
          return false;
        }
      }

      // Severity filter
      if (severity !== 'All') {
        const itemSeverity = deriveSeverity(item.confidence);
        if (itemSeverity !== severity) {
          return false;
        }
      }

      // Date filter
      if (dateFilter !== 'All') {
        const { start, end } = getDateRange();
        if (start && end) {
          const itemDate = new Date(item.diagnosedAt || item.capturedAt || '');
          if (isNaN(itemDate.getTime()) || itemDate < start || itemDate > end) {
            return false;
          }
        }
      }

      return true;
    });
  };

  // Computed filtered items for display
  const filteredItems = getFilteredItems(items);

  // Custom date input modal
  const showCustomDatePicker = () => {
    setShowDatePicker(true);
  };

  // Handle custom date input
  const handleCustomDateInput = (day: string, month: string, year: string) => {
    if (!day || !month || !year) {
      Alert.alert(t('common.error') || 'Error', 'Please fill in all date fields.');
      return;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    try {
      let selectedDate: Date;

      if (i18n.language === 'am') {
        // Handle Ethiopian calendar input
        if (dayNum >= 1 && dayNum <= 30 && monthNum >= 1 && monthNum <= 13 && yearNum >= 1900) {
          // Convert Ethiopian date to Gregorian
          selectedDate = ethiopianToGregorian(yearNum, monthNum, dayNum);
        } else {
          Alert.alert(t('common.error') || 'Error', 'Please enter a valid Ethiopian date (Day: 1-30, Month: 1-13).');
          return;
        }
      } else {
        // Handle Gregorian calendar input
        const gregorianMonth = monthNum - 1; // JavaScript months are 0-indexed
        if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= new Date().getFullYear()) {
          selectedDate = new Date(yearNum, gregorianMonth, dayNum);
        } else {
          Alert.alert(t('common.error') || 'Error', 'Please enter a valid date (Day: 1-31, Month: 1-12, Year: 1900-current year).');
          return;
        }
      }

      if (!isNaN(selectedDate.getTime()) && selectedDate <= new Date()) {
        // Set date range for the specific date (start of day to end of day)
        const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);
        setCustomDateRange({ start: startOfDay, end: endOfDay });
        setShowDatePicker(false);
        // Clear input fields
        setCustomDay('');
        setCustomMonth('');
        setCustomYear('');
      } else {
        Alert.alert(t('common.error') || 'Error', 'Please enter a valid date that is not in the future.');
      }
    } catch (error) {
      Alert.alert(t('common.error') || 'Error', 'Invalid date format. Please check your input.');
    }
  };

  const loadPage = useCallback((startOffset: number) => {
    if ((startOffset !== 0 && loading) || (startOffset !== 0 && !hasMore)) return;
    setLoading(true);
    try {
      const rows = getDiagnosesPage(
        PAGE_SIZE,
        startOffset,
        {
          search: search.trim() || undefined,
          severity: severity !== 'All' ? severity : undefined,
        }
      ) as HistoryItem[];
      setItems(prev => {
        const existing = new Set(prev.map(i => i.diagnosisId));
        const merged = [...prev, ...rows.filter(r => !existing.has(r.diagnosisId))];
        return getFilteredItems(merged);
      });
      setOffset(startOffset + rows.length);
      setHasMore(rows.length === PAGE_SIZE);
    } catch { }
    finally {
      setLoading(false);
    }
  }, [loading, hasMore, search, severity, dateFilter, customDateRange]);

  const loadInitial = useCallback(() => {
    setHasMore(true);
    setOffset(0);
    setItems([]);
    loadPage(0);
  }, [loadPage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try { loadInitial(); } finally { setRefreshing(false); }
  }, [loadInitial]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!cancelled) loadPage(0);
      return () => { cancelled = true; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  useEffect(() => {
    setHasMore(true);
    setOffset(0);
    setItems([]);
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, severity, dateFilter, customDateRange]);

  const handleItemPress = (item: HistoryItem) => {
    // Quick animation feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      NavigationUtils.push('/tomatodx/result', {
        uri: item.filePath || '',
        imageId: item.imageId,
        diagnosisId: item.diagnosisId
      });
    });
  };

  const showDeleteConfirmation = (diagnosisId: string) => {
    setItemToDelete(diagnosisId);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      deleteDiagnosis(itemToDelete);
      setItems(prev => prev.filter(i => i.diagnosisId !== itemToDelete));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setDeleteConfirmVisible(false);
    setItemToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmVisible(false);
    setItemToDelete(null);
  };


  const getSeverityColor = (severity?: string, confidence?: number) => {
    const s = (severity || deriveSeverity(confidence)).toLowerCase();
    switch (s) {
      case 'critical': return tokens.danger;
      case 'high': return tokens.warning;
      case 'medium': return tokens.warningDark;
      case 'low': return tokens.primaryDarker;
      default: return tokens.primaryDark;
    }
  };

  const getSeverityIcon = (severity?: string, confidence?: number) => {
    const s = (severity || deriveSeverity(confidence)).toLowerCase();
    switch (s) {
      case 'critical': return 'warning';
      case 'high': return 'alert-circle';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'leaf';
    }
  };

  // Normalize stored diseaseId or raw labels to our i18n keys
  const normalizeDiseaseId = (raw?: string) => {
    const l = (raw || '').trim().toLowerCase();
    switch (l) {
      case 'late blight':
        return 'late_blight';
      case 'early blight':
        return 'early_blight';
      case 'leaf mold':
        return 'leaf_mold';
      case 'septoria leaf spot':
        return 'septoria_leaf_spot';
      case 'tomato yellow leaf curl':
      case 'tomato yellow leaf curl virus':
      case 'tomato_yellow_leaf_curl_virus':
        return 'tomato_yellow_leaf_curl';
      case 'spider mites two-spotted spider mite':
      case 'spider_mites_two_spotted_spider_mite':
      case 'spider_mites_two_spotted_spider_mites':
        return 'spider_mites_two_spotted_spider_mites';
      case 'tomato mosaic virus':
        return 'tomato_mosaic_virus';
      case 'bacterial_spot':
      case 'bacterial spot':
        return 'bacterial_spot';
      case 'healthy':
        return 'healthy';
      default:
        return l.replace(/[^a-z0-9]+/g, '_');
    }
  };

  // Extracted list item into a proper component so hooks are used in a component
  const HistoryListItem = ({ item, index }: { item: HistoryItem; index: number }) => {
    // keep ref object stable to avoid hook dependency issues
    const itemAnimRef = useRef(new Animated.Value(0));

    useEffect(() => {
      Animated.timing(itemAnimRef.current, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, [index]);

    const dateISO = item.diagnosedAt ?? item.capturedAt ?? null;
    const dateObj = dateISO ? new Date(dateISO) : null;
    const dateText = dateObj && !isNaN(dateObj.getTime())
      ? (i18n.language === 'am'
        ? formatEthiopianDate(dateObj)
        : dateObj.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }))
      : '';

    const renderRightActions = () => (
      <View style={styles.deleteAction}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => showDeleteConfirmation(item.diagnosisId)}
        >
          <Ionicons name="trash" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    );

    return (
      <Animated.View
        style={{
          opacity: itemAnimRef.current,
          transform: [
            {
              translateY: itemAnimRef.current.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        }}
      >
        <Swipeable
          renderRightActions={renderRightActions}
          overshootRight={false}
        >
          <TouchableOpacity
            style={[styles.historyItem, { backgroundColor: tokens.backgroundAlt }]}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft}>
              <View style={styles.imageContainer}>
                {item.filePath ? (
                  <Image source={{ uri: item.filePath }} style={styles.itemImageThumb} resizeMode="cover" />
                ) : (
                  <Text style={styles.itemImage}>🖼️</Text>
                )}
              </View>
              <View style={styles.itemInfo}>
                {(() => {
                  const normId = normalizeDiseaseId(item.diseaseId);
                  const fallback1 = t(`diseases.${item.diseaseId}.name`, { defaultValue: item.nameEn || item.diseaseId });
                  const display = t(`diseases.${normId}.name`, { defaultValue: fallback1 });
                  return (
                    <Text style={[styles.diseaseName, { color: tokens.primaryDark }]}>{display}</Text>
                  );
                })()}
                <Text style={[styles.date, { color: tokens.muted }]}>{dateText}</Text>
                <View style={styles.confidenceContainer}>
                  <View style={styles.confidenceBar}>
                    <View
                      style={[
                        styles.confidenceFill,
                        {
                          width: `${Math.round((item.confidence ?? 0) * 100)}%`,
                          backgroundColor: tokens.primaryDark
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.confidenceText, { color: tokens.muted }]}>
                    {Math.round((item.confidence ?? 0) * 100)}%
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.itemRight}>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(item.severity, item.confidence) + '20' }
                ]}
              >
                <Ionicons
                  name={getSeverityIcon(item.severity, item.confidence) as any}
                  size={16}
                  color={getSeverityColor(item.severity, item.confidence)}
                />
                <Text
                  style={[
                    styles.severityText,
                    { color: getSeverityColor(item.severity, item.confidence) }
                  ]}
                >
                  {item.severity || deriveSeverity(item.confidence)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  };

  useEffect(() => {
    Animated.sequence([
      // Fade in background
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Header animation
      Animated.parallel([
        Animated.timing(slideUpHeader, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        })
      ]),
      // List animation
      Animated.timing(slideUpList, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim, slideUpHeader, slideUpList]);

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
              { translateY: slideUpHeader },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: tokens.primaryDark }]}>📋 {t("history.title")}</Text>
            <Text style={[styles.subtitle, { color: tokens.muted }]}>
              {filteredItems.length} {t("history.subtitle")}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: tokens.primaryDark }]}>{filteredItems.length}</Text>
              <Text style={[styles.statLabel, { color: tokens.muted }]}>
                {t('history.total')}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('history.search') || 'Search disease'}
          placeholderTextColor={tokens.muted}
          style={[styles.searchInput, { borderColor: tokens.backgroundAlt, color: tokens.primaryDark }]}
        />
        <View style={styles.chipsRow}>
          {(['All', 'Low', 'Medium', 'High'] as const).map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setSeverity(s)}
              style={[
                styles.chip,
                { backgroundColor: severity === s ? tokens.primaryOverlay : tokens.backgroundAlt, borderColor: tokens.backgroundAlt }
              ]}
            >
              <Text style={[styles.chipText, { color: severity === s ? tokens.primaryDark : tokens.muted }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Filter */}
        <View style={styles.dateFilterContainer}>
          <Text style={[styles.filterLabel, { color: tokens.primaryDark }]}>{t('history.filterByDate')}:</Text>
          <View style={styles.chipsRow}>
            {(['All', 'Today', 'Week', 'Month', 'Custom'] as const).map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => {
                  setDateFilter(d);
                  if (d === 'Custom') {
                    showCustomDatePicker();
                  }
                }}
                style={[
                  styles.chip,
                  { backgroundColor: dateFilter === d ? tokens.primaryOverlay : tokens.backgroundAlt, borderColor: tokens.backgroundAlt }
                ]}
              >
                <Text style={[styles.chipText, { color: dateFilter === d ? tokens.primaryDark : tokens.muted }]}>
                  {t(`history.dateFilters.${d.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {dateFilter === 'Custom' && customDateRange.start && (
            <View style={styles.customDateDisplay}>
              <Text style={[styles.dateRangeText, { color: tokens.muted }]}>
                📅 {customDateRange.start?.toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* History List */}
      <Animated.View
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpList }]
          }
        ]}
      >
        {filteredItems.length > 0 ? (
          <FlatList
            data={filteredItems}
            keyExtractor={(i: HistoryItem) => i.diagnosisId}
            renderItem={({ item, index }) => (
              <HistoryListItem item={item} index={index} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(20, insets.bottom) }]}
            ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: tokens.backgroundAlt }]} />}
            onEndReachedThreshold={0.2}
            onEndReached={() => loadPage(offset)}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListFooterComponent={loading && hasMore ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator size="small" color={tokens.primaryDark} />
              </View>
            ) : null}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Scan History</Text>
            <Text style={styles.emptyText}>
              Your tomato disease detection history will appear here
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDeleteCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: tokens.backgroundAlt }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={48} color={tokens.warning} />
              <Text style={[styles.modalTitle, { color: tokens.primaryDark }]}>
                {t('history.deleteTitle')}
              </Text>
              <Text style={[styles.modalMessage, { color: tokens.muted }]}>
                {t('history.deleteConfirm')}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: tokens.backgroundAlt, borderColor: tokens.muted }]}
                onPress={handleDeleteCancel}
              >
                <Text style={[styles.modalButtonText, { color: tokens.muted }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButtonModal, { backgroundColor: tokens.danger }]}
                onPress={handleDeleteConfirm}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>
                  {t('common.delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Date Input Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: tokens.backgroundAlt }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: tokens.primaryDark }]}>
                {t('history.customDatePicker.title')}
              </Text>
              <Text style={[styles.modalMessage, { color: tokens.muted }]}>
                {t('history.customDatePicker.selectDate')}
              </Text>
              {i18n.language === 'am' && (
                <Text style={[styles.modalMessage, { color: tokens.primary, fontSize: 12, marginTop: 4 }]}>
                  {t('history.customDatePicker.ethiopianNote')}
                </Text>
              )}
            </View>

            <View style={styles.dateInputContainer}>
              <View style={styles.dateInputRow}>
                <View style={styles.dateInputField}>
                  <Text style={[styles.dateInputLabel, { color: tokens.primaryDark }]}>
                    {t('history.customDatePicker.day')}
                  </Text>
                  <TextInput
                    style={[styles.dateInput, { borderColor: tokens.backgroundAlt, color: tokens.primaryDark }]}
                    value={customDay}
                    onChangeText={setCustomDay}
                    placeholder="DD"
                    placeholderTextColor={tokens.muted}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                <View style={styles.dateInputField}>
                  <Text style={[styles.dateInputLabel, { color: tokens.primaryDark }]}>
                    {t('history.customDatePicker.month')}
                  </Text>
                  <TextInput
                    style={[styles.dateInput, { borderColor: tokens.backgroundAlt, color: tokens.primaryDark }]}
                    value={customMonth}
                    onChangeText={setCustomMonth}
                    placeholder="MM"
                    placeholderTextColor={tokens.muted}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                <View style={styles.dateInputField}>
                  <Text style={[styles.dateInputLabel, { color: tokens.primaryDark }]}>
                    {t('history.customDatePicker.year')}
                  </Text>
                  <TextInput
                    style={[styles.dateInput, { borderColor: tokens.backgroundAlt, color: tokens.primaryDark }]}
                    value={customYear}
                    onChangeText={setCustomYear}
                    placeholder="YYYY"
                    placeholderTextColor={tokens.muted}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: tokens.backgroundAlt, borderColor: tokens.muted }]}
                onPress={() => {
                  setShowDatePicker(false);
                  setCustomDay('');
                  setCustomMonth('');
                  setCustomYear('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: tokens.muted }]}>
                  {t('history.customDatePicker.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: tokens.primary }]}
                onPress={() => handleCustomDateInput(customDay, customMonth, customYear)}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>
                  {t('history.customDatePicker.apply')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  statsContainer: {
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#166534',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  // List
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  filterRow: {
    paddingHorizontal: 0,
    marginHorizontal: 20,
    paddingBottom: 12,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 8,
  },
  // History Item
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#dcfce7',
  },
  itemImage: {
    fontSize: 20,
  },
  itemImageThumb: {
    width: 46,
    height: 46,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 30,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
  // Swipeable delete action
  deleteAction: {
    flex: 1,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  deleteButton: {
    width: 70,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Date Filter
  dateFilterContainer: {
    marginTop: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  customDateDisplay: {
    marginTop: 8,
    alignItems: 'center',
  },
  dateRangeText: {
    fontSize: 14,
    fontStyle: 'italic',
    width: '100%',
    textAlign: 'center',
    padding: 8,

  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  deleteButtonModal: {
    backgroundColor: '#ef4444',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateInputContainer: {
    marginBottom: 24,
  },
  dateInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputField: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#ffffff',
  }
});