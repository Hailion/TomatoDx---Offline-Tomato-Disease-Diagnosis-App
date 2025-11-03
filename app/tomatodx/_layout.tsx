// _layout.tsx
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

export default function TomatoDxLayout() {
  const { t } = useTranslation();

  // Shared screen options for consistent navigation experience
  const screenOptions = {
    headerShown: false, // We use custom headers
    animation: Platform.select({
      ios: 'default' as const,
      android: 'fade_from_bottom' as const,
      default: 'default' as const
    }), // Smooth native animations
    gestureEnabled: true, // Enable swipe back gesture
    gestureDirection: 'horizontal' as const,
    fullScreenGestureEnabled: Platform.OS === 'ios', // Full-screen swipe on iOS
    animationDuration: 300, // Smooth transition timing
  };

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="capture"
        options={{
          title: t('capture.title'),
          presentation: 'card' as const,
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          title: t('preview.title'),
          presentation: 'card' as const,
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: t('result.title'),
          presentation: 'card' as const,
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: t('history.title'),
          presentation: 'card' as const,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: t('settings.title'),
          presentation: 'card' as const,
        }}
      />
      <Stack.Screen
        name="admin"
        options={{
          title: t('admin.title'),
          presentation: 'card' as const,
        }}
      />
    </Stack>
  );
}
