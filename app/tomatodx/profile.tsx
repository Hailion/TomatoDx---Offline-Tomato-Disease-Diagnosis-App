// app/tomatodx/profile.tsx - Profile Screen
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function ProfileScreen() {
    const router = useRouter();
    const { theme, themeMode, setThemeMode } = useTheme();
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState(true);
    const [analytics, setAnalytics] = useState(true);

    const settings = [
        {
            icon: 'language',
            title: t('profile.language'),
            value: i18n.language === 'en' ? 'English' : 'Amharic',
            onPress: () => i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en'),
        },
        {
            icon: 'notifications',
            title: t('profile.notifications'),
            component: (
                <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: '#767577', true: '#10b981' }}
                />
            ),
        },
        {
            icon: 'analytics',
            title: t('profile.analytics'),
            component: (
                <Switch
                    value={analytics}
                    onValueChange={setAnalytics}
                    trackColor={{ false: '#767577', true: '#10b981' }}
                />
            ),
        },
        {
            icon: 'help-circle',
            title: t('profile.help'),
            onPress: () => router.push('/tomatodx/help'),
        },
        {
            icon: 'information-circle',
            title: t('profile.about'),
            onPress: () => router.push('/tomatodx/about'),
        },
    ];

    return (
        <ScrollView style={[styles.container, theme === 'dark' && styles.darkContainer]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>U</Text>
                </View>
                <Text style={[styles.userName, theme === 'dark' && styles.darkText]}>
                    User
                </Text>
                <Text style={[styles.userEmail, theme === 'dark' && styles.darkSubtext]}>
                    user@example.com
                </Text>
            </View>

            {/* Theme Selector */}
            <View style={[styles.card, theme === 'dark' && styles.darkCard]}>
                <Text style={[styles.cardTitle, theme === 'dark' && styles.darkText]}>
                    {t('profile.theme')}
                </Text>
                <View style={styles.themeOptions}>
                    {['light', 'dark', 'system'].map((mode) => (
                        <TouchableOpacity
                            key={mode}
                            style={[
                                styles.themeOption,
                                themeMode === mode && styles.themeOptionActive,
                            ]}
                            onPress={() => setThemeMode(mode as any)}
                        >
                            <Ionicons
                                name={
                                    mode === 'light' ? 'sunny' :
                                        mode === 'dark' ? 'moon' : 'phone-portrait'
                                }
                                size={20}
                                color={themeMode === mode ? '#10b981' : '#666'}
                            />
                            <Text style={[
                                styles.themeText,
                                theme === 'dark' && styles.darkText,
                                themeMode === mode && styles.themeTextActive
                            ]}>
                                {t(`profile.${mode}`)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Settings */}
            <View style={[styles.card, theme === 'dark' && styles.darkCard]}>
                <Text style={[styles.cardTitle, theme === 'dark' && styles.darkText]}>
                    {t('profile.settings')}
                </Text>
                {settings.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.settingItem,
                            index < settings.length - 1 && styles.settingItemBorder,
                        ]}
                        onPress={item.onPress}
                        disabled={!item.onPress}
                    >
                        <View style={styles.settingLeft}>
                            <Ionicons
                                name={item.icon as any}
                                size={24}
                                color={theme === 'dark' ? '#999' : '#666'}
                            />
                            <Text style={[styles.settingText, theme === 'dark' && styles.darkText]}>
                                {item.title}
                            </Text>
                        </View>
                        <View style={styles.settingRight}>
                            {item.value && (
                                <Text style={[styles.settingValue, theme === 'dark' && styles.darkSubtext]}>
                                    {item.value}
                                </Text>
                            )}
                            {item.component}
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={theme === 'dark' ? '#666' : '#999'}
                            />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* App Info */}
            <View style={[styles.card, theme === 'dark' && styles.darkCard]}>
                <View style={styles.appInfo}>
                    <Ionicons name="leaf" size={32} color="#10b981" />
                    <Text style={[styles.appName, theme === 'dark' && styles.darkText]}>
                        TomatoDx
                    </Text>
                    <Text style={[styles.appVersion, theme === 'dark' && styles.darkSubtext]}>
                        Version 1.0.0
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    darkContainer: {
        backgroundColor: '#000',
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '600',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 0,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    darkCard: {
        backgroundColor: '#1a1a1a',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    themeOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    themeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        gap: 8,
    },
    themeOptionActive: {
        backgroundColor: '#dcfce7',
        borderColor: '#10b981',
        borderWidth: 1,
    },
    themeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    themeTextActive: {
        color: '#10b981',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    settingItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 16,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingValue: {
        fontSize: 14,
        color: '#666',
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    appName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginTop: 12,
        marginBottom: 4,
    },
    appVersion: {
        fontSize: 14,
        color: '#666',
    },
});