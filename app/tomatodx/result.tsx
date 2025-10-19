// result.tsx
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ResultCard from '../../src/components/ResultCard';

// Mock data store
const mockDataStore = {
  '1': {
    diseaseId: 'early_blight',
    nameEn: 'Early Blight',
    nameAm: 'ጥቂት ብርሃን',
    confidence: 0.92,
    advice: 'Remove affected leaves; apply fungicide.'
  },
  '2': {
    diseaseId: 'healthy',
    nameEn: 'Healthy',
    nameAm: 'ጤናማ',
    confidence: 0.95,
    advice: 'Your tomato plant is healthy! Continue regular care.'
  }
};

export default function ResultScreen() {
  const { id } = useLocalSearchParams();
  const mockResult = mockDataStore[id as keyof typeof mockDataStore] || mockDataStore['1'];

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>Diagnosis</Animated.Text>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ResultCard result={mockResult} />
      </Animated.View>

      <Animated.View style={[styles.row, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.save} onPress={() => router.push('/tomatodx/history')}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.share} onPress={() => alert('Share stub')}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FEFFF7' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  save: { backgroundColor: '#2F855A', padding: 16, borderRadius: 10, flex: 1, marginRight: 8, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  saveText: { color: '#FFF', fontWeight: '700' },
  share: { borderColor: '#2B6CB0', borderWidth: 1, padding: 16, borderRadius: 10, flex: 1, marginLeft: 8, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  shareText: { color: '#2B6CB0', fontWeight: '700' }
});