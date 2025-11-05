import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider as CustomThemeProvider } from '../src/contexts/ThemeContext';
import '../src/i18n/i18n';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CustomThemeProvider>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="tomatodx" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </PaperProvider>
      </CustomThemeProvider>
    </SafeAreaProvider>
  );
}