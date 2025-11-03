import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider as CustomThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { ToastProvider } from '../src/contexts/ToastContext';
import '../src/i18n/i18n';


function AppContent() {
  const { theme } = useTheme();

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Only set up unhandled rejection handler on web platform
    if (Platform.OS === 'web') {
      const handleUnhandledRejection = (event: any) => {
        if (event.reason?.message?.includes('keep awake')) {
          console.warn('Keep awake error suppressed:', event.reason.message);
          event.preventDefault();
          return;
        }
        console.error('Unhandled promise rejection:', event.reason);
      };

      // Add global error handler for web only
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        return () => {
          window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
      }
    }
    // For native platforms (iOS/Android), React Native handles promise rejections differently
    // and we don't need to set up window event listeners
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CustomThemeProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </CustomThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
