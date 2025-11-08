// app/tomatodx/preview.tsx - Preview Screen
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { insertDiagnosis, insertImage, upsertDisease } from '../../src/db/repository';
import { predictFromUri } from '../../src/ml/inference';
import { initModel } from '../../src/ml/model';

const { width } = Dimensions.get('window');

export default function PreviewScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const colors = Colors[theme];
  const [analyzing, setAnalyzing] = useState(false);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAnalyze = async () => {
    if (!uri) {
      Alert.alert(t('preview.error'), t('preview.noImage'));
      return;
    }

    setAnalyzing(true);

    try {
      // Initialize ML model
      await initModel();

      // Run prediction
      const prediction = await predictFromUri(uri as string);

      // Generate unique IDs
      const imageId = `img_${Date.now()}`;
      const diagnosisId = `diag_${Date.now()}`;
      const diseaseId = prediction.label.toLowerCase().replace(/\s+/g, '_');

      // Save image to database
      insertImage(imageId, uri as string, new Date().toISOString(), 'device');

      // Save or update disease info
      upsertDisease(
        diseaseId,
        prediction.label,
        prediction.label, // You can add Amharic translation here
        '', // symptoms
        '' // advice
      );

      // Save diagnosis
      insertDiagnosis(
        diagnosisId,
        imageId,
        diseaseId,
        prediction.confidence,
        new Date().toISOString()
      );

      setAnalyzing(false);

      // Navigate to result screen
      router.push(`/tomatodx/result?id=${diagnosisId}`);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalyzing(false);
      Alert.alert(
        t('preview.error'),
        t('preview.analysisError') + ': ' + (error as Error).message
      );
    }
  };

  const handleRetake = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.background, colors.backgroundAlt]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('preview.title')}
        </Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Image Preview */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.imageContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[
          styles.imageWrapper,
          {
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
          <Image
            source={uri ? { uri: uri as string } : require('../../assets/sample-tomato-leaf.png')}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Overlay Status */}
          <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.statusText}>{t('preview.ready')}</Text>
          </View>

          {/* Image Quality Indicator */}
          <View style={[styles.qualityIndicator, { backgroundColor: colors.whiteOverlay }]}>
            <Ionicons name="aperture" size={16} color={colors.success} />
            <Text style={[styles.qualityText, { color: colors.text }]}>
              {t('preview.highQuality')}
            </Text>
          </View>
        </Animated.View>

        {/* Analysis Tips */}
        <Animated.View style={[
          styles.tipsCard,
          {
            backgroundColor: colors.card,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <Ionicons name="bulb" size={24} color={colors.warning} />
          <View style={styles.tipsContent}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>
              {t('preview.tipsTitle')}
            </Text>
            <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
              {t('preview.tipsText')}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.analyzeButton, styles.shadow]}
          onPress={handleAnalyze}
          disabled={analyzing}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.analyzeGradient}
          >
            {analyzing ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.analyzeText}>{t('preview.analyzing')}</Text>
              </>
            ) : (
              <>
                <Ionicons name="analytics" size={24} color="#fff" />
                <Text style={styles.analyzeText}>{t('preview.analyze')}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.retakeButton, { borderColor: colors.border }]}
          onPress={handleRetake}
        >
          <Ionicons
            name="camera-reverse"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.retakeText, { color: colors.textSecondary }]}>
            {t('preview.retake')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    padding: 20,
  },
  imageWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: width - 40,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  qualityIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  analyzeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  analyzeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  shadow: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});