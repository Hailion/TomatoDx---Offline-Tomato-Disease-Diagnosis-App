// animations.ts - Reusable animation utilities
import { useRef } from 'react';
import { Animated, Easing } from 'react-native';

// Common animation values hook
export const useCommonAnimations = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const slideUpAnim = useRef(new Animated.Value(30)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    return { fadeAnim, scaleAnim, slideUpAnim, pulseAnim };
};

// Standard entrance animation sequence
export const createEntranceAnimation = (
    fadeAnim: Animated.Value,
    scaleAnim: Animated.Value,
    slideUpAnim: Animated.Value
) => {
    return Animated.sequence([
        // Fade in background
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }),
        // Scale and slide animation
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 700,
                easing: Easing.elastic(1),
                useNativeDriver: true,
            }),
            Animated.timing(slideUpAnim, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            })
        ])
    ]);
};

// Button press animation
export const createButtonPressAnimation = (
    animValue: Animated.Value,
    callback?: () => void
) => {
    Animated.sequence([
        Animated.timing(animValue, {
            toValue: 0.95,
            duration: 80,
            useNativeDriver: true,
        }),
        Animated.timing(animValue, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
        }),
    ]).start(callback);
};

// Continuous pulse animation
export const createPulseAnimation = (pulseAnim: Animated.Value) => {
    return Animated.loop(
        Animated.sequence([
            Animated.timing(pulseAnim, {
                toValue: 1.05,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ])
    );
};

// Shimmer animation for camera effects
export const createShimmerAnimation = (shimmerAnim: Animated.Value) => {
    return Animated.loop(
        Animated.sequence([
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            }),
            Animated.timing(shimmerAnim, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
            }),
        ])
    );
};

// Rotation animation
export const createRotationAnimation = (rotateAnim: Animated.Value) => {
    return Animated.loop(
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.linear,
            useNativeDriver: true,
        })
    );
};
