import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider as CustomThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import '../src/i18n/i18n';


function AppContent() {
  const { theme } = useTheme();
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === '/' || pathname === '') {
      router.replace('/tomatodx');
    }
  }, [pathname]);

  if (!pathname || pathname === '/' || pathname === '') {
    return <Redirect href="/tomatodx" />;
  }

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="tomatodx">
        <Stack.Screen name="tomatodx" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <AppContent />
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}
