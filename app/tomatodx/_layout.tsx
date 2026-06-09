// app/tomatodx/_layout.tsx
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const colors = Colors[theme];

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? `${colors.card}DD` : `${colors.card}`,
          borderTopColor: colors.border,
          marginBottom: 6,
        },
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home.title'),
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: t('history.title'),
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('scan.navtitle'),
          tabBarIcon: ({ size, color, focused }) => (
            <View style={styles.scanIconContainer}>
              <View style={[
                styles.scanIconBackground,
                { backgroundColor: focused ? `${colors.primary}EE` : `${colors.card}`, borderColor: `${colors.border}` }
              ]}>
                <Ionicons
                  name="camera"
                  size={size * 1.4}
                  color={focused ? '#ffffff' : colors.primary}
                />
              </View>
            </View>
          ),
          tabBarButton: (props) => {
            const { style, delayLongPress, disabled, ...restProps } = props;
            const cleanProps: any = {
              ...restProps,
              ...(delayLongPress !== null && delayLongPress !== undefined ? { delayLongPress } : {}),
              ...(disabled !== null && disabled !== undefined ? { disabled: !!disabled } : {}),
            };
            return (
              <TouchableOpacity
                {...cleanProps}
                style={[style, styles.scanTabButton]}
                activeOpacity={0.7}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title'),
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="preview"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: t('help.navtitle'),
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="help-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          href: null,
        }}
      />
    </Tabs>

  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scanIconContainer: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanIconBackground: {
    width: 60,
    height: 58,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderLeftWidth: .3,
    borderRightWidth: .3,
    borderBottomWidth: .1,
  },
  scanTabButton: {
    top: 5,
  },
});
