// screenSetup.ts - Common screen setup utilities
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

// Common hook for screen setup
export const useScreenSetup = () => {
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const tokens = Colors[theme];
    const insets = useSafeAreaInsets();

    return { t, i18n, theme, tokens, insets };
};