import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ResultCard({ result }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{result.nameEn} / {result.nameAm}</Text>
      <Text style={styles.conf}>{Math.round(result.confidence * 100)}% confidence</Text>
      <Text style={styles.advice}>{result.advice}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  name: { fontSize: 20, fontWeight: '700' },
  conf: { color: '#718096', marginTop: 6 },
  advice: { marginTop: 10 }
});
