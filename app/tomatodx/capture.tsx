// capture.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-get-random-values';
import { useToast } from '../../src/contexts/ToastContext';
import { initDb } from '../../src/db/schema';
import { createButtonPressAnimation, createEntranceAnimation, createPulseAnimation, createRotationAnimation, createShimmerAnimation, useCommonAnimations } from '../../src/utils/animations';
import { handleCameraCapture, handleGalleryPicker } from '../../src/utils/imagePicker';
import { useScreenSetup } from '../../src/utils/screenSetup';

const { width } = Dimensions.get('window');

export default function CaptureScreen() {
  const { t, tokens, insets } = useScreenSetup();
  const { showToast } = useToast();

  // Animation values
  const { fadeAnim, scaleAnim, slideUpAnim, pulseAnim } = useCommonAnimations();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initDb();

    // Main entrance animation sequence
    createEntranceAnimation(fadeAnim, scaleAnim, slideUpAnim).start();

    // Start continuous animations
    createPulseAnimation(pulseAnim).start();
    createShimmerAnimation(shimmerAnim).start();
    createRotationAnimation(rotateAnim).start();
  }, []);

  const handleCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createButtonPressAnimation(scaleAnim);

    await handleCameraCapture({
      showToast,
      onError: (message) => showToast(t('capture.cameraPermissionRequired'), 'error', 4000),
    });
  };

  const handleGallery = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    createButtonPressAnimation(slideUpAnim);

    await handleGalleryPicker({
      showToast,
      onError: (message) => showToast(t('capture.galleryPermissionRequired'), 'error', 4000),
    });
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const shimmerInterpolate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.8)']
  });

  return (
    <View style={[styles.container, { backgroundColor: tokens.background }]}>
      {/* Animated Background Elements */}
      <Animated.View style={[styles.backgroundCircle, styles.circle1, { opacity: fadeAnim, backgroundColor: tokens.primaryOverlay2 }]} />
      <Animated.View style={[styles.backgroundCircle, styles.circle2, { opacity: fadeAnim, backgroundColor: tokens.successOverlay }]} />

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
        <Text style={[styles.title, { color: tokens.primaryDark }]}>{t('capture.title')}</Text>
        <Text style={[styles.subtitle, { color: tokens.mutedLight }]}>{t('capture.subtitle')}</Text>
      </Animated.View>

      {/* Camera Preview Area */}
      <Animated.View
        style={[
          styles.cameraContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={[styles.cameraPlaceholder, { backgroundColor: tokens.surface, borderColor: tokens.border, shadowColor: tokens.shadowDark }]}>
          <ImageBackground
            source={require('../../assets/sample-tomato-leaf.png')}
            style={StyleSheet.absoluteFillObject as any}
            imageStyle={{ borderRadius: 24 }}
            resizeMode="cover"
          />
          {/* Camera Icon with Shimmer */}
          <Animated.View
            style={[
              styles.cameraIconContainer,
              { backgroundColor: shimmerInterpolate, borderColor: tokens.successBg, borderWidth: 1 }
            ]}
          >
            <Ionicons name="camera" size={48} color={tokens.whiteMuted} />
          </Animated.View>

          <Text style={[styles.camText, { color: tokens.successBg }]}>{t('capture.preview')}</Text>

          {/* Animated Guide Overlay */}
          <Animated.View
            style={[
              styles.guideOverlay,
              {
                transform: [{ scale: pulseAnim }],
              }
            ]}
          >
            <View style={styles.guideBorder}>
              <Animated.View
                style={[
                  styles.corner, styles.cornerTL,
                  { opacity: pulseAnim, borderColor: tokens.shadowDark }
                ]}
              />
              <Animated.View
                style={[
                  styles.corner, styles.cornerTR,
                  { opacity: pulseAnim, borderColor: tokens.shadowDark }
                ]}
              />
              <Animated.View
                style={[
                  styles.corner, styles.cornerBL,
                  { opacity: pulseAnim, borderColor: tokens.shadowDark }
                ]}
              />
              <Animated.View
                style={[
                  styles.corner, styles.cornerBR,
                  { opacity: pulseAnim, borderColor: tokens.shadowDark }
                ]}
              />
            </View>

            {/* Rotating Scan Icon */}
            <Animated.View
              style={[
                styles.scanIconContainer,
                { transform: [{ rotate: rotateInterpolate }] }
              ]}
            >
              <Ionicons name="scan" size={28} color={tokens.primary} />
            </Animated.View>

            <Text style={[styles.guideText, { color: tokens.primary, backgroundColor: tokens.shadowMedium }]}>{t('capture.align')}</Text>
          </Animated.View>

          {/* Grid Overlay */}
          <View style={styles.gridOverlay}>
            <View style={[styles.gridLineVertical, { backgroundColor: tokens.whiteOverlay }]} />
            <View style={[styles.gridLineHorizontal, { backgroundColor: tokens.whiteOverlay }]} />
          </View>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.actionsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
            paddingBottom: Math.max(16, insets.bottom)
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: tokens.primary, shadowColor: tokens.primary }]}
          onPress={handleCapture}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={24} color={tokens.whiteMuted} />
          <Text style={[styles.primaryButtonText, { color: tokens.whiteMuted }]}>{t('capture.takePhoto')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: tokens.border }]}
          onPress={handleGallery}
          activeOpacity={1}
        >
          <Ionicons name="images" size={20} color={tokens.primary} />
          <Text style={[styles.secondaryButtonText, { color: tokens.muted }]}>{t('capture.openGallery')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000',
    backgroundColor: '#f2f2f2',
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
    top: -50,
    right: -50,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -50,
    backgroundColor: 'rgba(134, 239, 172, 0.05)',
  },
  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 0,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Camera area
  cameraContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  cameraPlaceholder: {
    height: width * 0.9,
    borderRadius: 24,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12
  },
  cameraIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  camText: {
    color: '#d1d5db',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  // Guide overlay
  guideOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideBorder: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.6)',
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#22c55e',
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  scanIconContainer: {
    position: 'absolute',
  },
  guideText: {
    position: 'absolute',
    bottom: -40,
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 8,

  },
  // Grid overlay
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLineVertical: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  gridLineHorizontal: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
  },
  // Action buttons
  actionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#22c55e',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 6,
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryButtonText: {
    // color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
});