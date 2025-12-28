import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    icon: 'leaf',
    titleKey: 'onboarding.steps.welcome.title',
    descriptionKey: 'onboarding.steps.welcome.description'
  },
  {
    icon: 'camera',
    titleKey: 'onboarding.steps.capture.title',
    descriptionKey: 'onboarding.steps.capture.description'
  },
  {
    icon: 'scan-circle',
    titleKey: 'onboarding.steps.analysis.title',
    descriptionKey: 'onboarding.steps.analysis.description'
  },
  {
    icon: 'time',
    titleKey: 'onboarding.steps.history.title',
    descriptionKey: 'onboarding.steps.history.description'
  }
];

const STEP_BACKGROUNDS = [
  require('../assets/images/background/wellcome_bg-3.jpg'),   // welcome
  require('../assets/images/background/scan_bg.jpg'),       // capture
  require('../assets/images/background/analysis.jpg'), // analysis
  require('../assets/images/background/history_bg.jpg'),    // history
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const contentSlideAnim = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      animateTransition(1);
    } else {
      await handleGetStarted();
    }
  };

  const handlePrevious = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition(-1);
  };

  const animateTransition = (direction: number) => {
    // direction: 1 for next, -1 for previous

    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlideAnim, {
        toValue: direction * -50,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setCurrentStep(prev => prev + direction);
      contentFadeAnim.setValue(0);
      contentSlideAnim.setValue(direction * 50);

      Animated.parallel([
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentSlideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await handleGetStarted();
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/');
  };

  const step = ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Image with Transition */}
      <View style={StyleSheet.absoluteFill}>
        <ImageBackground
          source={STEP_BACKGROUNDS[currentStep]}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']}
          style={StyleSheet.absoluteFillObject}
          locations={[0, 0.4, 1]}
        />
      </View>

      {/* Skip Button */}
      {!isLastStep && (
        <TouchableOpacity
          style={[styles.skipButton, { top: insets.top + 10 }]}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      )}

      {/* Main Content */}
      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>

        {/* Animated Text Content */}
        <Animated.View style={[
          styles.stepContainer,
          {
            opacity: contentFadeAnim,
            transform: [{ translateX: contentSlideAnim }]
          }
        ]}>
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.iconGradient}
            >
              <Ionicons name={step.icon as any} size={40} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>{t(step.titleKey)}</Text>
          <Text style={styles.description}>{t(step.descriptionKey)}</Text>
        </Animated.View>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          {/* Pagination Dots */}
          <View style={styles.dotsContainer}>
            {ONBOARDING_STEPS.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep ? styles.activeDot : styles.inactiveDot,
                  index === currentStep && { backgroundColor: colors.primary }
                ]}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {!isFirstStep && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handlePrevious}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, isFirstStep && { width: '100%' }]}
              onPress={handleNext}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>
                  {isLastStep ? t('common.getStarted') : t('common.continue')}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 150,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    gap: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    height: 56,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  primaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});