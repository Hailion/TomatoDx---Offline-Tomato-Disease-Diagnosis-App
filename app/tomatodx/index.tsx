// app/tomatodx/index.tsx - Home Screen
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const features = [
    {
      icon: 'scan-outline',
      title: t('home.quickScan'),
      description: t('home.quickScanDesc'),
      route: '/tomatodx/scan',
      color: '#10b981'
    },
    {
      icon: 'library-outline',
      title: t('home.scanHistory'),
      description: t('home.scanHistoryDesc'),
      route: '/tomatodx/history',
      color: '#8b5cf6'
    },
    {
      icon: 'analytics-outline',
      title: t('home.insights'),
      description: t('home.insightsDesc'),
      route: '/tomatodx/insights',
      color: '#f59e0b'
    }
  ];

  return (
    <ScrollView style={[styles.container, theme === 'dark' && styles.darkContainer]}>
      {/* Header */}
      <LinearGradient
        // make more red like 
        colors={theme === 'dark' ? ['#1a1a1a', '#2d2d2d'] : ['#f8fafc', '#e2e8f0']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logo}>
            <Ionicons name="leaf" size={32} color="#10b981" />
          </View>
          <Text style={[styles.title, theme === 'dark' && styles.darkText]}>
            TomatoDx
          </Text>
          <Text style={[styles.subtitle, theme === 'dark' && styles.darkSubtext]}>
            {t('home.tagline')}
          </Text>
        </View>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={[styles.statsCard, theme === 'dark' && styles.darkCard]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, theme === 'dark' && styles.darkText]}>24</Text>
          <Text style={[styles.statLabel, theme === 'dark' && styles.darkSubtext]}>
            {t('home.totalScans')}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, theme === 'dark' && styles.darkText]}>92%</Text>
          <Text style={[styles.statLabel, theme === 'dark' && styles.darkSubtext]}>
            {t('home.accuracy')}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, theme === 'dark' && styles.darkText]}>5</Text>
          <Text style={[styles.statLabel, theme === 'dark' && styles.darkSubtext]}>
            {t('home.healthy')}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
          {t('home.quickActions')}
        </Text>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.featureCard, theme === 'dark' && styles.darkCard]}
            onPress={() => router.push(feature.route as any)}
          >
            <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
              <Ionicons name={feature.icon as any} size={24} color="#fff" />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, theme === 'dark' && styles.darkText]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureDesc, theme === 'dark' && styles.darkSubtext]}>
                {feature.description}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme === 'dark' ? '#666' : '#999'}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
          {t('home.recentActivity')}
        </Text>
        <View style={[styles.activityCard, theme === 'dark' && styles.darkCard]}>
          <Ionicons name="time-outline" size={24} color="#10b981" />
          <View style={styles.activityContent}>
            <Text style={[styles.activityText, theme === 'dark' && styles.darkText]}>
              {t('home.lastScan')}
            </Text>
            <Text style={[styles.activityTime, theme === 'dark' && styles.darkSubtext]}>
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
    backgroundColor: '#f8fafc',
  },
  darkContainer: {
    backgroundColor: '#000',
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
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    textAlign: 'center',
  },
  darkText: {
    color: '#fff',
  },
  darkSubtext: {
    color: '#999',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  darkCard: {
    backgroundColor: '#1a1a1a',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e5e5',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    color: '#1a1a1a',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
  },
});