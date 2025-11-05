// app/tomatodx/preview.tsx - Preview Screen
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function PreviewScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleAnalyze = () => {
    // Simulate analysis process
    setTimeout(() => {
      router.push('/tomatodx/result?id=1');
    }, 1500);
  };

  const handleRetake = () => {
    router.back();
  };

  return (
    <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
      {/* Header */}
      <LinearGradient
        colors={theme === 'dark' ? ['#1a1a1a', '#2d2d2d'] : ['#f8fafc', '#e2e8f0']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme === 'dark' ? '#fff' : '#1a1a1a'}
          />
        </TouchableOpacity>
        <Text style={[styles.title, theme === 'dark' && styles.darkText]}>
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
        <View style={[styles.imageWrapper, theme === 'dark' && styles.darkImageWrapper]}>
          <Image
            source={require('../../assets/sample-tomato-leaf.png')}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Overlay Status */}
          <View style={[styles.statusBadge, { backgroundColor: '#10b981' }]}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.statusText}>{t('preview.ready')}</Text>
          </View>

          {/* Image Quality Indicator */}
          <View style={[styles.qualityIndicator, theme === 'dark' && styles.darkQualityIndicator]}>
            <Ionicons name="aperture" size={16} color="#10b981" />
            <Text style={[styles.qualityText, theme === 'dark' && styles.darkText]}>
              {t('preview.highQuality')}
            </Text>
          </View>
        </View>

        {/* Analysis Tips */}
        <View style={[styles.tipsCard, theme === 'dark' && styles.darkCard]}>
          <Ionicons name="bulb" size={24} color="#f59e0b" />
          <View style={styles.tipsContent}>
            <Text style={[styles.tipsTitle, theme === 'dark' && styles.darkText]}>
              {t('preview.tipsTitle')}
            </Text>
            <Text style={[styles.tipsText, theme === 'dark' && styles.darkSubtext]}>
              {t('preview.tipsText')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.analyzeButton, styles.shadow]}
          onPress={handleAnalyze}
        >
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.analyzeGradient}
          >
            <Ionicons name="analytics" size={24} color="#fff" />
            <Text style={styles.analyzeText}>{t('preview.analyze')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.retakeButton, theme === 'dark' && styles.darkRetakeButton]}
          onPress={handleRetake}
        >
          <Ionicons
            name="camera-reverse"
            size={20}
            color={theme === 'dark' ? '#fff' : '#666'}
          />
          <Text style={[styles.retakeText, theme === 'dark' && styles.darkText]}>
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
    backgroundColor: '#f8fafc',
  },
  darkContainer: {
    backgroundColor: '#000',
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
    color: '#1a1a1a',
  },
  darkText: {
    color: '#fff',
  },
  darkSubtext: {
    color: '#999',
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
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  darkImageWrapper: {
    backgroundColor: '#1a1a1a',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  darkQualityIndicator: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  darkCard: {
    backgroundColor: '#1a1a1a',
  },
  tipsContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
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
    borderColor: '#e5e5e5',
    gap: 12,
  },
  darkRetakeButton: {
    borderColor: '#333',
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  shadow: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});