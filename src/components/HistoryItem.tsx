import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HistoryItem({ item, onPress }: any) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.thumb} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.disease}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.chev}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#EDF2F7' },
  thumb: { width: 48, height: 48, borderRadius: 6, backgroundColor: '#F6E05E', marginRight: 12 },
  title: { fontWeight: '700' },
  date: { color: '#718096' },
  chev: { color: '#CBD5E0', fontSize: 24 }
});
