// app/admin-info.tsx - Enhanced Admin Analytics & Information Dashboard
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { exportAnalyticsData, getAnalyticsSummary, getLast7DaysCounts } from '../src/db/repository';

// Types for our analytics data
interface AnalyticsSummary {
    total: number;
    avgConfidence: number | null;
    healthyCount: number;
    low: number;
    medium: number;
    high: number;
    topDisease: {
        diseaseId: string;
        nameEn?: string;
        nameAm?: string;
        c: number;
    } | null;
}

interface DailyCount {
    day: string;
    count: number;
}

export default function AdminInfoScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const colors = Colors[theme];

    // State management
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
    const [last7DaysCounts, setLast7DaysCounts] = useState<DailyCount[]>([]);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    /**
     * Validates admin authorization status by checking AsyncStorage
     * Redirects back if user is not authorized to view admin analytics
     */
    const checkAuthorization = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            const adminUnlocked = await AsyncStorage.getItem('adminUnlocked');
            
            if (adminUnlocked === 'true') {
                setIsAuthorized(true);
            } else {
                console.warn('Unauthorized access attempt to admin analytics');
                router.back();
            }
        } catch (error) {
            console.error('Authorization check failed (admin-info):', error);
            Alert.alert(
                t('common.error'),
                t('admin.analytics.authError')
            );
            router.back();
        } finally {
            setIsLoading(false);
        }
    }, [router, t]);

    /**
     * Fetches and processes analytics data from the database
     * Handles both summary statistics and historical trend data
     */
    const loadAnalytics = useCallback(async (showRefreshIndicator: boolean = false): Promise<void> => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsAnalyticsLoading(true);
            }

            // Fetch analytics data concurrently for better performance
            const [summary, last7Days] = await Promise.allSettled([
                getAnalyticsSummary(),
                getLast7DaysCounts()
            ]);

            // Process summary data
            if (summary.status === 'fulfilled') {
                setAnalyticsSummary(summary.value as AnalyticsSummary);
            } else {
                console.error('Failed to load analytics summary:', summary.reason);
                throw new Error('SUMMARY_LOAD_FAILED');
            }

            // Process historical data
            if (last7Days.status === 'fulfilled') {
                setLast7DaysCounts(last7Days.value as DailyCount[]);
            } else {
                console.error('Failed to load 7-day counts:', last7Days.reason);
                // We don't throw here as the main summary is more critical
            }

        } catch (error) {
            console.error('Analytics data loading failed (admin-info):', error);
            Alert.alert(
                t('common.error'),
                t('admin.analytics.loadError')
            );
        } finally {
            setIsAnalyticsLoading(false);
            setIsRefreshing(false);
        }
    }, [t]);

    /**
     * Handles manual refresh with pull-to-refresh gesture
     */
    const handleRefresh = useCallback((): void => {
        loadAnalytics(true);
    }, [loadAnalytics]);

    /**
     * Exports analytics data for external use or backup
     */
    const handleExportData = useCallback(async (): Promise<void> => {
        try {
            setIsAnalyticsLoading(true);
            const exportResult = await exportAnalyticsData();
            
            if (exportResult.success) {
                Alert.alert(
                    t('common.success'),
                    t('admin.analytics.exportSuccess')
                );
            } else {
                throw new Error(exportResult.error || 'Export failed');
            }
        } catch (error) {
            console.error('Data export failed:', error);
            Alert.alert(
                t('common.error'),
                t('admin.analytics.exportError')
            );
        } finally {
            setIsAnalyticsLoading(false);
        }
    }, [t]);

    // Authorization effect - runs on component mount
    useEffect(() => {
        checkAuthorization();
    }, [checkAuthorization]);

    // Analytics loading effect - runs when authorization is confirmed
    useEffect(() => {
        if (isAuthorized) {
            loadAnalytics();
        }
    }, [isAuthorized, loadAnalytics]);

    // Render loading state
    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        {t('admin.analytics.verifyingAccess')}
                    </Text>
                </View>
            </View>
        );
    }

    // Don't render anything if not authorized (will redirect)
    if (!isAuthorized) {
        return null;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            
            {/* Header Section */}
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                    accessibilityLabel={t('common.back')}
                    accessibilityRole="button"
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                
                <Text style={[styles.title, { color: colors.text }]}>
                    {t('admin.analytics.title')}
                </Text>
                
                <TouchableOpacity 
                    style={styles.exportButton}
                    onPress={handleExportData}
                    disabled={isAnalyticsLoading}
                    accessibilityLabel={t('admin.analytics.exportData')}
                    accessibilityRole="button"
                >
                    <Ionicons 
                        name="download-outline" 
                        size={22} 
                        color={isAnalyticsLoading ? colors.textSecondary : colors.primary} 
                    />
                </TouchableOpacity>
            </View>

            {/* Main Content with Pull-to-Refresh */}
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                
                {/* Analytics Summary Card */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                   <View style={styles.cardHeaderText}>
  <Text style={[styles.cardTitle, { color: colors.text }]}>
    {t('admin.analytics.title')}
  </Text>
  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
    {t('admin.analytics.summaryTitle', { 
      count: analyticsSummary?.total ?? 0 
    })}
  </Text>

  {analyticsSummary && !isAnalyticsLoading && (
    <View style={styles.chipRow}>
      <View style={[styles.chip, { backgroundColor: colors.primaryOverlay }]}>
        <Ionicons name="analytics-outline" size={18} color={colors.primary} />
        <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>
          {analyticsSummary.total}
        </Text>
      </View>

      <View style={[styles.chip, { backgroundColor: colors.successOverlay }]}>
        <Ionicons name="leaf-outline" size={18} color={colors.success} />
        <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>
          {(analyticsSummary.avgConfidence ?? 0).toFixed(2)}
        </Text>
      </View>

      <View style={[styles.chip, { backgroundColor: colors.warningDark + '20' }]}>
        <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
        <Text style={[styles.chipLabel, { color: colors.textSecondary }]}>
          {analyticsSummary.high}
        </Text>
      </View>
    </View>
  )}
</View>
                    {/* Loading State */}
                    {isAnalyticsLoading || !analyticsSummary ? (
                        <View style={styles.loadingState}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={[styles.textMuted, { color: colors.textSecondary }]}>
                                {t('admin.analytics.loading')}
                            </Text>
                        </View>
                    ) : (
                        /* Analytics Data Display */
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {t('admin.analytics.overviewTitle', { 
                                    count: analyticsSummary.total 
                                })}
                            </Text>
                            
                            {/* Confidence Metrics */}
                            <View style={styles.metricRow}>
                                <Ionicons name="trending-up" size={16} color={colors.textSecondary} />
                                <Text style={[styles.textMuted, { color: colors.textSecondary }]}>
                                    {t('admin.analytics.avgConfidence', { 
                                        value: (analyticsSummary.avgConfidence ?? 0).toFixed(2)
                                    })}
                                </Text>
                            </View>
                            
                            {/* Healthy Cases */}
                            <View style={styles.metricRow}>
                                <Ionicons name="leaf" size={16} color={colors.success} />
                                <Text style={[styles.textMuted, { color: colors.textSecondary }]}>
                                    {t('admin.analytics.healthyCount', { 
                                        count: analyticsSummary.healthyCount 
                                    })}
                                </Text>
                            </View>
                        
                            {/* Risk Level Distribution */}
                            <View style={styles.riskLevelsContainer}>
                            <View style={styles.riskBarContainer}>
                                <View
                                style={[
                                    styles.riskBarSegment,
                                    {
                                    flex: Math.max(analyticsSummary.low, 0.001),
                                    backgroundColor: colors.successBgLight,
                                    },
                                ]}
                                />
                                <View
                                style={[
                                    styles.riskBarSegment,
                                    {
                                    flex: Math.max(analyticsSummary.medium, 0.001),
                                    backgroundColor: colors.warning,
                                    },
                                ]}
                                />
                                <View
                                style={[
                                    styles.riskBarSegment,
                                    {
                                    flex: Math.max(analyticsSummary.high, 0.001),
                                    backgroundColor: colors.danger,
                                    },
                                ]}
                                />
                            </View>

                            <View style={styles.riskLegendRow}>
                                <View style={styles.riskLevel}>
                                <View style={[styles.riskDot, { backgroundColor: colors.successBgLight }]} />
                                <Text style={[styles.riskText, { color: colors.textSecondary }]}>
                                    {t('admin.analytics.lowRisk')}: {analyticsSummary.low}
                                </Text>
                                </View>
                                <View style={styles.riskLevel}>
                                <View style={[styles.riskDot, { backgroundColor: colors.warning }]} />
                                <Text style={[styles.riskText, { color: colors.textSecondary }]}>
                                    {t('admin.analytics.mediumRisk')}: {analyticsSummary.medium}
                                </Text>
                                </View>
                                <View style={styles.riskLevel}>
                                <View style={[styles.riskDot, { backgroundColor: colors.danger }]} />
                                <Text style={[styles.riskText, { color: colors.textSecondary }]}>
                                    {t('admin.analytics.highRisk')}: {analyticsSummary.high}
                                </Text>
                                </View>
                            </View>
                            </View>
                            
                            {/* Top Disease */}
                            {analyticsSummary.topDisease && (
                                <View style={styles.topDiseaseContainer}>
                                    <Ionicons name="trophy" size={16} color={colors.warning} />
                                    <Text style={[styles.textMuted, { color: colors.textSecondary }]}>
                                        {t('admin.analytics.topDisease', {
                                            name: analyticsSummary.topDisease.nameEn ||
                                                  analyticsSummary.topDisease.nameAm ||
                                                  analyticsSummary.topDisease.diseaseId,
                                            count: analyticsSummary.topDisease.c,
                                        })}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Last 7 Days Trend Card */}
                {!!last7DaysCounts.length && (
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.trendHeader}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {t('admin.analytics.last7Days')}
                    </Text>
                    <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                    </View>

                    <View style={styles.trendList}>
                    <View style={styles.trendBarsRow}>
                        {(() => {
                        const max = Math.max(...last7DaysCounts.map((d) => d.count), 1);
                        return last7DaysCounts.map((item) => (
                            <View key={item.day} style={styles.trendBarContainer}>
                            <View
                                style={[
                                styles.trendBar,
                                {
                                    height: (item.count / max) * 80,
                                    backgroundColor: colors.primaryOverlay2,
                                },
                                ]}
                            />
                            <Text
                                style={[styles.trendBarLabel, { color: colors.textSecondary }]}
                                numberOfLines={1}
                            >
                                {item.day.slice(5)}
                            </Text>
                            </View>
                        ));
                        })()}
                    </View>
                    </View>
                </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    backButton: {
        padding: 8,
        borderRadius: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    exportButton: {
        padding: 8,
        borderRadius: 10,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 16,
    },
    card: {
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    cardSubtitle: {
        fontSize: 13,
        marginTop: 2,
        opacity: 0.7,
    },
    refreshButton: {
        padding: 8,
        borderRadius: 10,
    },
    loadingState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    section: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        letterSpacing: -0.2,
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    riskBarContainer: {
        flexDirection: 'row',
        borderRadius:999,
        alignItems: 'center',
        overflow:'hidden',
        marginBottom: 8,
        height:10,
    },
    riskBarSegment: {
        height: "100%"
    },
    riskLegendRow: {
        flexDirection: 'row',
        justifyContent:'space-between',
        flexWrap:'wrap',
        gap: 8,
    },
    riskLevelsContainer: {
        marginVertical: 12,
        gap: 6,
    },
    riskLevel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    riskDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    riskText: {
        fontSize: 13,
        fontWeight: '500',
    },
    topDiseaseContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    trendHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    trendList: {
        gap: 2,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    lastTrendRow: {
        borderBottomWidth: 0,
    },
    trendLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    trendValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    trendValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    countPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    countText: {
        fontSize: 11,
        fontWeight: '600',
    },
    textMuted: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    chipRow: {
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems:'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,

    },
    chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
      flex:1
    },
    chipLabel: {
    fontSize: 16,
    fontWeight: '600',
    },

    trendBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 4,
    },
    trendBarContainer: {
    flex: 1,
    alignItems: 'center',
    },
    trendBar: {
    width: 14,
    borderRadius: 6,
    },
    trendBarLabel: {
    marginTop: 4,
    fontSize: 10,
    },
});