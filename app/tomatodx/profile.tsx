// app/tomatodx/profile.tsx - Profile Screen
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getCurrentUser, upsertUser } from '../../src/db/repository';

export default function ProfileScreen() {
    const router = useRouter();
    const { theme, themeMode, setThemeMode } = useTheme();
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState(true);
    const [analytics, setAnalytics] = useState(true);
    const [userName, setUserName] = useState('User');
    const [userNickname, setUserNickname] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editNickname, setEditNickname] = useState('');

    // Load user data from database
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = () => {
        try {
            const user = getCurrentUser();
            if (user) {
                setUserName(user.name || 'User');
                setUserNickname(user.nickname || '');
            } else {
                // Create default user
                upsertUser('device', 'User', '');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const handleEditProfile = () => {
        setEditName(userName);
        setEditNickname(userNickname);
        setEditModalVisible(true);
    };

    const handleSaveProfile = () => {
        try {
            if (!editName.trim()) {
                Alert.alert(t('profile.error'), t('profile.nameRequired'));
                return;
            }

            upsertUser('device', editName.trim(), editNickname.trim());
            setUserName(editName.trim());
            setUserNickname(editNickname.trim());
            setEditModalVisible(false);
            Alert.alert(t('profile.success'), t('profile.profileUpdated'));
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert(t('profile.error'), t('profile.saveFailed'));
        }
    };

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
        <>
            <ScrollView style={[styles.container, theme === 'dark' && styles.darkContainer]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.avatar}
                        onPress={handleEditProfile}
                    >
                        <Text style={styles.avatarText}>
                            {userName.charAt(0).toUpperCase()}
                        </Text>
                        <View style={styles.editBadge}>
                            <Ionicons name="pencil" size={12} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.userName, theme === 'dark' && styles.darkText]}>
                        {userName}
                    </Text>
                    {userNickname ? (
                        <Text style={[styles.userNickname, theme === 'dark' && styles.darkSubtext]}>
                            @{userNickname}
                        </Text>
                    ) : null}
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleEditProfile}
                    >
                        <Ionicons name="create-outline" size={16} color="#10b981" />
                        <Text style={styles.editButtonText}>{t('profile.editProfile')}</Text>
                    </TouchableOpacity>
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

            {/* Edit Profile Modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, theme === 'dark' && styles.darkCard]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, theme === 'dark' && styles.darkText]}>
                                {t('profile.editProfile')}
                            </Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme === 'dark' ? '#fff' : '#666'} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={[styles.inputLabel, theme === 'dark' && styles.darkText]}>
                                {t('profile.name')}
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    theme === 'dark' && styles.darkInput,
                                    theme === 'dark' && { color: '#fff' }
                                ]}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder={t('profile.namePlaceholder')}
                                placeholderTextColor={theme === 'dark' ? '#666' : '#999'}
                            />

                            <Text style={[styles.inputLabel, theme === 'dark' && styles.darkText]}>
                                {t('profile.nickname')}
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    theme === 'dark' && styles.darkInput,
                                    theme === 'dark' && { color: '#fff' }
                                ]}
                                value={editNickname}
                                onChangeText={setEditNickname}
                                placeholder={t('profile.nicknamePlaceholder')}
                                placeholderTextColor={theme === 'dark' ? '#666' : '#999'}
                            />
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveProfile}
                            >
                                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
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
    userNickname: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#10b981',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#dcfce7',
    },
    editButtonText: {
        color: '#10b981',
        fontSize: 14,
        fontWeight: '600',
    },
    darkText: {
        color: '#fff',
    },
    darkSubtext: {
        color: '#999',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    modalBody: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    darkInput: {
        backgroundColor: '#2d2d2d',
        borderColor: '#333',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#10b981',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});