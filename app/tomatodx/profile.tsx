// app/tomatodx/profile.tsx - Profile Screen
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, ImageBackground, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getCurrentUser, upsertUser } from '../../src/db/repository';

export default function ProfileScreen() {
    const router = useRouter();
    const { theme, themeMode, setThemeMode } = useTheme();
    const { t, i18n } = useTranslation();
    const colors = Colors[theme];
    const [notifications, setNotifications] = useState(true);
    const [analytics, setAnalytics] = useState(true);
    const [userName, setUserName] = useState('User');
    const [userNickname, setUserNickname] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editNickname, setEditNickname] = useState('');

    // Enhanced animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const staggerAnim = useRef(new Animated.Value(0)).current;

    // Load user data from database
    useEffect(() => {
        loadUserData();
    }, []);

    // Enhanced animation function
    const startAnimations = useCallback(() => {
        // Reset animation values
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        scaleAnim.setValue(0.95);
        staggerAnim.setValue(0);

        // Staggered entrance animations
        Animated.stagger(100, [
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 60,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 80,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(staggerAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim, scaleAnim, staggerAnim]);

    // Trigger animations on screen focus
    useFocusEffect(
        useCallback(() => {
            startAnimations();
        }, [startAnimations])
    );

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
                    trackColor={{ false: colors.muted, true: colors.primary }}
                />
            ),
        },
        // {
        //     icon: 'analytics',
        //     title: t('profile.analytics'),
        //     component: (
        //         <Switch
        //             value={analytics}
        //             onValueChange={setAnalytics}
        //             trackColor={{ false: colors.muted, true: colors.primary }}
        //         />
        //     ),
        // },
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
        <ImageBackground
  source={require('../../assets/images/screenBg/about.jpg')}
  style={styles.backgroundImage}
  imageStyle={{ resizeMode: 'cover' }}
>
  <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
    

         {/* Header */}
                <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                      <ImageBackground
                        source={require('../../assets/images/screenBg/profile3.jpg')}
                        imageStyle={{ resizeMode: 'cover' }}
                        >
                      {/* Softer overlay only where the content is */}
                      <View
                        style={[styles.headerContent, { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.25)' }]}
                      >
                    <TouchableOpacity
                        style={[styles.avatar, { backgroundColor: `${colors.primary}60` }]}
                        onPress={handleEditProfile}
                    >
                        <Text style={styles.avatarText}>
                            {userName.charAt(0).toUpperCase()}
                            {/* <Ionicons name="person" size={40} color="#fff" /> */}
                        </Text>
                        <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                            <Ionicons name="pencil" size={12} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.userName, { color: '#fff' }]}>
                        {userName}
                    </Text>
                    {userNickname ? (
                        <Text style={[styles.userNickname, { color: '#fff'}]}>
                            @{userNickname}
                        </Text>
                    ) : null}
                    <TouchableOpacity
                        style={[styles.editButton, { backgroundColor: `${colors.successBg}CC` }]}
                        onPress={handleEditProfile}
                    >
                        <Ionicons name="create-outline" size={16} color={colors.primary} />
                        <Text style={[styles.editButtonText, { color: colors.primary }]}>{t('profile.editProfile')}</Text>
                    </TouchableOpacity>
                     </View>
                    </ImageBackground>
                </Animated.View>
            <ScrollView style={[styles.container, { backgroundColor: theme === 'dark' ? `${colors.background}99` : `${colors.background}70` }]}>
               
                {/* Theme Selector */}
                <Animated.View style={[styles.card, { backgroundColor: `${colors.card}BB`, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {t('profile.theme')}
                    </Text>
                    <View style={styles.themeOptions}>
                        {['light', 'dark', 'system'].map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                style={[
                                    styles.themeOption,
                                    { backgroundColor: `${colors.backgroundAlt}FF` },
                                    themeMode === mode && [styles.themeOptionActive, { backgroundColor: `${colors.successBg}BB` }],
                                ]}
                                onPress={() => setThemeMode(mode as any)}
                            >
                                <Ionicons
                                    name={
                                        mode === 'light' ? 'sunny' :
                                            mode === 'dark' ? 'moon' : 'phone-portrait'
                                    }
                                    size={20}
                                    color={themeMode === mode ? colors.primary : colors.textSecondary}
                                />
                                <Text style={[
                                    styles.themeText,
                                    { color: colors.textSecondary },
                                    themeMode === mode && [styles.themeTextActive, { color: colors.primary }]
                                ]}>
                                    {t(`profile.${mode}`)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Settings */}
                <Animated.View style={[styles.card, { backgroundColor: `${colors.card}BB`, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {t('profile.settings')}
                    </Text>
                    {settings.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.settingItem,
                                index < settings.length - 1 && [styles.settingItemBorder, { borderBottomColor: colors.border }],
                            ]}
                            onPress={item.onPress}
                            disabled={!item.onPress}
                        >
                            <View style={styles.settingLeft}>
                                <Ionicons
                                    name={item.icon as any}
                                    size={24}
                                    color={colors.textSecondary}
                                />
                                <Text style={[styles.settingText, { color: colors.text }]}>
                                    {item.title}
                                </Text>
                            </View>
                            <View style={styles.settingRight}>
                                {item.value && (
                                    <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                                        {item.value}
                                    </Text>
                                )}
                                {/* {item.component} */}
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={colors.textTertiary}
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* App Info */}
                <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.appInfo}>
                        {/* <Ionicons name="leaf" size={32} color={colors.primary} /> */}
                        <Text style={[styles.appName, { color: colors.text }]}>
                            TomatoDx
                        </Text>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
                            {t("common.version")} {Constants.expoConfig?.version || '1.0.0'}
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: `${colors.card}` }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {t('profile.editProfile')}
                            </Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>
                                {t('profile.name')}
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: `${colors.backgroundAlt}BB`,
                                        borderColor: colors.border,
                                        color: colors.text
                                    }
                                ]}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder={t('profile.namePlaceholder')}
                                placeholderTextColor={colors.textTertiary}
                            />

                            <Text style={[styles.inputLabel, { color: colors.text }]}>
                                {t('profile.nickname')}
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: `${colors.backgroundAlt}BB`,
                                        borderColor: colors.border,
                                        color: colors.text
                                    }
                                ]}
                                value={editNickname}
                                onChangeText={setEditNickname}
                                placeholder={t('profile.nicknamePlaceholder')}
                                placeholderTextColor={colors.textTertiary}
                            />
                        </View>

                        <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { backgroundColor: `${colors.background}BB` }]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton, { backgroundColor: `${colors.primary}` }]}
                                onPress={handleSaveProfile}
                            >
                                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            </View>
        </ImageBackground>
    
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding:9,
        paddingVertical:16
    },
    headerContent: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.75)', // much lighter
    },
    avatar: {
        width: 80,
        height: 80,
        borderWidth:1,
        borderColor:'#fff',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        opacity:0.75
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '600',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    userNickname: {
        fontSize: 16,
        marginBottom: 12,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
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
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    card: {
        margin: 10,
        marginTop: 0,
        borderRadius: 16,
        padding: 14,
    
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
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
        gap: 8,
    },
    themeOptionActive: {
        borderWidth: 1,
    },
    themeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    themeTextActive: {
        fontWeight: '700',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    settingItemBorder: {
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingValue: {
        fontSize: 14,
    },
    appInfo: {
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems: 'center',
        gap:16
    },
    appName: {
        fontSize: 18,
        fontWeight: '700',
    },
    appVersion: {
        fontSize: 12,

    },
    footer: {
        margin: 20,
        marginTop: 0,
        borderRadius: 16,
        padding: 16,
        marginBottom:40     
    },
    divider: {        
          width:2,
          height:'100%',
     },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
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
        padding: 16,
        paddingBottom:0
        // borderBottomWidth: .5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    modalBody: {
        padding: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        borderWidth: 1,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        // borderTopWidth: 1,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    cancelButtonText: {
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