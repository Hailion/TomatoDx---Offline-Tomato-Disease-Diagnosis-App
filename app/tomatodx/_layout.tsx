// _layout.tsx
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

const smoothTransition = {
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: {
      animation: 'spring',
      config: { stiffness: 1000, damping: 500, mass: 3, overshootClamping: true, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 },
    },
    close: {
      animation: 'spring',
      config: { stiffness: 1000, damping: 500, mass: 3, overshootClamping: true, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 },
    },
  },
  cardStyleInterpolator: ({ current, next, layouts }: any) => ({
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          }),
        },
        {
          scale: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1],
          }),
        },
      ],
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.3],
      }),
    },
  }),
};

export default function TomatoDxLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{ headerShown: false, ...smoothTransition }}
    >
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

