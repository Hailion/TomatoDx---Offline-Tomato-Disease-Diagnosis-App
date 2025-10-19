// index.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import LargeButton from '../../src/components/LargeButton';

export default function TomatoHome() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0.7,
        duration: 800,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNavigation = (route: string) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push(route as any);
    });
  };

  return (
    <LinearGradient colors={['#F7FFF7', '#E6FFFA']} style={styles.container}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Ionicons name="leaf" size={48} color="#2F855A" style={styles.icon} />
        <Text style={styles.title}>TomatoDx</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.center,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <LargeButton 
          label={t('home.capture')} 
          icon="camera"
          onPress={() => handleNavigation('/tomatodx/capture')} 
        />
        <View style={{ height: 16 }} />
        <LargeButton 
          label={t('home.history')} 
          icon="time"
          onPress={() => handleNavigation('/tomatodx/history')} 
        />
      </Animated.View>

      <Animated.View 
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Text 
          style={styles.link} 
          onPress={() => handleNavigation('/tomatodx/settings')}
        >
          <Ionicons name="settings" size={16} /> {t('home.settings')}
        </Text>
        <Text 
          style={styles.link} 
          onPress={() => handleNavigation('/tomatodx/admin')}
        >
          <Ionicons name="shield" size={16} /> Admin
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  icon: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { 
    fontSize: 42, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginBottom: 8, 
    color: '#2F855A',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: { 
    textAlign: 'center', 
    marginBottom: 24, 
    color: '#4A5568',
    fontSize: 16,
    lineHeight: 24,
  },
  center: { 
    alignItems: 'center' 
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 60, 
    paddingHorizontal: 8 
  },
  link: { 
    color: '#2B6CB0', 
    fontSize: 16,
    fontWeight: '600',
  }
});