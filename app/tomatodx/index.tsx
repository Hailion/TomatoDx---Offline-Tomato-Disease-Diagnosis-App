// index.tsx
import { useFocusEffect } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemeTokens } from '../../constants/Colors';
import { getCurrentUser } from '../../src/db/repository';
import { initDb } from '../../src/db/schema';
import { createButtonPressAnimation } from '../../src/utils/animations';
import { NavigationUtils } from '../../src/utils/navigation';
import { useScreenSetup } from '../../src/utils/screenSetup';


export default function TomatoHome() {
  const { t, tokens, insets } = useScreenSetup();
  const styles = getStyles(tokens);
  const [userName, setUserName] = useState<string | null>(null);

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
      } catch { }
    }, [])
  );

  const handleNavigation = (route: string) => {
    createButtonPressAnimation(scaleAnim, () => {
      NavigationUtils.push(route);
    });
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
              <Text style={styles.greeting}>Hi, {userName} 👋</Text>
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

        {/* Buttons Section */}
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

          <Animated.View
            style={[
              styles.buttonWrapper,
              {
                opacity: button2Anim,
                transform: [
                  {
                    translateY: button2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  },
                  { scale: button2Anim }
                ]
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => handleNavigation('/tomatodx/history')}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonIcon}>📊</Text>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>{t('home.history')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer Section */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: footerAnim,
              transform: [
                {
                  translateY: footerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })
                }
              ]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => handleNavigation('/tomatodx/settings')}
          >
            <Text style={styles.footerIcon}>⚙️</Text>
            <Text style={styles.footerText}>{t('home.settings')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => handleNavigation('/tomatodx/admin')}
          >
            <Text style={styles.footerIcon}>🔧</Text>
            <Text style={styles.footerText}>{t('home.admin')}</Text>
          </TouchableOpacity>
        </Animated.View>
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
      marginTop: 60,
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
      fontSize: 18,
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
    },
    buttonWrapper: {
      width: '100%',
      maxWidth: 280,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 24,
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
    secondaryButton: {
      backgroundColor: c.surface,
      borderWidth: 2,
      borderColor: c.primary,
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
    secondaryButtonText: {
      color: c.primary,
    },
    // Footer styles
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      marginBottom: 20,
    },
    footerLink: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: c.whiteOverlay,
      gap: 8,
      borderWidth: 1,
      borderColor: c.border
    },
    footerIcon: {
      fontSize: 16,
    },
    footerText: {
      color: c.text,
      fontSize: 14,
      fontWeight: '600',
    }
  });