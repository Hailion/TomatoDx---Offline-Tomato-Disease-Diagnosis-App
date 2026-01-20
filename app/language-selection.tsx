import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    ImageBackground,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';

const { width } = Dimensions.get('window');

const LANGUAGES = [
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸', // Or use an image asset if available
        description: 'Use the app in English'
    },
    {
        code: 'am',
        name: 'Amharic',
        nativeName: 'አማርኛ',
        flag: '🇪🇹',
        description: 'በአማርኛ ይጠቀሙ'
    },
    {
        code: 'oro',
        name: 'Afan Oromo',
        nativeName: 'Afaan Oromoo',
        flag: '🇪🇹', // Region flag or symbol
        description: 'Afaan Oromootiin fayyadamaa'
    }
];

export default function LanguageSelectionScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = Colors[theme];
    const { i18n } = useTranslation();
    const [selectedLang, setSelectedLang] = useState<string | null>(null);

    const handleSelectLanguage = async (langCode: string) => {
        setSelectedLang(langCode);
        // Apply immediately to see effect (optional, maybe wait for confirm)
        await i18n.changeLanguage(langCode);
    };

    const handleContinue = async () => {
        if (!selectedLang) return;

        try {
            await AsyncStorage.setItem('user-language', selectedLang);
            await AsyncStorage.setItem('hasSelectedLanguage', 'true');

            // Navigate to onboarding
            router.replace('/onboarding');
        } catch (error) {
            console.error('Error saving language preference:', error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background */}
            <View style={StyleSheet.absoluteFill}>
                <ImageBackground
                    source={require('../assets/images/background/wellcome_bg.jpg')}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.85)', '#000']}
                    style={StyleSheet.absoluteFillObject}
                />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="language" size={32} color="#fff" />
                    </View>
                    <Text style={styles.title}>Welcome</Text>
                    <Text style={styles.subtitle}>Choose your preferred language</Text>
                    <Text style={styles.subtitleMuted}>ቋንቋ ይምረጡ / Afaan filadhaa</Text>
                </View>

                <View style={styles.languagesContainer}>
                    {LANGUAGES.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.languageCard,
                                selectedLang === lang.code && styles.languageCardActive,
                                { borderColor: selectedLang === lang.code ? colors.primary : 'rgba(255,255,255,0.1)' }
                            ]}
                            onPress={() => handleSelectLanguage(lang.code)}
                            activeOpacity={0.8}
                        >
                            <View style={[
                                styles.flagContainer,
                                selectedLang === lang.code && { backgroundColor: colors.primary + '20' }
                            ]}>
                                <Text style={styles.flag}>{lang.flag}</Text>
                            </View>

                            <View style={styles.textContainer}>
                                <Text style={[
                                    styles.languageName,
                                    selectedLang === lang.code && { color: colors.primary }
                                ]}>
                                    {lang.name}
                                </Text>
                                <Text style={styles.languageNative}>
                                    {lang.nativeName}
                                </Text>
                            </View>

                            <View style={styles.radioContainer}>
                                <View style={[
                                    styles.radioButton,
                                    selectedLang === lang.code && { borderColor: colors.primary }
                                ]}>
                                    {selectedLang === lang.code && (
                                        <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            !selectedLang && styles.continueButtonDisabled
                        ]}
                        onPress={handleContinue}
                        disabled={!selectedLang}
                    >
                        <LinearGradient
                            colors={selectedLang ? [colors.primary, colors.primaryDark] : ['#333', '#222']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={[
                                styles.buttonText,
                                !selectedLang && { color: '#666' }
                            ]}>
                                Continue
                            </Text>
                            <Ionicons
                                name="arrow-forward"
                                size={20}
                                color={selectedLang ? "#fff" : "#666"}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitleMuted: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
    },
    languagesContainer: {
        gap: 16,
    },
    languageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 10,
        borderWidth: 1,
    },
    languageCardActive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    flagContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    flag: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    languageName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    languageNative: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
    },
    radioContainer: {
        marginLeft: 16,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 3,
    },
    radioInner: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    footer: {
        marginTop: 40,
    },
    continueButton: {
        height: 56,
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    continueButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
