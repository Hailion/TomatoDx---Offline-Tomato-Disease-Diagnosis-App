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
      <Stack.Screen name="index" options={{ ...screenOptions }} />
      <Stack.Screen 
        name="capture" 
        options={{ 
          ...screenOptions,
          title: t('capture.title'),
          presentation: 'card' as const,
        }} 
      />
      <Stack.Screen 
        name="preview" 
        options={{ 
          ...screenOptions,
          title: t('preview.title'),
          presentation: 'card' as const,
        }} 
      />
      <Stack.Screen 
        name="result" 
        options={{ 
          ...screenOptions,
          title: t('result.title'),
          presentation: 'card' as const,
        }} 
      />
      <Stack.Screen 
        name="history" 
        options={{ 
          ...screenOptions,
          title: t('history.title'),
          presentation: 'card' as const,
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          ...screenOptions,
          title: t('settings.title'),
          presentation: 'card' as const,
        }} 
      />
      <Stack.Screen 
        name="admin" 
        options={{ 
          ...screenOptions,
          title: t('admin.title'),
          presentation: 'card' as const,
        }} 
      />
    </Stack>
  );
}

