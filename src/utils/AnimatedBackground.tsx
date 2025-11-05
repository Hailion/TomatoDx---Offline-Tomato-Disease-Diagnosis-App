// AnimatedBackground.tsx - Reusable animated background component
import React from 'react';
import { Animated, StyleSheet } from 'react-native';

interface AnimatedBackgroundProps {
    fadeAnim: Animated.Value;
    primaryColor: string;
    secondaryColor: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
    fadeAnim,
    primaryColor,
    secondaryColor,
}) => {
    return (
        <>
            <Animated.View
                style={[
                    styles.backgroundCircle,
                    styles.circle1,
                    { opacity: fadeAnim, backgroundColor: primaryColor }
                ]}
            />
            <Animated.View
                style={[
                    styles.backgroundCircle,
                    styles.circle2,
                    { opacity: fadeAnim, backgroundColor: secondaryColor }
                ]}
            />
        </>
    );
};

const styles = StyleSheet.create({
    backgroundCircle: {
        position: 'absolute',
        borderRadius: 500,
    },
    circle1: {
        width: 200,
        height: 200,
        top: -50,
        right: -50,
    },
    circle2: {
        width: 150,
        height: 150,
        bottom: 100,
        left: -50,
    },
});