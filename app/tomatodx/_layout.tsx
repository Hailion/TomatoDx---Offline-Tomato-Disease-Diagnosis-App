// _layout.tsx
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TomatoDxLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="capture" options={{ title: t('capture.title') }} />
      <Stack.Screen name="result" options={{ title: t('result.title') }} />
      <Stack.Screen name="preview" options={{ title: t('preview.title') }} />
      <Stack.Screen name="history" options={{ title: t('history.title') }} />
      <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
      <Stack.Screen name="admin" options={{ title: t('admin.title') }} />
    </Stack>
  );
}

