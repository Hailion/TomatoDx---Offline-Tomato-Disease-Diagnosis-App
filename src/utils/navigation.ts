import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

/**
 * Shared navigation utility with haptic feedback and smooth transitions
 */
export const NavigationUtils = {
  /**
   * Navigate to a route with haptic feedback
   */
  push: (route: string, params?: Record<string, string>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (params) {
      // Encode params properly for expo-router
      const encodedParams: Record<string, string> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          encodedParams[key] = encodeURIComponent(value);
        }
      });
      router.push({ pathname: route, params: encodedParams } as any);
    } else {
      router.push(route as any);
    }
  },

  /**
   * Navigate back with haptic feedback
   */
  back: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback to home if can't go back
      router.replace('/tomatodx');
    }
  },

  /**
   * Replace current route (useful for preventing back navigation)
   */
  replace: (route: string, params?: Record<string, string>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (params) {
      const encodedParams: Record<string, string> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          encodedParams[key] = encodeURIComponent(value);
        }
      });
      router.replace({ pathname: route, params: encodedParams } as any);
    } else {
      router.replace(route as any);
    }
  },

  /**
   * Navigate with success haptic (for important actions)
   */
  pushWithSuccess: (route: string, params?: Record<string, string>) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (params) {
      const encodedParams: Record<string, string> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          encodedParams[key] = encodeURIComponent(value);
        }
      });
      router.push({ pathname: route, params: encodedParams } as any);
    } else {
      router.push(route as any);
    }
  },
};

