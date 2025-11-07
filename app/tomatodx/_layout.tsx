// _layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function TomatoDxLayout() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const tokens = Colors[theme];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.primary,
        tabBarInactiveTintColor: tokens.muted,
        tabBarStyle: {
          backgroundColor: tokens.surface,
          borderTopColor: tokens.border,
          borderTopWidth: 1,
          height: Platform.select({
            ios: 88,
            android: 60 + insets.bottom,
            default: 60,
          }),
          paddingBottom: Platform.select({
            ios: 28,
            android: Math.max(8, insets.bottom),
            default: 8,
          }),
          elevation: 8,
          shadowColor: tokens.shadowDark,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home.navTitle') || 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: t('capture.navTitle') || 'Capture',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('history.navTitle') || 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings.navTitle') || 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: t('admin.navTitle') || 'Admin',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct" size={size} color={color} />
          ),
        }}
      />
      {/* Hidden screens that shouldn't appear in tabs */}
      <Tabs.Screen
        name="preview"
        options={{
          href: null, // Hide from tab bar
          title: t('preview.title') || 'Preview',
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          href: null, // Hide from tab bar
          title: t('result.title') || 'Result',
        }}
      />
    </Tabs>
  );
}
