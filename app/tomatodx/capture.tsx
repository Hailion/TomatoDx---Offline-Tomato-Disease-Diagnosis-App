// capture.tsx
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import LargeButton from '../../src/components/LargeButton';

const { width, height } = Dimensions.get('window');

export default function CaptureScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1200,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCapture = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Navigate to preview with the captured image
        router.push(`/tomatodx/preview?uri=${encodeURIComponent(result.assets[0].uri)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleGallery = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Media library permission is needed to access photos.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Navigate to preview with the selected image
        router.push(`/tomatodx/preview?uri=${encodeURIComponent(result.assets[0].uri)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.cameraPlaceholder,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <Ionicons name="camera" size={64} color="#234E52" />
        <Text style={styles.camText}>Camera View</Text>
        
        {/* Animated guide overlay */}
        <Animated.View 
          style={[
            styles.guideOverlay,
            {
              transform: [{ scale: pulseAnim }],
            }
          ]}
        >
          <View style={styles.guideBorder} />
          <Ionicons name="scan" size={32} color="#FFF" style={styles.scanIcon} />
        </Animated.View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <LargeButton 
          label="Take Photo" 
          icon="camera"
          onPress={handleCapture} 
        />
        <Text 
          style={styles.gallery} 
          onPress={handleGallery}
        >
          <Ionicons name="images" size={16} /> Open Gallery
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#000',paddingBottom: 100 },
  cameraPlaceholder: { 
    flex: 1, 
    borderRadius: 20, 
    backgroundColor: '#1A202C', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  camText: { color: '#E6FFFA', fontSize: 18, marginTop: 12 },
  guideOverlay: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBorder: {
    width: 180,
    height: 180,
    borderWidth: 2,
    borderColor: '#2F855A',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  scanIcon: {
    position: 'absolute',
  },
  gallery: { 
    textAlign: 'center', 
    marginTop: 16, 
    color: '#63B3ED',
    fontSize: 16,
    fontWeight: '600',
  }
});