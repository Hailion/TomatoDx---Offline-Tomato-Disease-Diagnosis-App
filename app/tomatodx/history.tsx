// history.tsx
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Animated, FlatList, StyleSheet, Text } from 'react-native';
import HistoryItem from '../../src/components/HistoryItem';

const mock = [
  { id: '1', disease: 'Early Blight', date: '2025-10-01' },
  { id: '2', disease: 'Healthy', date: '2025-10-10' }
];

export default function HistoryScreen({ navigation }: any) {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>History</Text>
      <FlatList
        data={mock}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <HistoryItem item={item} onPress={() => router.push(`/tomatodx/result?id=${item.id}`)} />}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 }
});