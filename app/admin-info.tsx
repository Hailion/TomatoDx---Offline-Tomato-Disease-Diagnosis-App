// app/admin-info.tsx - Enhanced Admin Analytics & Information Dashboard
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ImageBackground,
    Modal,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { clearAnalyticsData, exportAnalyticsData, getAnalyticsSummary, getLast7DaysCounts, getMonthlyTrends, getTopDiseases } from '../src/db/repository';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Enhanced Types for analytics data
type IoniconName = keyof typeof Ionicons.glyphMap;

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
    accuracy?: number;
    successRate?: number;
}

interface DailyCount {
    day: string;
    count: number;
    date: Date;
}

interface TopDisease {
    diseaseId: string;
    nameEn?: string;
    nameAm?: string;
    count: number;
    percentage: number;
}

interface MonthlyTrend {
    month: string;
    count: number;
    healthy: number;
    risk: number;
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
    const [topDiseases, setTopDiseases] = useState<TopDisease[]>([]);
    const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    
    // New functionality states
    const [selectedTimeRange, setSelectedTimeRange] = useState<'7days' | '30days' | 'all'>('7days');
    const [showExportModal, setShowExportModal] = useState<boolean>(false);
    const [showClearDataModal, setShowClearDataModal] = useState<boolean>(false);
    const [exportFileName, setExportFileName] = useState<string>(`analytics-${new Date().toISOString().split('T')[0]}`);
    const [activeTab, setActiveTab] = useState<'overview' | 'diseases' | 'trends'>('overview');

    /**
     * Validates admin authorization status by checking AsyncStorage
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
     * Fetches and processes comprehensive analytics data
     */
    const loadAnalytics = useCallback(async (showRefreshIndicator: boolean = false): Promise<void> => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsAnalyticsLoading(true);
            }

            // Fetch all analytics data concurrently
            const [summary, last7Days, topDiseasesData, monthlyData] = await Promise.allSettled([
                getAnalyticsSummary(),
                getLast7DaysCounts(),
                getTopDiseases(5), // Top 5 diseases
                getMonthlyTrends()
            ]);

            // Process all data
            if (summary.status === 'fulfilled') {
                setAnalyticsSummary(summary.value as AnalyticsSummary);
            }

            if (last7Days.status === 'fulfilled') {
                setLast7DaysCounts(last7Days.value as DailyCount[]);
            }

            if (topDiseasesData.status === 'fulfilled') {
                setTopDiseases(topDiseasesData.value as TopDisease[]);
            }

            if (monthlyData.status === 'fulfilled') {
                setMonthlyTrends(monthlyData.value as MonthlyTrend[]);
            }

        } catch (error) {
            console.error('Analytics data loading failed:', error);
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
     * Enhanced export functionality with options
     */
    const handleExportData = useCallback(async (format: 'json' | 'csv' = 'json'): Promise<void> => {
        try {
            setIsAnalyticsLoading(true);
            const exportResult = await exportAnalyticsData(format, exportFileName);
            
            if (exportResult.success) {
                const filePath = exportResult.filePath || '';
                const isDownloads = /download/i.test(filePath);
                const locationMsg = isDownloads
                    ? t('admin.analytics.exportLocation.downloads')
                    : t('admin.analytics.exportLocation.internal');

                Alert.alert(
                    t('common.success'),
                    `${t('admin.analytics.exportSuccess')}\n${locationMsg}`,
                    [
                        { text: 'OK', style: 'default' },
                        { 
                            text: 'Share', 
                            onPress: () => handleShareExport(exportResult.filePath!) 
                        }
                    ]
                );
                console.log('Exported analytics path:', exportResult.filePath);
                setShowExportModal(false);
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
    }, [t, exportFileName]);

    /**
     * Share exported file
     */
    const handleShareExport = async (filePath: string) => {
    try {
        const ext = filePath.split('.').pop()?.toLowerCase();
        const mimeType = ext === 'csv' ? 'text/csv' : 'application/json';

        const sharingAvailable = await Sharing.isAvailableAsync();

        if (sharingAvailable) {
            await Sharing.shareAsync(filePath, {
                mimeType,
                dialogTitle: 'Analytics Data Export',
            });
            return;
        }

        await Share.share({
            url: filePath,
            message: filePath,
            title: 'Analytics Data Export',
        });
    } catch (error) {
        console.error('Share failed:', error);
    }
};

    /**
     * Clear analytics data with confirmation
     */
    const handleClearData = useCallback(async (): Promise<void> => {
        try {
            setIsAnalyticsLoading(true);
            const success = await clearAnalyticsData();
            
            if (success) {
                Alert.alert(
                    t('common.success'),
                    'All analytics data has been cleared successfully.'
                );
                setShowClearDataModal(false);
                loadAnalytics(); // Reload analytics
            } else {
                throw new Error('Clear data failed');
            }
        } catch (error) {
            console.error('Clear data failed:', error);
            Alert.alert(
                t('common.error'),
                'Failed to clear analytics data.'
            );
        } finally {
            setIsAnalyticsLoading(false);
        }
    }, [t, loadAnalytics]);

    /**
     * Calculate additional metrics
     */
    const calculateMetrics = () => {
        if (!analyticsSummary) return null;

        const totalScans = analyticsSummary.total;
        const riskPercentage = totalScans > 0 ? 
            ((analyticsSummary.high + analyticsSummary.medium) / totalScans) * 100 : 0;
        const healthyPercentage = totalScans > 0 ? 
            (analyticsSummary.healthyCount / totalScans) * 100 : 0;

        return {
            riskPercentage: riskPercentage.toFixed(1),
            healthyPercentage: healthyPercentage.toFixed(1),
            successRate: analyticsSummary.avgConfidence ? 
                (analyticsSummary.avgConfidence * 100).toFixed(1) : '0.0'
        };
    };

    const metrics = calculateMetrics();

    // Authorization effect
    useEffect(() => {
        checkAuthorization();
    }, [checkAuthorization]);

    // Analytics loading effect
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

    if (!isAuthorized) {
        return null;
    }

    return (
         <ImageBackground
    source={require('../assets/images/screenBg/adminInfo.jpg')}
    style={styles.backgroundImage}
    imageStyle={{ resizeMode: 'cover' }}
  >
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
     
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? `${colors.background}80` : `${colors.background}79` }]}>
            
            {/* Enhanced Header Section */}
            <View style={[styles.header]}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                    accessibilityLabel={t('common.back')}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {t('admin.analytics.title')}
                    </Text>
                    
                </View>
                
                <View style={styles.headerActions}>
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={() => setShowExportModal(true)}
                        disabled={isAnalyticsLoading}
                    >
                        <Ionicons 
                            name="download-outline" 
                            size={22} 
                            color={isAnalyticsLoading ? colors.textTertiary : colors.primary} 
                        />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <Ionicons 
                            name="refresh" 
                            size={22} 
                            color={isRefreshing ? colors.textTertiary : colors.primary} 
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[styles.headerSubtitleContainer]}>
                <Text style={[styles.subtitle, { color: theme === 'dark' ? colors.textSecondary : colors.text }]}>
                    {t('admin.analytics.subtitle')}
                </Text>
            </View>
            {/* Navigation Tabs */}
            <View style={[styles.tabContainer, { backgroundColor: `${colors.card}BB` }]}>
                {[
                    { id: 'overview', label: t('admin.analytics.tabOverview'), icon: 'grid' },
                    { id: 'diseases', label: t('admin.analytics.tabDiseases'), icon: 'medical' },
                    { id: 'trends', label: t('admin.analytics.tabTrends'), icon: 'trending-up' }
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,{backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}EE`,borderColor: theme === 'dark' ? colors.border : colors.borderDark},
                            activeTab === tab.id && { 
                                backgroundColor: colors.primary + '15',
                                borderColor: colors.primary
                            }
                        ]}
                        onPress={() => setActiveTab(tab.id as any)}
                    >
                        <Ionicons 
                            name={tab.icon as IoniconName} 
                            size={16} 
                            color={activeTab === tab.id ? colors.primary : colors.textSecondary} 
                        />
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === tab.id ? colors.primary : colors.textSecondary }
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Main Content */}
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
                
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        {/* Quick Stats Cards */}
                        <View style={styles.statsGrid}>
                            <View style={[styles.statCard, { backgroundColor: theme === 'dark' ? colors.primary + '30' : colors.primary + '55' ,borderColor: colors.primary, borderWidth: theme === 'light' ? 1 : 0}]}> 
                                <Ionicons name="scan" size={24} color={colors.primary} />
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {analyticsSummary?.total || 0}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                    {t('admin.analytics.totalScansLabel')}
                                </Text>
                            </View>
                            
                            <View style={[styles.statCard, { backgroundColor:theme === 'dark' ? colors.success + '30' : colors.success + '55' ,borderColor: colors.success, borderWidth: theme === 'light' ? 1 : 0}]}>
                                <Ionicons name="leaf" size={24} color={colors.success} />
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {analyticsSummary?.healthyCount || 0}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                    {t('admin.analytics.healthyLabel')}
                                </Text>
                            </View>
                            
                            <View style={[styles.statCard, { backgroundColor:theme === 'dark' ? colors.warning + '30' : colors.warning + '55' ,borderColor: colors.warning, borderWidth: theme === 'light' ? 1 : 0}]}>
                                <Ionicons name="alert-circle" size={24} color={colors.warning} />
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {analyticsSummary ? analyticsSummary.medium + analyticsSummary.high : 0}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                    {t('admin.analytics.atRiskLabel')}
                                </Text>
                            </View>
                            
                            <View style={[styles.statCard, { backgroundColor:theme === 'dark' ? colors.primary + '30' : colors.primary + '55' ,borderColor: colors.primary, borderWidth: theme === 'light' ? 1 : 0 }]}>
                                <Ionicons name="trending-up" size={24} color={colors.primary} />
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {metrics?.successRate || '0'}%
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                    {t('admin.analytics.successRateLabel')}
                                </Text>
                            </View>
                        </View>

                        {/* Risk Distribution Card */}
                        <View style={[styles.card, { backgroundColor:  theme === 'dark' ? `${colors.card}00` : `${colors.card}EE`,borderColor: theme === 'dark' ? colors.border : colors.borderDark }]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.cardTitle, { color: colors.text }]}>
                                    {t('admin.analytics.riskDistributionTitle')}
                                </Text>
                                <View style={styles.riskStats}>
                                    <Text style={[styles.riskStat, { color: colors.textSecondary }]}>
                                        {metrics?.riskPercentage}% {t('admin.analytics.riskLabel')}
                                    </Text>
                                </View>
                            </View>
                            
                            {analyticsSummary && (
                                <View style={styles.riskDistribution}>
                                    <View style={styles.riskBarContainer}>
                                        {[
                                            { value: analyticsSummary.low, color: colors.success, label: t('admin.analytics.lowRiskLabel') },
                                            { value: analyticsSummary.medium, color: colors.warning, label: t('admin.analytics.mediumRiskLabel') },
                                            { value: analyticsSummary.high, color: colors.danger, label: t('admin.analytics.highRiskLabel') }
                                        ].map((risk, index) => (
                                            <View key={risk.label} style={styles.riskBarSegment}>
                                                <View 
                                                    style={[
                                                        styles.riskBarFill,
                                                        { 
                                                            backgroundColor: risk.color,
                                                            width: `${(risk.value / analyticsSummary.total) * 100}%`
                                                        }
                                                    ]} 
                                                />
                                                <View style={styles.riskLabelContainer}>
                                                    <View style={[styles.riskDot, { backgroundColor: risk.color }]} />
                                                    <Text style={[styles.riskLabel, { color: colors.textSecondary }]}>
                                                        {risk.label}: {risk.value}
                                                    </Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Recent Activity Trend */}
                        {last7DaysCounts.length > 0 && (
                            <View style={[styles.card, { backgroundColor: `${colors.card}BB` }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                                        {t('admin.analytics.sevenDayTrend')}
                                    </Text>
                                    <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                                </View>
                                
                                <View style={styles.trendChart}>
                                    <View style={styles.trendBars}>
                                        {last7DaysCounts.map((day, index) => {
                                            const maxCount = Math.max(...last7DaysCounts.map(d => d.count));
                                            const height = maxCount > 0 ? (day.count / maxCount) * 120 : 0;
                                            
                                            return (
                                                <View key={day.day} style={styles.trendBarContainer}>
                                                    <View 
                                                        style={[
                                                            styles.trendBar,
                                                            { 
                                                                height,
                                                                backgroundColor: colors.primary
                                                            }
                                                        ]} 
                                                    />
                                                    <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>
                                                        {day.day.slice(5)}
                                                    </Text>
                                                    <Text style={[styles.trendCount, { color: colors.text }]}>
                                                        {day.count}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>
                        )}
                    </>
                )}

                {/* Diseases Tab */}
                {activeTab === 'diseases' && topDiseases.length > 0 && (
                    <View style={[styles.card, { backgroundColor: `${colors.card}BB` }]}>
                        <View style={[styles.cardHeader, {flexDirection: 'column'}]}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>
                                {t('admin.analytics.topDiseasesTitle')}
                            </Text>
                            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                                {t('admin.analytics.topDiseasesSubtitle')}
                            </Text>
                        </View>
                        
                        <View style={styles.diseasesList}>
                            {topDiseases.map((disease, index) => (
                                <View key={disease.diseaseId} style={styles.diseaseItem}>
                                    <View style={styles.diseaseRank}>
                                        <Text style={[styles.rankText, { color: colors.text }]}>
                                            #{index + 1}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.diseaseInfo}>
                                        <Text style={[styles.diseaseName, { color: colors.text }]}>
                                            {disease.nameEn || disease.nameAm || disease.diseaseId}
                                        </Text>
                                        <Text style={[styles.diseaseCount, { color: colors.textSecondary }]}>
                                            {disease.count} detections
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.diseasePercentage}>
                                        <Text style={[styles.percentageText, { color: colors.primary }]}>
                                            {disease.percentage}%
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Trends Tab */}
                {activeTab === 'trends' && monthlyTrends.length > 0 && (
                    <View style={[styles.card, { backgroundColor: `${colors.card}BB` }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>
                                {t('admin.analytics.monthlyTrendsTitle')}
                            </Text>
                            <Ionicons name="stats-chart" size={18} color={colors.textSecondary} />
                        </View>
                        
                        <View style={styles.monthlyTrends}>
                            {monthlyTrends.map((month, index) => (
                                <View key={month.month} style={styles.trendItem}>
                                    <Text style={[styles.trendMonth, { color: colors.text }]}>
                                        {month.month}
                                    </Text>
                                    
                                    <View style={styles.trendBars}>
                                        <View 
                                            style={[
                                                styles.trendBarSmall,
                                                { 
                                                    flex: month.healthy,
                                                    backgroundColor: colors.success
                                                }
                                            ]} 
                                        />
                                        <View 
                                            style={[
                                                styles.trendBarSmall,
                                                { 
                                                    flex: month.risk,
                                                    backgroundColor: colors.warning
                                                }
                                            ]} 
                                        />
                                    </View>
                                    
                                    <Text style={[styles.trendTotal, { color: colors.textSecondary }]}>
                                        {month.count}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Data Management Card */}
                <View style={[styles.card, { backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}EE`,borderColor: theme === 'dark' ? colors.border : colors.borderDark }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {t('admin.analytics.dataManagementTitle')}
                    </Text>
                    
                    <View style={styles.dataActions}>
                        <TouchableOpacity 
                            style={[styles.dataButton, { backgroundColor: colors.primary + '15' }]}
                            onPress={() => setShowExportModal(true)}
                        >
                            <Ionicons name="download" size={20} color={colors.primary} />
                            <Text style={[styles.dataButtonText, { color: colors.primary }]}>
                                {t('admin.analytics.exportData')}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.dataButton, { backgroundColor: colors.danger + '15' }]}
                            onPress={() => setShowClearDataModal(true)}
                        >
                            <Ionicons name="trash" size={20} color={colors.danger} />
                            <Text style={[styles.dataButtonText, { color: colors.danger }]}>
                                {t('admin.analytics.clearDataButton')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Export Modal */}
            <Modal
                visible={showExportModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowExportModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? `${colors.card}EE` : `${colors.card}EE`,borderColor: theme === 'dark' ? colors.border : colors.borderDark}]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {t('admin.analytics.exportModal.title')}
                        </Text>
                        
                        <TextInput
                            style={[styles.textInput, { 
                                borderColor: colors.border, 
                                color: colors.text,
                                backgroundColor: colors.background
                            }]}
                            value={exportFileName}
                            onChangeText={setExportFileName}
                            placeholder={t('admin.analytics.exportModal.fileNamePlaceholder')}
                            placeholderTextColor={colors.textTertiary}
                        />
                        
                        <View style={styles.exportOptions}>
                            <TouchableOpacity 
                                style={[styles.exportOption, { backgroundColor: colors.primary + '15' ,borderColor: theme === 'dark' ? colors.border : colors.borderDark }]}
                                onPress={() => handleExportData('json')}
                            >
                                <Ionicons name="document-text" size={24} color={colors.primary} />
                                <Text style={[styles.exportOptionText, { color: colors.primary }]}>
                                    {t('admin.analytics.exportModal.json')}
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.exportOption, { backgroundColor: colors.success + '15',borderColor: theme === 'dark' ? colors.border : colors.borderDark  }]}
                                onPress={() => handleExportData('csv')}
                            >
                                <Ionicons name="document" size={24} color={colors.success} />
                                <Text style={[styles.exportOptionText, { color: colors.success }]}>
                                    {t('admin.analytics.exportModal.csv')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={[styles.modalButton, { backgroundColor: colors.border }]}
                                onPress={() => setShowExportModal(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Clear Data Confirmation Modal */}
            <Modal
                visible={showClearDataModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowClearDataModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: `${colors.card}ED` }]}>
                        <View style={styles.warningIcon}>
                            <Ionicons name="warning" size={48} color={colors.danger} />
                        </View>
                        
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                             {t('admin.analytics.clearModal.title')}
                        </Text>
                        
                        <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                            {t('admin.analytics.clearModal.message')}
                        </Text>
                        
                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={[styles.modalButton, { backgroundColor: colors.border }]}
                                onPress={() => setShowClearDataModal(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.modalButton, { backgroundColor: `${colors.danger}DD` }]}
                                onPress={handleClearData}
                            >
                                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                                    {t('common.confirm')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
        </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: { flex: 1 },
overlay: { flex: 1 },
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
        paddingBottom: 0,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
       
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    headerSubtitleContainer: {
        alignItems: 'center',       
        justifyContent: 'center',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.7,
        paddingTop: 16,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        padding: 8,
        borderRadius: 10,
    },
    backButton: {
        padding: 8,
        borderRadius: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 8,
        marginHorizontal: 20,
        marginVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'transparent',
        gap: 6,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 8,
        marginBottom: 10,
    },
    statCard: {
        flex: 1,
        minWidth: (SCREEN_WIDTH - 50) / 2,
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        gap: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    card: {
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 10,
        padding: 14,
        borderWidth:.5        
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    cardSubtitle: {
        fontSize: 13,
        opacity: 0.7,
    },
    riskStats: {
        alignItems: 'flex-end',
    },
    riskStat: {
        fontSize: 13,
        fontWeight: '600',
    },
    riskDistribution: {
        gap: 12,
    },
    riskBarContainer: {
        gap: 8,
    },
    riskBarSegment: {
        gap: 6,
    },
    riskBarFill: {
        height: 8,
        borderRadius: 2,
        minWidth: 4,
    },
    riskLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    riskDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    riskLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    trendChart: {
        marginTop: 8,
    },
    // trendBars: {
    //     flexDirection: 'row',
    //     alignItems: 'flex-end',
    //     justifyContent: 'space-between',
    //     height: 140,
    //     gap: 8,
    // },
    trendBarContainer: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    trendBar: {
        width: 16,
        borderRadius: 8,
        minHeight: 4,
    },
    trendLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    trendCount: {
        fontSize: 11,
        fontWeight: '600',
    },
    diseasesList: {
        gap: 12,
    },
    diseaseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    diseaseRank: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        fontSize: 12,
        fontWeight: '700',
    },
    diseaseInfo: {
        flex: 1,
    },
    diseaseName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    diseaseCount: {
        fontSize: 12,
        opacity: 0.7,
    },
    diseasePercentage: {
        alignItems: 'flex-end',
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '700',
    },
    monthlyTrends: {
        gap: 12,
    },
    trendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    trendMonth: {
        width: 60,
        fontSize: 12,
        fontWeight: '600',
    },
    trendBars: {
        flex: 1,
        flexDirection: 'row',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    trendBarSmall: {
        minWidth: 4,
    },
    trendTotal: {
        width: 30,
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'right',
    },
    dataActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    dataButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    dataButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 10,
        padding: 16,
        gap: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 16,
    },
    exportOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    exportOption: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 10,
        borderWidth:.5,
        gap: 8,
    },
    exportOptionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    warningIcon: {
        alignItems: 'center',
        marginBottom: 8,
    },
});