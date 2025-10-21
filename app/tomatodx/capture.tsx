// capture.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, Dimensions, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function CaptureScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main entrance animation sequence
    Animated.sequence([
      // Fade in background and main container
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Scale up camera view
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      // Slide up buttons
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      })
    ]).start();

    // Continuous animations
    Animated.loop(
      Animated.sequence([
        // Pulse animation for guide overlay
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer effect for camera icon
    Animated.loop(
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
    ).start();

    // Subtle rotation for scan icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleCapture = async () => {
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
    ]).start();

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        router.push(`/tomatodx/preview?uri=${encodeURIComponent(result.assets[0].uri)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleGallery = async () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(slideUpAnim, {
        toValue: 5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Media library permission is needed to access photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        router.push(`/tomatodx/preview?uri=${encodeURIComponent(result.assets[0].uri)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery');
    }
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
    <View style={styles.container}>
      {/* Animated Background Elements */}
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
        <Text style={[styles.title,]}>{t('capture.title')}</Text>
        <Text style={styles.subtitle}>{t('capture.subtitle')}</Text>
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
        <View style={styles.cameraPlaceholder}>
          {/* Camera Icon with Shimmer */}
          <Animated.View 
            style={[
              styles.cameraIconContainer,
              { backgroundColor: shimmerInterpolate }
            ]}
          >
            <Ionicons name="camera" size={48} color="#ffffff" />
          </Animated.View>
          
          <Text style={styles.camText}>{t('capture.preview')}</Text>
          
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
                  { opacity: pulseAnim }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.corner, styles.cornerTR,
                  { opacity: pulseAnim }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.corner, styles.cornerBL,
                  { opacity: pulseAnim }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.corner, styles.cornerBR,
                  { opacity: pulseAnim }
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
              <Ionicons name="scan" size={28} color="#22c55e" />
            </Animated.View>
            
            <Text style={styles.guideText}>{t('capture.align')}</Text>
          </Animated.View>

          {/* Grid Overlay */}
          <View style={styles.gridOverlay}>
            <View style={styles.gridLineVertical} />
            <View style={styles.gridLineHorizontal} />
          </View>
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
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleCapture}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={24} color="#ffffff" />
          <Text style={styles.primaryButtonText}>{t('capture.takePhoto')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleGallery}
          activeOpacity={0.8}
        >
          <Ionicons name="images" size={20} color="#22c55e" />
          <Text style={styles.secondaryButtonText}>{t('capture.openGallery')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    // backgroundColor: '#000',
    backgroundColor:'#f2f2f2',  
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
    paddingBottom: 20,
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
    shadowRadius: 12,
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
    borderColor: '#374151',
    paddingVertical: 16,
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
});