// preview.tsx
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';
import LargeButton from '../../src/components/LargeButton';

const { width } = Dimensions.get('window');

export default function PreviewScreen({ route, navigation }: { route: any, navigation: any }) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.95);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Explicitly handle goBack to ensure navigation works
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback: Navigate to capture screen if no previous route
      navigation.replace('capture');
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.Image 
        source={require('../../assets/sample-tomato.jpg')} 
        style={[styles.image, { transform: [{ scale: scaleAnim }] }]} 
        resizeMode="contain" 
      />
      <Animated.View style={[styles.row, { opacity: fadeAnim }]}>
        <LargeButton label="Retake" onPress={handleGoBack} />
        <LargeButton 
          label="Use Photo" 
          onPress={() => router.push('/tomatodx/result')} 
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  image: { 
    width: width - 40, // Adjust to screen width with padding
    height: (width - 40) * 1.4, // Maintain aspect ratio
    borderRadius: 12, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 6,
  },
  row: { 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    gap: 12,
    width: width - 40, // Match container width
  },
});