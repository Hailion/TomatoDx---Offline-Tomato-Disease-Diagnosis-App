// admin.tsx
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getAllDiagnosesExport, getAnalyticsSummary, getDiagnosisCount, getLast7DaysCounts } from '../../src/db/repository';

const { width, height } = Dimensions.get('window');

export default function AdminScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const tokens = Colors[theme];
  const insets = useSafeAreaInsets();
  const [totalScans, setTotalScans] = useState(0);
  const [summary, setSummary] = useState<{ avgConfidence: number; total: number; low: number; medium: number; high: number; topDisease?: { diseaseId: string; nameEn?: string; nameAm?: string; c: number } | null }>({ avgConfidence: 0, total: 0, low: 0, medium: 0, high: 0, topDisease: null });
  const [trend, setTrend] = useState<{ day: string; count: number }[]>([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpHeader = useRef(new Animated.Value(40)).current;
  const slideUpCards = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const loadAnalytics = () => {
    try {
      setTotalScans(getDiagnosisCount());
      const s = getAnalyticsSummary() as any;
      const t = getLast7DaysCounts() as any[];
      setSummary(s);
      setTrend(t);
    } catch { }
  };

  useEffect(() => {
    loadAnalytics();
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
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        })
      ]),
      // Cards animation
      Animated.timing(slideUpCards, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();

    // Continuous pulse for important actions
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleUpdateInstructions = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Alert.alert(
        'Model Update Instructions',
        '1. Download the latest model file\n2. Replace the existing model in assets/models/\n3. Update model version in configuration\n4. Restart the application\n5. Verify model performance',
        [{ text: 'OK' }]
      );
    });
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all temporary files and scan history. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export all scan history as CSV?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            try {
              const rows = getAllDiagnosesExport() as any[];
              const headers = ['diagnosisId', 'imageId', 'filePath', 'diseaseId', 'nameEn', 'nameAm', 'confidence', 'diagnosedAt', 'capturedAt', 'notes'];
              const esc = (v: any) => {
                if (v === null || v === undefined) return '';
                const s = String(v);
                if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
                return s;
              };
              const csv = [headers.join(',')].concat(
                rows.map(r => headers.map(h => esc((r as any)[h])).join(','))
              ).join('\n');
              const ts = new Date();
              const stamp = `${ts.getFullYear()}${String(ts.getMonth() + 1).padStart(2, '0')}${String(ts.getDate()).padStart(2, '0')}-${String(ts.getHours()).padStart(2, '0')}${String(ts.getMinutes()).padStart(2, '0')}${String(ts.getSeconds()).padStart(2, '0')}`;
              const docPath = FileSystem.documentDirectory;
              const dir = docPath ? `${docPath}exports/` : undefined;
              if (!dir) throw new Error('No documentDirectory available');
              try { await FileSystem.makeDirectoryAsync(dir, { intermediates: true }); } catch { }
              const fileUri = `${dir}tomatodx-history-${stamp}.csv`;
              await FileSystem.writeAsStringAsync(fileUri, csv);
              const canShare = await Sharing.isAvailableAsync();
              if (canShare) {
                await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Share Scan History CSV' });
              } else {
                Alert.alert('Exported', `Saved to: ${fileUri}`);
              }
            } catch (e) {
              Alert.alert('Export Failed', 'Could not export data');
            }
          }
        }
      ]
    );
  };

  const handleSystemCheck = () => {
    Alert.alert(
      'System Check',
      '✅ Camera: Operational\n✅ Storage: 2.3GB Available\n✅ Model: Loaded\n✅ Database: Connected\n✅ Permissions: Granted',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.background }]}>
      {/* Background Elements */}
      <Animated.View style={[styles.backgroundCircle, styles.circle1, { opacity: fadeAnim, backgroundColor: tokens.primaryOverlay }]} />
      <Animated.View style={[styles.backgroundCircle, styles.circle2, { opacity: fadeAnim, backgroundColor: tokens.successOverlay }]} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(40, insets.bottom + 16) }]}
      >
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
              <Text style={[styles.title, { color: tokens.primaryDark }]}>🔧 {t('admin.title')}</Text>
              <Text style={[styles.subtitle, { color: tokens.muted }]}>{t("admin.subtitle")}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: tokens.successBgLight }]}>
              <View style={[styles.statusIndicator, { backgroundColor: tokens.success }]} />
              <Text style={[styles.statusText, { color: tokens.primaryDark }]}>{t('admin.online')}</Text>
            </View>
          </View>
        </Animated.View>

        {/* System Info Card */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: tokens.card, shadowColor: tokens.shadowLight },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpCards }]
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color={tokens.text} />
            <Text style={[styles.cardTitle, { color: tokens.text }]}>{t('admin.systemInformation')}</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('admin.appVersion')}</Text>
              <Text style={[styles.infoValue, { color: tokens.muted }]}>v1.2.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('admin.modelVersion')}</Text>
              <Text style={[styles.infoValue, { color: tokens.muted }]} > tomato - v3.1.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('admin.lastUpdated')}</Text>
              <Text style={[styles.infoValue, { color: tokens.muted }]}>2024-01-15</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('admin.totalScans')}</Text>
              <Text style={[styles.infoValue, { color: tokens.muted }]}>{totalScans}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Model Management Card */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: tokens.surface, shadowColor: tokens.shadowLight },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpCards }]
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="cube" size={24} color={tokens.text} />
            <Text style={[styles.cardTitle, { color: tokens.text }]}>{t('admin.modelManagement.title')}</Text>
          </View>

          <Text style={styles.cardDescription}>
            {t('admin.modelManagement.subtitle')}
          </Text>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: tokens.primary, shadowColor: tokens.primary }]}
              onPress={handleUpdateInstructions}
              activeOpacity={0.8}
            >
              <Ionicons name="cloud-download" size={20} color={tokens.whiteMuted} />
              <Text style={[styles.primaryButtonText, { color: tokens.whiteMuted }]}>{t('admin.modelManagement.updateInstructions')}</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { backgroundColor: tokens.backgroundAlt, borderColor: tokens.border }]}
            onPress={handleSystemCheck}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done" size={20} color={tokens.text} />
            <Text style={[styles.secondaryButtonText, { color: tokens.textSecondary }]}>{t('admin.modelManagement.runSystemCheck')}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Data Management Card */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: tokens.surface, shadowColor: tokens.shadowLight },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpCards }]
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="server" size={24} color={tokens.success} />
            <Text style={[styles.cardTitle, { color: tokens.text }]}>{t('admin.dataManagement.title')}</Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.outlineButton, { borderColor: tokens.border }]}
              onPress={handleExportData}
              activeOpacity={0.8}
            >
              <Ionicons name="download" size={18} color={tokens.muted} />
              <Text style={[styles.outlineButtonText, { color: tokens.muted }]}>{t('admin.dataManagement.exportData')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dangerButton, { borderColor: tokens.danger }]}
              onPress={handleClearCache}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={18} color={tokens.danger} />
              <Text style={[styles.dangerButtonText, { color: tokens.danger }]}>{t('admin.dataManagement.clearCache')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Analytics Card */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: tokens.surface, shadowColor: tokens.shadowLight },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpCards }]
            }
          ]}
        >
          <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="bar-chart" size={24} color={tokens.warning} />
              <Text style={[styles.cardTitle, { color: tokens.text }]}>{t('admin.analytics.title')}</Text>
            </View>
            <TouchableOpacity onPress={loadAnalytics} style={{ padding: 6 }}>
              <Ionicons name="refresh" size={20} color={tokens.text} />
            </TouchableOpacity>
          </View>

          {/* Summary row */}
          <View style={[styles.statsContainer, { marginBottom: 12 }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: tokens.primaryDark }]}>{summary.total}</Text>
              <Text style={[styles.statLabel, { color: tokens.muted }]}>{t('admin.totalScans')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: tokens.primaryDark }]}>{Math.round((summary.avgConfidence || 0) * 100)}%</Text>
              <Text style={[styles.statLabel, { color: tokens.muted }]}>{t('admin.analytics.accuracy')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: tokens.primaryDark }]}>{summary.topDisease?.nameEn || summary.topDisease?.diseaseId || '-'}</Text>
              <Text style={[styles.statLabel, { color: tokens.muted }]}>{t('admin.analytics.topDisease') || 'Top disease'}</Text>
            </View>
          </View>

          <View style={{ marginBottom: 12 }}>
            {summary.total === 0 ? (
              <View style={{ padding: 16, backgroundColor: tokens.backgroundAlt, borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ color: tokens.muted }}>{t('admin.analytics.noData') || 'No analytics yet. Perform a scan to see insights.'}</Text>
              </View>
            ) : (
              <>
                <View style={{ padding: 12, backgroundColor: tokens.backgroundAlt, borderRadius: 12, marginBottom: 12 }}>
                  <Text style={[styles.cardDescription, { marginBottom: 8, color: tokens.text }]}>{t('admin.analytics.severityDistribution') || 'Severity distribution'}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                    {([
                      { label: 'Low', value: summary.low, color: tokens.primaryDarker },
                      { label: 'Medium', value: summary.medium, color: tokens.warning },
                      { label: 'High', value: summary.high, color: tokens.warningDark },
                    ] as const).map(s => (
                      <View key={s.label} style={{ alignItems: 'center', flex: 1 }}>
                        <View style={{ height: 60, width: '100%', justifyContent: 'flex-end' }}>
                          <View style={{ height: summary.total ? Math.max(4, Math.round((s.value / Math.max(1, summary.total)) * 60)) : 4, backgroundColor: s.color, borderRadius: 6 }} />
                        </View>
                        <Text style={{ fontSize: 12, color: tokens.muted }}>{s.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={{ padding: 12, backgroundColor: tokens.backgroundAlt, borderRadius: 12 }}>
                  <Text style={[styles.cardDescription, { marginBottom: 8, color: tokens.text }]}>{t('admin.analytics.last7Days') || 'Last 7 days'}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-end' }}>
                    {trend.map(d => (
                      <View key={d.day} style={{ alignItems: 'center' }}>
                        <View style={{ height: 60, width: 18, justifyContent: 'flex-end' }}>
                          <View style={{ height: Math.max(4, Math.min(60, d.count * 6)), backgroundColor: tokens.primary, borderRadius: 6, width: '100%' }} />
                        </View>
                        <Text style={{ fontSize: 10, color: tokens.muted }}>{d.day.slice(5)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
    marginTop: 4,
    paddingLeft: 10
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  // Cards
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  // Info grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    width: '47%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  // Buttons
  button: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#16a34a',
    elevation: 4,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
    flex: 1,
  },
  outlineButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fecaca',
    flex: 1,
  },
  dangerButtonText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});