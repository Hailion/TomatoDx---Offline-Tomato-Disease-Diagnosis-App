// _layout.tsx
import { Stack } from 'expo-router';

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
  return (
    <Stack 
    // screenOptions={{ headerShown: false, ...smoothTransition }}
    >
      <Stack.Screen name="index" options={{ headerShown: false , title: 'Home' }} />
      <Stack.Screen name="capture" options={{  title:"Capture" }}/>
      <Stack.Screen name="result" options={{ title:"Result" }}/>
      <Stack.Screen name="preview" options={{ title:"Preview" }}/>
      <Stack.Screen name="history" options={{ title:"History" }}/>
      <Stack.Screen name="settings" options={{ title:"Settings" }}/>
      <Stack.Screen name="admin" options={{ title:"Admin" }}/>
    </Stack>
  );
}

