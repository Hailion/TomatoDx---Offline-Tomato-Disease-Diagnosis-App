// app/onboarding.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

const ONBOARDING_STEPS = [
    {
        icon: '🍅',
        title: 'Welcome to TomatoDx',
        description: 'AI-powered tomato disease detection at your fingertips'
    },
    {
        icon: '📸',
        title: 'Scan with Ease',
        description: 'Capture tomato leaf photos for instant disease analysis'
    },
    {
        icon: '🤖',
        title: 'AI Analysis',
        description: 'Get accurate diagnoses and treatment recommendations'
    },
    {
        icon: '📊',
        title: 'Track Progress',
        description: 'Monitor your plant health with detailed history'
    }
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const [currentStep, setCurrentStep] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const handleNext = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (currentStep < ONBOARDING_STEPS.length - 1) {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: -50,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setCurrentStep(prev => prev + 1);
                fadeAnim.setValue(0);
                slideAnim.setValue(50);

                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 400,
                        easing: Easing.out(Easing.back(1)),
                        useNativeDriver: true,
                    })
                ]).start();
            });
        } else {
            await handleGetStarted();
        }
    };

    const handlePrevious = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 50,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            setCurrentStep(prev => prev - 1);
            fadeAnim.setValue(0);
            slideAnim.setValue(-50);

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
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
        router.replace('/tomatodx');
    };

    const step = ONBOARDING_STEPS[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

    return (
        <View style={[
            styles.container,
            theme === 'dark' ? styles.darkContainer : styles.lightContainer
        ]}>
            {/* Background Pattern */}
            <View style={styles.backgroundPattern}>
                <View style={[styles.circle, styles.circle1]} />
                <View style={[styles.circle, styles.circle2]} />
                <View style={[styles.circle, styles.circle3]} />
            </View>

            {/* Skip Button */}
            {!isLastStep && (
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                >
                    <Text style={[
                        styles.skipText,
                        theme === 'dark' && styles.darkText
                    ]}>
                        Skip
                    </Text>
                </TouchableOpacity>
            )}

            {/* Content */}
            <View style={styles.content}>
                <Animated.View
                    style={[
                        styles.stepContent,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateX: slideAnim }]
                        }
                    ]}
                >
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>{step.icon}</Text>
                    </View>

                    {/* Text Content */}
                    <View style={styles.textContainer}>
                        <Text style={[
                            styles.title,
                            theme === 'dark' && styles.darkText
                        ]}>
                            {step.title}
                        </Text>
                        <Text style={[
                            styles.description,
                            theme === 'dark' && styles.darkSubtext
                        ]}>
                            {step.description}
                        </Text>
                    </View>
                </Animated.View>

                {/* Progress Dots */}
                <View style={styles.dotsContainer}>
                    {ONBOARDING_STEPS.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentStep ? styles.activeDot : styles.inactiveDot,
                                theme === 'dark' && index !== currentStep && styles.darkInactiveDot
                            ]}
                        />
                    ))}
                </View>

                {/* Navigation Buttons */}
                <View style={styles.buttonsContainer}>
                    {!isFirstStep && (
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.secondaryButton,
                                theme === 'dark' && styles.darkSecondaryButton
                            ]}
                            onPress={handlePrevious}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={20}
                                color={theme === 'dark' ? '#fff' : '#666'}
                            />
                            <Text style={[
                                styles.buttonText,
                                styles.secondaryButtonText,
                                theme === 'dark' && styles.darkText
                            ]}>
                                Back
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.primaryButton,
                            { flex: isFirstStep ? 1 : 2 }
                        ]}
                        onPress={handleNext}
                    >
                        <Text style={styles.primaryButtonText}>
                            {isLastStep ? 'Get Started' : 'Continue'}
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bottom Safe Area */}
            <View style={{ height: insets.bottom }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    lightContainer: {
        backgroundColor: '#f8fafc',
    },
    darkContainer: {
        backgroundColor: '#000',
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    circle: {
        position: 'absolute',
        borderRadius: 500,
    },
    circle1: {
        width: 200,
        height: 200,
        top: -80,
        right: -80,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    circle2: {
        width: 150,
        height: 150,
        bottom: '30%',
        left: -50,
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
    },
    circle3: {
        width: 100,
        height: 100,
        bottom: 100,
        right: 50,
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 24,
        zIndex: 10,
        padding: 8,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    content: {
        flex: 1,
        paddingTop: 120,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    stepContent: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    iconContainer: {
        marginBottom: 48,
    },
    icon: {
        fontSize: 96,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 38,
    },
    description: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        lineHeight: 28,
        paddingHorizontal: 20,
    },
    darkText: {
        color: '#fff',
    },
    darkSubtext: {
        color: '#999',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 40,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        backgroundColor: '#10b981',
        width: 24,
    },
    inactiveDot: {
        backgroundColor: '#e5e5e5',
    },
    darkInactiveDot: {
        backgroundColor: '#333',
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#10b981',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#e5e5e5',
    },
    darkSecondaryButton: {
        borderColor: '#333',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    primaryButtonText: {
        color: '#fff',
    },
    secondaryButtonText: {
        color: '#666',
    },
});