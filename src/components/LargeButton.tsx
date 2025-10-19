import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LargeButton({ label, icon, onPress }: { label: string; icon?: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btn} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.content}>
        {icon && <Ionicons name={icon as any} size={20} color="#fff" style={styles.icon} />}
        <Text style={styles.txt}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: '#2F855A', paddingVertical: 18, paddingHorizontal: 24, borderRadius: 12, minWidth: 240, alignItems: 'center' },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 8 },
  txt: { color: '#fff', fontSize: 18, fontWeight: '700' }
});
