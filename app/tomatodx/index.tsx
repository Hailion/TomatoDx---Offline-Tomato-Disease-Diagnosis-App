// index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemeTokens } from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getCurrentUser, getRecentDiagnoses } from '../../src/db/repository';
import { initDb } from '../../src/db/schema';
import { createButtonPressAnimation } from '../../src/utils/animations';
import { NavigationUtils } from '../../src/utils/navigation';
import { useScreenSetup } from '../../src/utils/screenSetup';

export default function TomatoHome() {
  const { t, i18n, tokens, insets } = useScreenSetup();
  const { theme, toggleTheme } = useTheme();
  const styles = getStyles(tokens);
  const [userName, setUserName] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpTitle = useRef(new Animated.Value(50)).current;
  const slideUpSubtitle = useRef(new Animated.Value(40)).current;
  const button1Anim = useRef(new Animated.Value(0)).current;
  const button2Anim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence animations for better visual flow
    Animated.sequence([
      // Fade in background
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Title animation
      Animated.parallel([
        Animated.timing(slideUpTitle, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.elastic(1.5),
          useNativeDriver: true,
        })
      ]),
      // Subtitle animation
      Animated.timing(slideUpSubtitle, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Buttons animation with stagger
      Animated.stagger(200, [
        Animated.timing(button1Anim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
        Animated.timing(button2Anim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
      ]),
      // Footer animation
      Animated.timing(footerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();

    // Continuous subtle animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      try {
        initDb();
        const u = getCurrentUser();
        if (u?.name && typeof u.name === 'string' && u.name.trim().length > 0) {
          setUserName(u.name);
        } else {
          setUserName(null);
        }
        // Load recent diagnoses
        const recent = getRecentDiagnoses(3);
        setRecentScans(recent || []);
      } catch { }
    }, [])
  );

  const handleNavigation = (route: string) => {
    createButtonPressAnimation(scaleAnim, () => {
      NavigationUtils.push(route);
    });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg']
  });

  return (
    <View style={styles.container}>
      {/* Background Animated Elements */}
      <Animated.View style={[styles.backgroundCircle, styles.circle1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.backgroundCircle, styles.circle2, { opacity: fadeAnim }]} />

      {/* Theme Toggle Icon */}
      <TouchableOpacity
        style={[styles.themeToggle, { top: Math.max(16, insets.top) }]}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <Ionicons
          name={theme === 'light' ? 'moon' : 'sunny'}
          size={28}
          color={tokens.primary}
        />
      </TouchableOpacity>

      {/* Language Toggle Icon */}
      <TouchableOpacity
        style={[styles.languageToggle, { top: Math.max(16, insets.top) }]}
        onPress={toggleLanguage}
        activeOpacity={0.7}
      >
        <Ionicons name="language" size={28} color={tokens.primary} />
        <Text style={[styles.languageText, { color: tokens.primary }]}>
          {i18n.language === 'en' ? 'EN' : 'አማ'}
        </Text>
      </TouchableOpacity>

      <View style={[styles.content, { paddingBottom: Math.max(16, insets.bottom) }]}>
        {/* Header Section */}
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideUpTitle },
                  { rotate: rotateInterpolate }
                ]
              }
            ]}
          >
            <Animated.View
              style={[
                styles.tomatoIcon,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Text style={styles.tomatoEmoji}>🍅</Text>
            </Animated.View>
            <Text style={styles.title}>TomatoDx</Text>
            {userName ? (
              <Text style={styles.greeting}>{t('home.hi')}, {userName} 👋</Text>
            ) : null}
          </Animated.View>

          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpSubtitle }]
              }
            ]}
          >
            {t('home.subtitle')}
          </Animated.Text>
        </View>

        {/* Main Action Section */}
        <View style={styles.buttonsContainer}>
          <Animated.View
            style={[
              styles.buttonWrapper,
              {
                opacity: button1Anim,
                transform: [
                  {
                    translateY: button1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  },
                  { scale: button1Anim }
                ]
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => handleNavigation('/tomatodx/capture')}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonIcon}>📸</Text>
              <Text style={[styles.buttonText, styles.primaryButtonText]}>{t('home.capture')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Recent Scans Section */}
        {recentScans.length > 0 && (
          <Animated.View
            style={[
              styles.recentSection,
              {
                opacity: button2Anim,
                transform: [
                  {
                    translateY: button2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.recentHeader}>
              <Text style={[styles.recentTitle, { color: tokens.text }]}>{t('home.recentScans') || 'Recent Scans'}</Text>
              <TouchableOpacity onPress={() => handleNavigation('/tomatodx/history')}>
                <Text style={[styles.viewAllText, { color: tokens.primary }]}>{t('home.viewAll') || 'View All'}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {recentScans.map((scan, index) => {
                const confidence = scan.confidence || 0;
                return (
                  <TouchableOpacity
                    key={scan.diagnosisId}
                    style={[styles.scanCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
                    onPress={() => NavigationUtils.push('/tomatodx/result', {
                      uri: scan.filePath || '',
                      imageId: scan.imageId,
                      diagnosisId: scan.diagnosisId
                    })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.scanInfo}>
                      <Text style={[styles.scanDisease, { color: tokens.text }]} numberOfLines={1}>
                        {i18n.language === 'am' ? (scan.nameAm || scan.nameEn || scan.diseaseId || 'Unknown') : (scan.nameEn || scan.diseaseId || 'Unknown')}
                      </Text>
                      <Text style={[styles.scanDate, { color: tokens.muted }]}>{new Date(scan.diagnosedAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={[styles.confidenceBadge, {
                      backgroundColor: confidence >= 0.8 ? tokens.successBgLight :
                        confidence >= 0.5 ? tokens.warningBgLight : tokens.dangerBgLight
                    }]}>
                      <Text style={[styles.confidenceText, {
                        color: confidence >= 0.8 ? tokens.success :
                          confidence >= 0.5 ? tokens.warning : tokens.danger
                      }]}>
                        {Math.round(confidence * 100)}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const getStyles = (c: ThemeTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      overflow: 'hidden',
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: 'space-between',
      zIndex: 1,
    },
    // Background elements
    backgroundCircle: {
      position: 'absolute',
      borderRadius: 500,
      backgroundColor: c.primaryOverlay2,
    },
    circle1: {
      width: 300,
      height: 300,
      top: -100,
      right: -100,
    },
    circle2: {
      width: 200,
      height: 200,
      bottom: -50,
      left: -50,
      backgroundColor: c.successOverlay2,
    },
    // Header styles
    header: {
      alignItems: 'center',
      marginTop: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    tomatoIcon: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: c.primaryOverlay,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 3,
      borderColor: c.primaryOverlay2,
    },
    tomatoEmoji: {
      fontSize: 48,
    },
    title: {
      fontSize: 48,
      fontWeight: '800',
      textAlign: 'center',
      color: c.primaryDark,
      textShadowColor: c.shadowLight,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      letterSpacing: 1,
    },
    subtitle: {
      textAlign: 'center',
      color: c.textSecondary,
      fontSize: 17,
      lineHeight: 28,
      fontWeight: '500',
      maxWidth: '80%',
    },
    greeting: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: '700',
      color: c.primaryDark,
      textAlign: 'center',
    },
    // Button styles
    buttonsContainer: {
      alignItems: 'center',
      gap: 20,
      paddingVertical: 16,
    },
    buttonWrapper: {
      width: '100%',
      maxWidth: 280,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 28,
      borderRadius: 20,
      elevation: 8,
      shadowColor: c.shadowDark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      gap: 12,
    },
    primaryButton: {
      backgroundColor: c.primary,
    },
    buttonIcon: {
      fontSize: 24,
    },
    buttonText: {
      fontSize: 20,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
    },
    primaryButtonText: {
      color: c.whiteMuted,
    },
    // Recent Scans Section
    recentSection: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      paddingBottom: 4,
      flex: 1,
    },
    scrollView: {
      maxHeight: 300,
    },
    recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    recentTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.primary,
    },
    scanCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.border,
      elevation: 2,
      shadowColor: c.shadowLight,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    scanInfo: {
      flex: 1,
      marginRight: 12,
    },
    scanDisease: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      marginBottom: 2,
    },
    scanDate: {
      fontSize: 12,
      color: c.muted,
    },
    confidenceBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: c.successBgLight,
    },
    confidenceText: {
      fontSize: 12,
      fontWeight: '700',
      color: c.success,
    },
    themeToggle: {
      position: 'absolute',
      top: 16,
      left: 16,
      zIndex: 10,
      backgroundColor: c.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      elevation: 4,
      shadowColor: c.shadowDark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: c.primaryOverlay,
    },
    languageToggle: {
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      elevation: 4,
      shadowColor: c.shadowDark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: c.primaryOverlay,
    },
    languageText: {
      fontSize: 12,
      fontWeight: '700',
      color: c.primary,
    },
  });