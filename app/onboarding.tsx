import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useTheme } from '../src/contexts/ThemeContext';
import { upsertUser } from '../src/db/repository';
import { initDb } from '../src/db/schema';

// const { width, height } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  { icon: '🍅', key: 'welcome' },
  { icon: '📸', key: 'capture' },
  { icon: '🤖', key: 'analysis' },
  { icon: '📊', key: 'history' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const tokens = Colors[theme];
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(0);
  const currentStepRef = useRef(0);
  const stepCount = ONBOARDING_STEPS.length;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initDb();
    // Continuous subtle animation
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

  useEffect(() => {
    // Reset animations for new step
    fadeAnim.setValue(0);
    slideAnim.setValue(50);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Keep a ref of the current step for gesture handlers
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep(prev => {
      const next = prev + 1;
      if (next < ONBOARDING_STEPS.length) {
        currentStepRef.current = next;
        return next;
      }
      handleGetStarted();
      return prev;
    });
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      initDb();
      upsertUser('device');
    } catch {
      // Ignore errors
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/tomatodx');
  };

  const steps = ONBOARDING_STEPS.map(s => ({
    icon: s.icon,
    title: t(`onboarding.steps.${s.key}.title`),
    description: t(`onboarding.steps.${s.key}.description`),
  }));
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const swipeNext = () => {
    setCurrentStep(prev => {
      const next = (prev + 1) % stepCount;
      currentStepRef.current = next;
      return next;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) =>
        Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20,
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dx <= -50) {
          // swipe left -> next (wrap)
          swipeNext();
        } else if (gestureState.dx >= 50) {
          // swipe right -> back (wrap)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setCurrentStep(prev => {
            const next = (prev - 1 + stepCount) % stepCount;
            currentStepRef.current = next;
            return next;
          });
        }
      },
    })
  ).current;

  return (
    <View style={[styles.container, { backgroundColor: tokens.background, paddingBottom: Math.max(40, insets.bottom + 12) }]}>
      {/* Background Elements */}
      <Animated.View style={[styles.backgroundCircle, styles.circle1, { opacity: 0.3, backgroundColor: tokens.primaryOverlay }]} />
      <Animated.View style={[styles.backgroundCircle, styles.circle2, { opacity: 0.2, backgroundColor: tokens.successOverlay }]} />

      {/* Skip Button */}
      {
        !isLastStep && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipText, { color: tokens.muted }]}>{t('common.skip')}</Text>
          </TouchableOpacity>
        )
      }

      {/* Content */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={styles.icon}>{step.icon}</Text>
        </Animated.View>

        <Text style={[styles.title, { color: tokens.primaryDark }]}>{step.title}</Text>
        <Text style={[styles.description, { color: tokens.muted }]}>{step.description}</Text>
      </Animated.View>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {ONBOARDING_STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentStep ? tokens.primary : tokens.border,
                width: index === currentStep ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonsContainer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.backButton, { borderColor: tokens.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCurrentStep(currentStep - 1);
            }}
          >
            <Ionicons name="arrow-back" size={20} color={tokens.primary} />
            <Text style={[styles.backButtonText, { color: tokens.primary }]}>{t('common.back')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: tokens.primary, shadowColor: tokens.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>{isLastStep ? t('onboarding.getStarted') : t('common.next')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 500,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -150,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 120,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});

