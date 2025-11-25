// app/admin.tsx - Enhanced Admin Panel with Modern UI
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DiseaseEditor from '../src/components/DiseaseEditor';
import { useTheme } from '../src/contexts/ThemeContext';
import { changeAdminPassword, getAnalyticsSummary, getLast7DaysCounts, upsertModelMeta, validateAdminPassword } from '../src/db/repository';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types for better organization
type IoniconName = keyof typeof Ionicons.glyphMap;

interface AdminSection {
    id: string;
    title: string;
    icon: IoniconName;
    color: string;
    items: AdminItem[];
}

interface AdminItem {
    id: string;
    title: string;
    description: string;
    icon: IoniconName;
    iconColor: string;
    action: () => void;
    type?: 'primary' | 'warning' | 'danger' | 'success';
    showChevron?: boolean;
}

export default function AdminScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const colors = Colors[theme];
    
    // Authentication State
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    // Modal States
    const [visibleUpdate, setVisibleUpdate] = useState(false);
    const [visibleEdit, setVisibleEdit] = useState(false);
    const [visibleReset, setVisibleReset] = useState(false);
    const [visibleChangePassword, setVisibleChangePassword] = useState(false);
    
    // Operation States
    const [isUploading, setIsUploading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

   // Password Change State
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [isChangingPassword, setIsChangingPassword] = useState(false);
const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
const [isPasswordChanged, setIsPasswordChanged] = useState(false);

    // Analytics State
    const [analyticsSummary, setAnalyticsSummary] = useState<ReturnType<typeof getAnalyticsSummary> | null>(null);
    const [last7DaysCounts, setLast7DaysCounts] = useState<ReturnType<typeof getLast7DaysCounts>>([]);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

    /**
     * Load analytics data with proper error handling
     */
    const loadAnalytics = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setIsRefreshing(true);
            } else {
                setIsAnalyticsLoading(true);
            }

            const [summary, last7] = await Promise.all([
                getAnalyticsSummary(),
                getLast7DaysCounts()
            ]);

            setAnalyticsSummary(summary);
            setLast7DaysCounts(last7);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setIsAnalyticsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    /**
     * Handle password verification for admin access
     */
    const handleVerifyPassword = async () => {
        if (!password.trim()) {
            setAuthError(t('admin.auth.errorRequired'));
            return;
        }

        setIsVerifying(true);
        try {
            const isValid = validateAdminPassword(password.trim());
            if (isValid) {
                await AsyncStorage.setItem('adminUnlocked', 'true');
                setIsAuthorized(true);
                setAuthError(null);
                setPassword('');
            } else {
                setAuthError(t('admin.auth.errorIncorrect'));
            }
        } catch (error) {
            console.error('Error validating admin password:', error);
            setAuthError(t('admin.auth.verifyError'));
        } finally {
            setIsVerifying(false);
        }
    };

    /**
     * Handle admin password change
     */
    const handleSubmitChangePassword = () => {
        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setChangePasswordError(t('admin.password.errorAllRequired'));
            return;
        }

                
        if (newPassword.trim().length < 8) {
            // If you add a key like admin.password.errorTooShort use that, otherwise fallback text:
            setChangePasswordError(
            t('admin.password.errorTooShort', 'Password must be at least 8 characters long.')
            );
            return;
        }


        if (newPassword !== confirmPassword) {
            setChangePasswordError(t('admin.password.errorMismatch'));
            return;
        }

        setIsChangingPassword(true);
        try {
            const success = changeAdminPassword(currentPassword.trim(), newPassword.trim());
            if (!success) {
                setChangePasswordError(t('admin.password.errorCurrentIncorrect'));
                return;
            }

            setIsPasswordChanged(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing admin password:', error);
            setChangePasswordError(t('admin.password.updateError'));
        } finally {
            setIsChangingPassword(false);
        }
    };

    /**
     * Handle admin lock and navigation
     */
    const handleLockAdmin = async () => {
        setIsAuthorized(false);
        router.back();
    };

    /**
     * Handle model file upload and processing
     */
    const handleModelUpload = async () => {
        setIsUploading(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', '*/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                setIsUploading(false);
                return;
            }

            const file = result.assets[0];
            if (!file) {
                setIsUploading(false);
                return;
            }

            if (file.name?.includes('model.json') || file.name?.includes('metadata.json')) {
                const fileContent = await FileSystem.readAsStringAsync(file.uri);
                const metadata = JSON.parse(fileContent);
                const version = metadata?.modelVersion || `v${Date.now()}`;
                const exportedAt = metadata?.exportedAt || new Date().toISOString();
                const classes = metadata?.labels || metadata?.classes || [];

                upsertModelMeta(version, exportedAt, classes);

                // Success state is communicated via the admin update modal copy
                setVisibleUpdate(false);
            } else {
                // Non-metadata files: keep modal open and rely on static description text
            }
        } catch (error) {
            console.error('Error uploading model:', error);
        } finally {
            setIsUploading(false);
        }
    };

    // Load analytics when authorized
    useEffect(() => {
        if (isAuthorized) {
            loadAnalytics();
            
        }
    }, [isAuthorized, loadAnalytics]);

    // Admin sections configuration for better organization
    const adminSections: AdminSection[] = [
        // {
        //     id: 'model',
        //     title: t('admin.modelManagement.title'),
        //     icon: 'cloud-upload',
        //     color: colors.primary,
        //     items: [
        //         {
        //             id: 'update-model',
        //             title: t('admin.modelManagement.updateModel.title'),
        //             description: t('admin.modelManagement.updateInstructions'),
        //             icon: 'cloud-upload',
        //             iconColor: colors.primary,
        //             action: () => setVisibleUpdate(true),
        //             type: 'primary',
        //             showChevron: true
        //         }
        //     ]
        // },
        {
            id: 'database',
            title: t('admin.databaseManagement.title'),
            icon: 'server',
            color: colors.primary,
            items: [
                {
                    id: 'edit-disease',
                    title: t('admin.databaseManagement.edit.editDisease'),
                    description: t('admin.databaseManagement.edit.editDiseaseDesc'),
                    icon: 'create',
                    iconColor: colors.primary,
                    action: () => setVisibleEdit(true),
                    type: 'primary',
                    showChevron: true
                }
            ]
        },
        {
            id: 'analytics',
            title: t('admin.analytics.title'),
            icon: 'stats-chart',
            color: colors.success,
            items: [
                {
                    id: 'view-analytics',
                    title: t('admin.analytics.summaryTitle', { count: analyticsSummary?.total ?? 0 }),
                    description: analyticsSummary ? 
                        `${t('admin.analytics.avgConfidence', { value: (analyticsSummary.avgConfidence ?? 0).toFixed(2) })} • ${t('admin.analytics.healthyCount', { count: analyticsSummary.healthyCount })}` :
                        t('admin.analytics.loading'),
                    icon: 'stats-chart',
                    iconColor: colors.success,
                    action: () => router.push('/admin-info'),
                    type: 'success',
                    showChevron: true
                }
            ]
        },
        {
            id: 'security',
            title: t('admin.auth.title'),
            icon: 'shield-checkmark',
            color: colors.warning,
            items: [
                {
                    id: 'change-password',
                    title: t('admin.password.changeTitle'),
                    description: t('admin.password.changeDescription'),
                    icon: 'key',
                    iconColor: colors.warning,
                    action: () => {
                        setChangePasswordError(null);
                        setIsPasswordChanged(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setVisibleChangePassword(true);
                    },
                    type: 'warning',
                    showChevron: true
                },
                {
                    id: 'lock-admin',
                    title: t('admin.system.lockAdmin.title'),
                    description: t('admin.system.lockAdmin.description'),
                    icon: 'lock-closed',
                    iconColor: '#FF3B30',
                    action: () => setVisibleReset(true),
                    type: 'danger',
                    showChevron: true
                }
            ]
        }
    ];

    // Render authentication screen
    if (!isAuthorized) {
        return (
            <ImageBackground
     source={require('../assets/images/screenBg/admin.jpg')}  
    style={styles.backgroundImage}
    imageStyle={{ resizeMode: 'cover' }}
  >
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
      
            <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: `${colors.background}80` }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => router.back()}
                        accessibilityLabel={t('common.back')}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>{t('admin.title')}</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Authentication Card */}
                <View style={styles.authContainer}>
                    <View style={[styles.authCard, { backgroundColor: `${colors.card}CC` }]}>
                        <View style={[styles.authIconContainer, { backgroundColor: colors.primaryOverlay }]}>
                            <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
                        </View>
                        
                        <Text style={[styles.authTitle, { color: colors.text }]}>
                            {t('admin.auth.title')}
                        </Text>
                        
                        <Text style={[styles.authSubtitle, { color: colors.textSecondary }]}>
                            {t('admin.auth.subtitle')}
                        </Text>

                        <View style={styles.inputContainer}>
                            <View
                                style={[
                                    styles.passwordInputWrapper,
                                    {
                                        borderColor: authError ? '#FF3B30' : colors.border,
                                        backgroundColor: colors.background,
                                    },
                                ]}
                            >
                                <TextInput
                                    style={[
                                        styles.passwordInput,
                                        {
                                            color: colors.text,
                                        },
                                    ]}
                                    secureTextEntry={!showPassword}
                                    placeholder={t('admin.auth.passwordPlaceholder')}
                                    placeholderTextColor={colors.textTertiary}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (authError) setAuthError(null);
                                    }}
                                    onSubmitEditing={handleVerifyPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowPassword((prev) => !prev)}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={colors.textTertiary}
                                    />
                                </TouchableOpacity>
                            </View>
                            
                            {authError && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="warning" size={16} color="#FF3B30" />
                                    <Text style={styles.errorText}>{authError}</Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.authButton,
                                { 
                                    backgroundColor: isVerifying ? colors.textTertiary : colors.primary,
                                    opacity: isVerifying ? 0.7 : 1
                                }
                            ]}
                            onPress={handleVerifyPassword}
                            disabled={isVerifying}
                        >
                            {isVerifying ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="lock-open" size={20} color="#fff" />
                                    <Text style={styles.authButtonText}>{t('admin.auth.unlockButton')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
            </View>
            </ImageBackground>
        );
    }

    // Render main admin panel
    return (
        <ImageBackground
    source={require('../assets/images/screenBg/admin.jpg')}   
    style={styles.backgroundImage}
    imageStyle={{ resizeMode: 'cover' }}
  >
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
      
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? `${colors.background}99` : `${colors.background}60` }]}>
            {/* Header */}
            <View style={[styles.header]}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                    accessibilityLabel={t('common.back')}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>{t('admin.title')}</Text>
                    <Text style={[styles.subtitle, { color: theme === 'dark' ? colors.textSecondary : colors.text }]}>
                        {t('admin.system.systemAdministration')}
                    </Text>
                </View>
                
                <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={() => loadAnalytics(true)}
                    disabled={isRefreshing}
                >
                    <Ionicons 
                        name="refresh" 
                        size={20} 
                        color={isRefreshing ? colors.textTertiary : colors.primary} 
                    />
                </TouchableOpacity>
            </View>

            {/* Warning Banner */}
            <View style={[styles.warningBanner, { backgroundColor: `${colors.warning}BB` }]}>
                <Ionicons name="warning" size={20} color="#fff" />
                <Text style={styles.warningText}>{t('admin.caution')}</Text>
            </View>

            {/* Main Content */}
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => loadAnalytics(true)}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Admin Sections */}
                {adminSections.map((section) => (
                    <View key={section.id} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
                                <Ionicons name={section.icon} size={18} color={section.color} />
                            </View>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {section.title}
                            </Text>
                        </View>
                        
                        <View style={styles.sectionContent}>
                            {section.items.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.actionCard,
                                        { backgroundColor: `${colors.card}BB` }
                                    ]}
                                    onPress={item.action}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.actionIcon,
                                        { backgroundColor: item.iconColor + '15' }
                                    ]}>
                                        <Ionicons 
                                            name={item.icon} 
                                            size={22} 
                                            color={item.iconColor} 
                                        />
                                    </View>
                                    
                                    <View style={styles.actionContent}>
                                        <Text style={[
                                            styles.actionTitle, 
                                            { color: colors.text }
                                        ]}>
                                            {item.title}
                                        </Text>
                                        <Text style={[
                                            styles.actionDesc, 
                                            { color: colors.textSecondary }
                                        ]}>
                                            {item.description}
                                        </Text>
                                    </View>
                                    
                                    {item.showChevron && (
                                        <Ionicons 
                                            name="chevron-forward" 
                                            size={20} 
                                            color={colors.textTertiary} 
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* 7-Day Analytics Summary */}
                {last7DaysCounts.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: colors.success + '50' }]}>
                                <Ionicons name="calendar" size={18} color={colors.success} />
                            </View>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {t('admin.recentActivity')}
                            </Text>
                        </View>
                        
                        <View style={[styles.trendCard, { backgroundColor: `${colors.card}BB` }]}>
                            <View style={styles.trendGrid}>
                                {last7DaysCounts.slice(0, 7).map((item, index) => (
                                    <View key={item.day} style={styles.trendItem}>
                                        <Text style={[styles.trendDay, { color: colors.textSecondary }]}>
                                            {item.day.slice(0, 3)}
                                        </Text>
                                        <View style={[
                                            styles.trendBar,
                                            { backgroundColor: colors.primary + '40' }
                                        ]}>
                                            <View 
                                                style={[
                                                    styles.trendBarFill,
                                                    { 
                                                        backgroundColor: colors.primary,
                                                        height: `${Math.min(100, (item.count / Math.max(...last7DaysCounts.map(d => d.count))) * 100)}%`
                                                    }
                                                ]} 
                                            />
                                        </View>
                                        <Text style={[styles.trendCount, { color: colors.text }]}>
                                            {item.count}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Information Card */}
                <View style={[styles.infoCard]}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                        {t('admin.info')}
                    </Text>
                </View>
            </ScrollView>

            {/* Modals */}
            {/* <AdminModal
                visible={visibleUpdate}
                onClose={() => setVisibleUpdate(false)}
                icon="cloud-upload"
                title={t('admin.modelManagement.updateModel.uploadModel')}
                message={
                    isUploading
                        ? t('admin.modelManagement.updateModel.updating')
                        : t('admin.modelManagement.updateModel.uploadModelDesc')
                }
                buttons={[
                    {
                        label: isUploading ? t('common.loading') : t('common.ok'),
                        onPress: () => !isUploading && setVisibleUpdate(false),
                        style: 'cancel',
                    },
                ]}
            >
                {!isUploading && (
                    <TouchableOpacity
                        style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                        onPress={handleModelUpload}
                    >
                        <Ionicons name="document" size={20} color="#fff" />
                        <Text style={styles.uploadButtonText}>{t('admin.modelManagement.updateModel.selectModelFile')}</Text>
                    </TouchableOpacity>
                )}
            </AdminModal> */}

            {/* <AdminModal
                visible={visibleReset}
                onClose={() => setVisibleReset(false)}
                icon="lock-closed"
                title={t('admin.system.lockAdmin.resetAdminAccess')}
                message={t('admin.system.lockAdmin.resetQuestion')}
                buttons={[
                    {
                        label: t('common.cancel'),
                        onPress: () => setVisibleReset(false),
                        style: 'cancel',
                    },
                    {
                        label: t('common.confirm'),
                        onPress: handleLockAdmin,
                        style: 'danger',
                    },
                ]}
            /> */}

            <Modal
                visible={visibleChangePassword}
                transparent
                animationType="fade"
                onRequestClose={() => setVisibleChangePassword(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    enabled
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={[styles.modalIcon, { backgroundColor: colors.background + '80' }]}>
                            <Ionicons name="key" size={40} color={colors.primary} />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {t('admin.password.changeTitle')}
                        </Text>
                        <Text style={[styles.modalMessage,   { color: changePasswordError ? '#FF3B30' : (isPasswordChanged ? colors.success : colors.textSecondary) },]}>
                           {changePasswordError
                            ? changePasswordError
                            : isPasswordChanged
                            ? t('admin.password.changeSuccess')
                            : t('admin.password.changeMessage')}
                        </Text>

                        <ScrollView
                            contentContainerStyle={styles.changePasswordContainer}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Current password */}
                            <View
                                style={[
                                    styles.passwordInputWrapper,
                                    {
                                        borderColor: changePasswordError ? '#FF3B30' : colors.border,
                                        backgroundColor: colors.background,
                                    },
                                ]}
                            >
                                <TextInput
                                    style={[
                                        styles.changePasswordInput,
                                        { color: colors.text },
                                    ]}
                                    secureTextEntry={!showCurrentPassword}
                                    placeholder={t('admin.password.currentPlaceholder')}
                                    placeholderTextColor={colors.textTertiary}
                                    value={currentPassword}
                                    onChangeText={(text) => {
                                        setCurrentPassword(text);
                                        if (changePasswordError) setChangePasswordError(null);
                                        if (isPasswordChanged) setIsPasswordChanged(false);
                                    }}
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowCurrentPassword((prev) => !prev)}
                                >
                                    <Ionicons
                                        name={showCurrentPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={colors.textTertiary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* New password */}
                            <View
                                style={[
                                    styles.passwordInputWrapper,
                                    {
                                        borderColor: changePasswordError ? '#FF3B30' : colors.border,
                                        backgroundColor: colors.background,
                                    },
                                ]}
                            >
                                <TextInput
                                    style={[
                                        styles.changePasswordInput,
                                        { color: colors.text },
                                    ]}
                                    secureTextEntry={!showNewPassword}
                                    placeholder={t('admin.password.newPlaceholder')}
                                    placeholderTextColor={colors.textTertiary}
                                    value={newPassword}
                                    onChangeText={(text) => {
                                        setNewPassword(text);
                                        if (changePasswordError) setChangePasswordError(null);
                                        if (isPasswordChanged) setIsPasswordChanged(false);
                                    }}
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowNewPassword((prev) => !prev)}
                                >
                                    <Ionicons
                                        name={showNewPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={colors.textTertiary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Confirm password */}
                            <View
                                style={[
                                    styles.passwordInputWrapper,
                                    {
                                        borderColor: changePasswordError ? '#FF3B30' : colors.border,
                                        backgroundColor: colors.background,
                                    },
                                ]}
                            >
                                <TextInput
                                    style={[
                                        styles.changePasswordInput,
                                        { color: colors.text },
                                    ]}
                                    secureTextEntry={!showConfirmPassword}
                                    placeholder={t('admin.password.confirmPlaceholder')}
                                    placeholderTextColor={colors.textTertiary}
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        if (changePasswordError) setChangePasswordError(null);
                                        if (isPasswordChanged) setIsPasswordChanged(false);
                                    }}
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={colors.textTertiary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    { backgroundColor: colors.background },
                                    styles.modalButtonSingle,
                                ]}
                                onPress={() => setVisibleChangePassword(false)}
                            >
                                <Text
                                    style={[
                                        styles.modalButtonText,
                                        { color: colors.text },
                                    ]}
                                >
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    { backgroundColor: colors.primary },
                                    styles.modalButtonSingle,
                                ]}
                                onPress={() => {
                                    if (isPasswordChanged) {
                                        setVisibleChangePassword(false);
                                        return;
                                    }
                                    if (!isChangingPassword) {
                                        handleSubmitChangePassword();
                                    }
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalButtonText,
                                        { color: '#fff' },
                                    ]}
                                >
                                    {isChangingPassword
                                        ? t('common.loading')
                                        : isPasswordChanged
                                        ? t('common.ok')
                                        : t('common.confirm')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <DiseaseEditor visible={visibleEdit} onClose={() => setVisibleEdit(false)} />
        </View>
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
  },
    // Header Styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        marginBottom: 10,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: { 
        fontSize: 20, 
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
        opacity: 0.7,
    },
    backButton: { 
        padding: 8,
        borderRadius: 10,
    },
    refreshButton: {
        padding: 8,
        borderRadius: 10,
    },
    placeholder: { 
        width: 40 
    },
    
    // Authentication Styles
    authContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 40
    },
    authCard: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
       
    },
    authIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    authTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    authSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
        opacity: 0.8,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 16,
    },
    passwordInputWrapper: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 4,
        paddingVertical: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    passwordToggle: {
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    errorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        gap: 6,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: '500',
    },
    authButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        gap: 8,
    },
    authButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    
    // Main Content Styles
    scrollView: { 
        flex: 1 
    },
    scrollContent: {
        paddingVertical: 16,
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        gap: 10,
    },
    warningText: { 
        color: '#fff', 
        fontSize: 14, 
        fontWeight: '600' 
    },
    
    // Section Styles
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
        gap: 10,
    },
    sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    sectionContent: {
        paddingHorizontal: 20,
        gap: 8,
    },

    
    // Action Card Styles
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    actionContent: { 
        flex: 1 
    },
    actionTitle: { 
        fontSize: 16, 
        fontWeight: '600', 
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    actionDesc: { 
        fontSize: 13, 
        lineHeight: 18,
        opacity: 0.8,
    },
    
    // Trend Card Styles
    trendCard: {
        padding: 16,
        borderRadius: 16,
        marginHorizontal: 20,
    },
    trendGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    trendItem: {
        alignItems: 'center',
        flex: 1,
        gap: 6,
    },
    trendDay: {
        fontSize: 11,
        fontWeight: '600',
        opacity: 0.7,
    },
    trendBar: {
        width: 20,
        height: 40,
        borderRadius: 10,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    trendBarFill: {
        width: '100%',
        borderRadius: 10,
        minHeight: 4,
    },
    trendCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    
    // Info Card Styles
    infoCard: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        gap: 12,
    },
    infoText: { 
        flex: 1, 
        fontSize: 13, 
        lineHeight: 18,
           },
    
    // Modal Content Styles
    changePasswordContainer: {
        width: '100%',
        marginTop: 8,
        gap: 12,
    },
    changePasswordInput: {
        flex: 1,
        paddingHorizontal: 4,
        paddingVertical: 10,
        fontSize: 15,
        fontWeight: '500',
        },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 16,
        gap: 8,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    // change password modal styles
     modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60, 
        paddingBottom: 0,
    },
    modalContent: {
        borderRadius: 20,
        padding: 16,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalIcon: {
        marginBottom: 10,
        width: 60,
        height: 60,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginTop: 16,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonSingle: {
        flex: 1.3,
    },
    modalButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});