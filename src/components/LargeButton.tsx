import { Ionicons } from '@expo/vector-icons';
import React from 'react';

import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

type Props = {
  label: string;
  icon?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function LargeButton({ label, icon, onPress, style, textStyle }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={[style, styles.btn]} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.content}>
        {icon && <Ionicons name={icon as any} size={20} color="#fff" style={styles.icon} />}
        <Text style={[styles.txt, textStyle]}>{label}</Text>
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
