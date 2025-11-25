// app/tomatodx/index.tsx - Home Screen
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getAnalyticsSummary, getRecentDiagnoses } from '../../src/db/repository';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t} = useTranslation();
  const colors = Colors[theme];
  const [stats, setStats] = useState({
    totalScans: 0,
    avgConfidence: 0,
    healthyCount: 0
  });
  const [lastScan, setLastScan] = useState<{ id: string; time: string } | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const recentAnim = useRef(new Animated.Value(0)).current;

  // Load stats from database
  useFocusEffect(
    useCallback(() => {
      loadStats();
      loadLast();
      startAnimations();
    }, [])
  );

  const startAnimations = () => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    statsAnim.setValue(0);
    actionsAnim.setValue(0);
    recentAnim.setValue(0);

    // Stagger animations
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(actionsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(recentAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadStats = () => {
    try {
      const summary = getAnalyticsSummary();
      const totalScans = summary.total || 0;
      const avgConfidence = Math.round((summary.avgConfidence || 0) * 100);
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

  const loadLast = () => {
    try {
      const rows = getRecentDiagnoses(1) as any[];
      const row = rows && rows[0];
      if (!row) {
        setLastScan(null);
        return;
      }
      const when = formatRelativeTime(new Date(row.diagnosedAt));
      setLastScan({ id: row.diagnosisId, time: when });
    } catch (e) {
      setLastScan(null);
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date().getTime();
    const diff = Math.max(0, now - date.getTime());
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
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
      <ImageBackground
    source={require('../../assets/images/screenBg/home4.jpg')}
    style={styles.backgroundImage}
    imageStyle={{ resizeMode: 'cover' }}
  >
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.77)' }]}>
      {/* Fixed Header */}
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <ImageBackground
        source={theme === 'dark' ? require('../../assets/images/background/wellcome_bg.jpg') : require('../../assets/images/image.png')}
        style={styles.header}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <View style={styles.headerContent}>
          <View style={[styles.logo, { backgroundColor: colors.successBg }]}>
            <Ionicons name="leaf" size={32} color={colors.success} />
          </View>
          <Text style={[styles.title, { color: '#fff' }]}>
            TomatoDx
          </Text>
          <Text style={[styles.subtitle, { color: '#fff' }]}>
            {t('home.tagline')}
          </Text>
        </View>
      </ImageBackground>
    </Animated.View>
    <ScrollView style={[styles.container, { backgroundColor: theme === 'dark' ? `${colors.background}80` : `${colors.background}79` }]}>
     
      {/* Stats Overview */}
      <Animated.View style={[styles.statsCard, { backgroundColor: theme === 'dark' ? `${colors.card}BB` : `${colors.card}BB`, opacity: statsAnim }]}>
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
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View style={[styles.section, { opacity: actionsAnim, transform: [{ translateY: Animated.multiply(actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }), 1) }] }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('home.quickActions')}
        </Text>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.featureCard, { backgroundColor: `${colors.card}EE` }]}
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
      </Animated.View>

      {/* Recent Activity */}
      <Animated.View style={[styles.section, { opacity: recentAnim, transform: [{ translateY: Animated.multiply(recentAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }), 1) }] }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('home.recentActivity')}
        </Text>
        <TouchableOpacity
          disabled={!lastScan}
          onPress={() => lastScan && router.push({ pathname: '/tomatodx/result', params: { id: lastScan.id } } as any)}
          style={[styles.activityCard, { backgroundColor: `${colors.card}BB` }]}
        >
          <Ionicons name="time-outline" size={24} color={colors.success} />
          <View style={styles.activityContent}>
            <Text style={[styles.activityText, { color: colors.text }]}>
              {t('home.lastScan')}
            </Text>
            <Text style={[styles.activityTime, { color: colors.textTertiary }]}>
              {lastScan ? lastScan.time : t('history.noScans')}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
     },
  overlay: {
    flex: 1,
     },
  container: {
    flex: 1,
  },
  header: {
    // paddingTop: 60,
    // paddingBottom: 30,
    // paddingHorizontal: 20,
  },
  headerContent: {
    // flex: 1,
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.65)', // much lighter
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
    padding: 16,
   
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