// settings.tsx
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, themeMode, setThemeMode, toggleTheme } = useTheme();

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en');

  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'system': return '⚙️';
      default: return '⚙️';
    }
  };

  const getThemeText = () => {
    switch (themeMode) {
      case 'light': return t('settings.light');
      case 'dark': return t('settings.dark');
      case 'system': return t('settings.system');
      default: return t('settings.system');
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>{t('settings.title')}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <TouchableOpacity onPress={toggleLanguage} style={styles.optionBtn}>
          <Text style={styles.optionText}>{i18n.language === 'en' ? 'English' : 'አማርኛ'}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.theme')}</Text>
        <View style={styles.themeOptions}>
          <TouchableOpacity 
            onPress={() => setThemeMode('light')} 
            style={[styles.themeBtn, themeMode === 'light' && styles.themeBtnActive]}
          >
            <Text style={styles.themeIcon}>☀️</Text>
            <Text style={[styles.themeText, themeMode === 'light' && styles.themeTextActive]}>{t('settings.light')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setThemeMode('dark')} 
            style={[styles.themeBtn, themeMode === 'dark' && styles.themeBtnActive]}
          >
            <Text style={styles.themeIcon}>🌙</Text>
            <Text style={[styles.themeText, themeMode === 'dark' && styles.themeTextActive]}>{t('settings.dark')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setThemeMode('system')} 
            style={[styles.themeBtn, themeMode === 'system' && styles.themeBtnActive]}
          >
            <Text style={styles.themeIcon}>⚙️</Text>
            <Text style={[styles.themeText, themeMode === 'system' && styles.themeTextActive]}>{t('settings.system')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 24, color: '#1a202c' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#2d3748' },
  optionBtn: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#f7fafc', 
    padding: 16, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  optionText: { fontSize: 16, fontWeight: '500', color: '#2d3748' },
  chevron: { fontSize: 20, color: '#a0aec0' },
  themeOptions: { flexDirection: 'row', gap: 12 },
  themeBtn: { 
    flex: 1, 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: '#f7fafc',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  themeBtnActive: { 
    backgroundColor: '#e6fffa', 
    borderColor: '#22c55e' 
  },
  themeIcon: { fontSize: 24, marginBottom: 8 },
  themeText: { fontSize: 14, fontWeight: '500', color: '#4a5568' },
  themeTextActive: { color: '#22c55e', fontWeight: '600' }
});