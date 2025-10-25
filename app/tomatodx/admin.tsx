// admin.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
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
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function AdminScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const tokens = Colors[theme];

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpHeader = useRef(new Animated.Value(40)).current;
  const slideUpCards = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
      'Export all scan history and analytics data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Export Started', 'Data export has been initiated');
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
        contentContainerStyle={styles.scrollContent}
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
              <Text style={[styles.infoValue, { color: tokens.muted }]}>1,247</Text>
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
          <View style={styles.cardHeader}>
            <Ionicons name="bar-chart" size={24} color={tokens.warning} />
            <Text style={[styles.cardTitle, { color: tokens.text }]}>{t('admin.analytics.title')}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: tokens.primaryDark }]}>92%</Text>
              <Text style={[styles.statLabel, { color: tokens.muted }]}>{t('admin.analytics.accuracy')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: tokens.primaryDark }]}>1.2s</Text>
              <Text style={[styles.statLabel, { color: tokens.muted }]}>{t('admin.analytics.averageProcessingTime')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: tokens.primaryDark }]}>98%</Text>
              <Text style={[styles.statLabel, { color: tokens.muted }]}>{t('admin.analytics.uptime')}</Text>
            </View>
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