// app/tomatodx/index.tsx - Home Screen
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getAnalyticsSummary } from '../../src/db/repository';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const colors = Colors[theme];
  const [stats, setStats] = useState({
    totalScans: 0,
    avgConfidence: 0,
    healthyCount: 0
  });

  // Load stats from database
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = () => {
    try {
      const summary = getAnalyticsSummary();
      const totalScans = summary.total || 0;
      const avgConfidence = Math.round((summary.avgConfidence || 0) * 100);

      // Count healthy diagnoses (those with 'healthy' in disease name)
      const healthyCount = summary.healthyCount || 0;

      setStats({
        totalScans,
        avgConfidence,
        healthyCount
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const features = [
    {
      icon: 'scan-outline',
      title: t('home.quickScan'),
      description: t('home.quickScanDesc'),
      route: '/tomatodx/scan',
      color: colors.primary // Tomato red
    },
    {
      icon: 'library-outline',
      title: t('home.scanHistory'),
      description: t('home.scanHistoryDesc'),
      route: '/tomatodx/history',
      color: colors.success // Healthy plant green
    },
    {
      icon: 'analytics-outline',
      title: t('home.insights'),
      description: t('home.insightsDesc'),
      route: '/tomatodx/insights',
      color: colors.warning // Earthy orange
    }
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={theme === 'dark'
          ? [colors.background, colors.backgroundAlt]
          : [colors.background, colors.backgroundAlt]
        }
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={[styles.logo, { backgroundColor: colors.successBg }]}>
            <Ionicons name="leaf" size={32} color={colors.success} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            TomatoDx
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('home.tagline')}
          </Text>
        </View>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {stats.totalScans}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
            {t('home.totalScans')}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {stats.avgConfidence}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
            {t('home.accuracy')}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {stats.healthyCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
            {t('home.healthy')}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('home.quickActions')}
        </Text>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.featureCard, { backgroundColor: colors.card }]}
            onPress={() => router.push(feature.route as any)}
          >
            <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
              <Ionicons name={feature.icon as any} size={24} color="#fff" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textTertiary }]}>
                {feature.description}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('home.recentActivity')}
        </Text>
        <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
          <Ionicons name="time-outline" size={24} color={colors.success} />
          <View style={styles.activityContent}>
            <Text style={[styles.activityText, { color: colors.text }]}>
              {t('home.lastScan')}
            </Text>
            <Text style={[styles.activityTime, { color: colors.textTertiary }]}>
              2 hours ago
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
  },
});