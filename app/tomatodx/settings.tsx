// settings.tsx
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();

  const toggle = () => i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en');

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
      <Text style={styles.title}>{t('settings.title')}</Text>
      <View style={styles.row}>
        <Text>{t('settings.language')}</Text>
        <TouchableOpacity onPress={toggle} style={styles.langBtn}><Text>{i18n.language}</Text></TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#FFF' },
  title: { fontSize:22, fontWeight:'700', marginBottom:16 },
  row: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  langBtn: { backgroundColor:'#EDF2F7', padding:10, borderRadius:8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }
});