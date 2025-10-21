// settings.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, themeMode, setThemeMode, toggleTheme } = useTheme();
  const [username, setUsername] = useState('User');
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpHeader = useRef(new Animated.Value(40)).current;
  const slideUpContent = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const inputScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Fade in background
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Header animation
      Animated.parallel([
        Animated.timing(slideUpHeader, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        })
      ]),
      // Content animation
      Animated.timing(slideUpContent, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en');
  };

  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
  };

  const handleUsernameSave = () => {
    if (username.trim().length === 0) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }
    
    Animated.sequence([
      Animated.timing(inputScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(inputScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsEditingUsername(false);
      // Here you would typically save to AsyncStorage or your backend
      Alert.alert('Success', 'Username updated successfully!');
    });
  };

  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    // Reset to previous username if needed
  };

  const getThemeIcon = (mode: string) => {
    switch (mode) {
      case 'light': return 'sunny';
      case 'dark': return 'moon';
      case 'system': return 'phone-portrait';
      default: return 'settings';
    }
  };

  const getThemeColor = (mode: string) => {
    switch (mode) {
      case 'light': return '#f59e0b';
      case 'dark': return '#8b5cf6';
      case 'system': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getThemeText = (mode: string) => {
    switch (mode) {
      case 'light': return t('settings.light');
      case 'dark': return t('settings.dark');
      case 'system': return t('settings.system');
      default: return t('settings.system');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <Animated.View style={[styles.backgroundCircle, styles.circle1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.backgroundCircle, styles.circle2, { opacity: fadeAnim }]} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideUpHeader },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Text style={styles.title}>⚙️ Settings</Text>
          <Text style={styles.subtitle}>Customize your app experience</Text>
        </Animated.View>

        {/* Profile Section */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpContent }]
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={24} color="#3b82f6" />
            <Text style={styles.cardTitle}>Profile</Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.profileInfo}>
              {isEditingUsername ? (
                <Animated.View style={{ transform: [{ scale: inputScaleAnim }] }}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.usernameInput}
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Enter your username"
                      autoFocus
                      maxLength={20}
                    />
                    <View style={styles.inputActions}>
                      <TouchableOpacity 
                        style={styles.saveBtn}
                        onPress={handleUsernameSave}
                      >
                        <Ionicons name="checkmark" size={16} color="#ffffff" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.cancelBtn}
                        onPress={handleUsernameCancel}
                      >
                        <Ionicons name="close" size={16} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              ) : (
                <>
                  <Text style={styles.username}>{username}</Text>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={handleUsernameEdit}
                  >
                    <Ionicons name="pencil" size={14} color="#3b82f6" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Language Section */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpContent }]
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="language" size={24} color="#8b5cf6" />
            <Text style={styles.cardTitle}>Language</Text>
          </View>

          <TouchableOpacity 
            style={styles.optionButton}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="globe" size={20} color="#6b7280" />
              <Text style={styles.optionText}>
                {i18n.language === 'en' ? 'English' : 'አማርኛ'}
              </Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={styles.optionValue}>
                {i18n.language === 'en' ? 'አማርኛ' : 'English'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Theme Section */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpContent }]
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="color-palette" size={24} color="#f59e0b" />
            <Text style={styles.cardTitle}>Theme</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Choose your preferred appearance
          </Text>

          <View style={styles.themeOptions}>
            {['light', 'dark', 'system'].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeOption,
                  themeMode === mode && styles.themeOptionActive
                ]}
                onPress={() => setThemeMode(mode as any)}
                activeOpacity={0.8}
              >
                <View 
                  style={[
                    styles.themeIconContainer,
                    { backgroundColor: getThemeColor(mode) + '20' }
                  ]}
                >
                  <Ionicons 
                    name={getThemeIcon(mode) as any} 
                    size={20} 
                    color={getThemeColor(mode)} 
                  />
                </View>
                <Text style={styles.themeOptionText}>
                  {getThemeText(mode)}
                </Text>
                {themeMode === mode && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark" size={16} color="#16a34a" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* App Info Section */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpContent }]
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#10b981" />
            <Text style={styles.cardTitle}>App Information</Text>
          </View>

          <View style={styles.infoItems}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.2.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2024.01.15</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>2 days ago</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fffc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Background elements
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 500,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -80,
    right: -80,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -50,
    left: -50,
    backgroundColor: 'rgba(134, 239, 172, 0.05)',
  },
  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#166534',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Cards
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  // Profile section
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  // Input section
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usernameInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveBtn: {
    backgroundColor: '#16a34a',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f3f4f6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  // Option buttons
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  optionValue: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Theme options
  themeOptions: {
    gap: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  themeOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Info items
  infoItems: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});