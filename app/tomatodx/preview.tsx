// preview.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
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

const { width, height } = Dimensions.get('window');

export default function PreviewScreen({ route, navigation }: { route: any, navigation: any }) {
  const { t } = useTranslation();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const imageScaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Fade in background
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Image scale animation
      Animated.parallel([
        Animated.timing(imageScaleAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        })
      ]),
      // Buttons slide up
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();

    // Continuous pulse animation for action buttons
    Animated.loop(
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
    ).start();
  }, []);

  const handleGoBack = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/tomatodx/capture');
      }
    });
  };

  const handleUsePhoto = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/tomatodx/result');
    });
  };

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <Animated.View style={[styles.backgroundCircle, styles.circle1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.backgroundCircle, styles.circle2, { opacity: fadeAnim }]} />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        <Text style={styles.title}>📷 Photo Preview</Text>
        <Text style={styles.subtitle}>Review your captured tomato image</Text>
      </Animated.View>

      {/* Image Preview */}
      <Animated.View 
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.imageWrapper}>
          <Animated.Image 
            source={require('../../assets/sample-tomato-leaf.png')} 
            style={[
              styles.image, 
              { 
                transform: [{ scale: imageScaleAnim }] 
              }
            ]} 
            resizeMode="cover" 
          />
          
          {/* Overlay Badge */}
          <View style={styles.overlayBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={styles.overlayText}>Ready for Analysis</Text>
          </View>

          {/* Image Frame */}
          <View style={styles.imageFrame} />
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View 
        style={[
          styles.actionsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }]
          }}
        >
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleUsePhoto}
            activeOpacity={0.8}
          >
            <Ionicons name="analytics" size={24} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Analyze Photo</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-reverse" size={20} color="#6b7280" />
          <Text style={styles.secondaryButtonText}>Retake Photo</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Help Text */}
      <Animated.View 
        style={[
          styles.helpContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        <Text style={styles.helpText}>
          ✅ Ensure the tomato is clearly visible and well-lit
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
  },
  // Background elements
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 500,
  },
  circle1: {
    width: 180,
    height: 180,
    top: -60,
    right: -60,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  circle2: {
    width: 120,
    height: 120,
    bottom: 80,
    left: -40,
    backgroundColor: 'rgba(134, 239, 172, 0.05)',
  },
  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Image container
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: { 
    width: width - 40,
    height: (width - 40) * 1.2,
    borderRadius: 16,
  },
  imageFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  overlayBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  overlayText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Actions container
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 8,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#374151',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryButtonText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
  // Help container
  helpContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  helpText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});