// preview.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemeTokens } from '../../constants/Colors';
import { createButtonPressAnimation, createEntranceAnimation, createPulseAnimation, useCommonAnimations } from '../../src/utils/animations';
import { NavigationUtils } from '../../src/utils/navigation';
import { useScreenSetup } from '../../src/utils/screenSetup';

const { width } = Dimensions.get('window');

export default function PreviewScreen() {
  const { t, tokens, insets } = useScreenSetup();
  const styles = getStyles(tokens);

  const params = useLocalSearchParams();
  const rawUri = (params as any).uri;
  const imageUri = typeof rawUri === 'string' ? rawUri : Array.isArray(rawUri) ? rawUri[0] : undefined;
  const rawImageId = (params as any).imageId;
  const imageId = typeof rawImageId === 'string' ? rawImageId : Array.isArray(rawImageId) ? rawImageId[0] : undefined;

  // Animation values
  const { fadeAnim, scaleAnim, slideUpAnim, pulseAnim } = useCommonAnimations();
  const imageScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Main entrance animation
    createEntranceAnimation(fadeAnim, scaleAnim, slideUpAnim).start();

    // Image scale animation
    Animated.timing(imageScaleAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start();

    // Start pulse animation
    createPulseAnimation(pulseAnim).start();
  }, []);

  const handleGoBack = () => {
    createButtonPressAnimation(scaleAnim, () => {
      NavigationUtils.back();
    });
  };

  const handleUsePhoto = () => {
    if (!imageUri || !imageId) return;
    createButtonPressAnimation(pulseAnim, () => {
      NavigationUtils.pushWithSuccess('/tomatodx/result', { uri: imageUri, imageId });
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
            transform: [{ translateY: slideUpAnim }],
            paddingBottom: Math.max(20, insets.bottom)
          }
        ]}
      >
        <Text style={styles.title}>{t('preview.title')}</Text>
        <Text style={styles.subtitle}>{t('preview.subtitle')}</Text>
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
            source={imageUri ? { uri: imageUri } : require('../../assets/sample-tomato-leaf.png')}
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
            <Ionicons name="checkmark-circle" size={20} color={tokens.primary} />
            <Text style={styles.overlayText}>{t("preview.readyForAnalysis")}</Text>
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
            transform: [{ translateY: slideUpAnim }],
            paddingBottom: Math.max(20, insets.bottom)
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
            <Ionicons name="analytics" size={24} color={tokens.whiteMuted} />
            <Text style={styles.primaryButtonText}>{t("preview.analyzePhoto")}</Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-reverse" size={20} color={tokens.muted} />
          <Text style={styles.secondaryButtonText}>{t("preview.retake")}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Help Text */}
      <Animated.View
        style={[
          styles.helpContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
            paddingBottom: Math.max(40, insets.bottom)
          }
        ]}
      >
        <Text style={styles.helpText}>
          ✅ {t("preview.tip")}
        </Text>
      </Animated.View>
    </View>
  );
}

const getStyles = (c: ThemeTokens) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
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
    backgroundColor: c.primaryOverlay2,
  },
  circle2: {
    width: 120,
    height: 120,
    bottom: 80,
    left: -40,
    backgroundColor: c.successOverlay,
  },
  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: c.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: c.mutedLight,
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: width - 30,
    height: (width - 50) * 1.2,
    borderRadius: 16,
  },
  imageFrame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: c.whiteOverlay,
    borderRadius: 20,
  },
  overlayBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.shadowDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  overlayText: {
    color: c.whiteMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  // Actions container
  actionsContainer: {
    paddingHorizontal: 24,
    marginTop: 30,
    paddingBottom: 20,
    gap: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: c.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 8,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: c.whiteMuted,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: c.border,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryButtonText: {
    color: c.mutedLight,
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
    color: c.muted,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});