// app/admin.tsx - Admin Panel
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AdminModal from '../src/components/AdminModal';
import DiseaseEditor from '../src/components/DiseaseEditor';
import { useTheme } from '../src/contexts/ThemeContext';
import { getAnalyticsSummary, getLast7DaysCounts, upsertModelMeta } from '../src/db/repository';

export default function AdminScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleUpdate, setVisibleUpdate] = useState(false);
    const [visibleEdit, setVisibleEdit] = useState(false);
    const [visibleReset, setVisibleReset] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [analyticsSummary, setAnalyticsSummary] =
  useState<ReturnType<typeof getAnalyticsSummary> | null>(null);
const [last7DaysCounts, setLast7DaysCounts] =
  useState<ReturnType<typeof getLast7DaysCounts>>([]);
const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

    const checkAuthorization = useCallback(async () => {
        try {
            const adminUnlocked = await AsyncStorage.getItem('adminUnlocked');
            if (adminUnlocked === 'true') {
                setIsAuthorized(true);
            } else {
                Alert.alert(
                    'Unauthorized',
                    'You do not have access to this page.',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            }
        } catch (error) {
            console.error('Error checking authorization:', error);
            router.back();
        } finally {
            setIsLoading(false);
        }
    }, [router]);
    const loadAnalytics = useCallback(() => {
  try {
    setIsAnalyticsLoading(true);
    const summary = getAnalyticsSummary();
    const last7 = getLast7DaysCounts();
    setAnalyticsSummary(summary);
    setLast7DaysCounts(last7);
  } catch (error) {
    console.error('Error loading analytics:', error);
  } finally {
    setIsAnalyticsLoading(false);
  }
}, []);

useEffect(() => {
  if (isAuthorized) {
    loadAnalytics();
  }
}, [isAuthorized, loadAnalytics]);
    useEffect(() => {
        checkAuthorization();
    }, [checkAuthorization]);

    const handleUploadModel = async () => {
        try {
            setIsUploading(true);
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

            // Check if it's a model.json file or related model file
            if (file.name?.includes('model.json') || file.name?.includes('metadata.json')) {
                // Read the file content
                const fileContent = await FileSystem.readAsStringAsync(file.uri);
                
                try {
                    const metadata = JSON.parse(fileContent);
                    const version = metadata?.modelVersion || `v${Date.now()}`;
                    const exportedAt = metadata?.exportedAt || new Date().toISOString();
                    const classes = metadata?.labels || metadata?.classes || [];

                    // Update model metadata in database
                    upsertModelMeta(version, exportedAt, classes);

                    setIsUploading(false);
                    Alert.alert(
                        'Success',
                        `Model metadata updated successfully!\nVersion: ${version}\nClasses: ${classes.length}`,
                        [{ text: 'OK', onPress: () => setVisibleUpdate(false) }]
                    );
                } catch {
                    setIsUploading(false);
                    Alert.alert('Error', 'Failed to parse model file. Please ensure it is a valid JSON file.');
                }
            } else {
                setIsUploading(false);
                Alert.alert(
                    'Info',
                    'Model file selected. For full model update, you would need to replace the model files in the assets folder. This feature updates model metadata only.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error: any) {
            console.error('Error uploading model:', error);
            setIsUploading(false);
            Alert.alert('Error', `Failed to upload model: ${error.message || 'Unknown error'}`);
        }
    };

    const handleEditDatabase = () => {
        setVisibleEdit(true);
    };

    const handleResetAdmin = async () => {
        setVisibleReset(true);
    };

    const handleLockAdmin = async () => {
        await AsyncStorage.removeItem('adminUnlocked');
        Alert.alert('Admin Locked', 'Admin mode has been locked.');
        router.back();
    };
    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>{t('admin.title')}</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={[styles.warningBanner, { backgroundColor: colors.warning }]}>
                    <Ionicons name="warning" size={24} color="#fff" />
                    <Text style={styles.warningText}>{t('admin.caution')}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('admin.modelManagement.title')}</Text>
                    <TouchableOpacity

                        style={[styles.actionCard, { backgroundColor: colors.card }]}
                        onPress={handleUploadModel}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: colors.primaryOverlay }]}>
                            <Ionicons name="cloud-upload" size={32} color={colors.primary} />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={[styles.actionTitle, { color: colors.text }]}>{t('admin.modelManagement.updateModel.title')} (Local)</Text>
                            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                                {t('admin.modelManagement.updateInstructions')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('admin.databaseManagement.title')}</Text>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.card }]}
                        onPress={handleEditDatabase}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: colors.primaryOverlay }]}>
                            <Ionicons name="create" size={32} color={colors.primary} />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={[styles.actionTitle, { color: colors.text }]}>{t('admin.databaseManagement.edit.editDisease')}</Text>
                            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                                {t('admin.databaseManagement.edit.editDiseaseDesc')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
  <Text style={[styles.sectionTitle, { color: colors.text }]}>
    {t('admin.analytics.title')}
  </Text>

  {/* Summary card as button to detailed screen */}
<TouchableOpacity
  style={[styles.actionCard, { backgroundColor: colors.card }]}
  activeOpacity={0.8}
  onPress={() => router.push('/admin-info')}
>
  <View style={[styles.actionIcon, { backgroundColor: colors.primaryOverlay }]}>
    <Ionicons name="stats-chart" size={32} color={colors.primary} />
  </View>
  <View style={styles.actionContent}>
    {isAnalyticsLoading || !analyticsSummary ? (
      <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
        {t('admin.analytics.loading')}
      </Text>
    ) : (
      <>
        <Text style={[styles.actionTitle, { color: colors.text }]}>
          {t('admin.analytics.summaryTitle', { count: analyticsSummary.total })}
        </Text>
        <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
          {t('admin.analytics.avgConfidence', {
            value: (analyticsSummary.avgConfidence ?? 0).toFixed(2),
          })}
        </Text>
        <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
          {t('admin.analytics.healthyCount', { count: analyticsSummary.healthyCount })}
        </Text>
      </>
    )}
  </View>
  <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
</TouchableOpacity>

  {/* Last 7 days card */}
  {!!last7DaysCounts.length && (
    <View
      style={[
        styles.actionCard,
        { backgroundColor: colors.card, marginTop: 12 },
      ]}
    >
      <View style={styles.actionContent}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>
          {t('admin.analytics.last7Days')}
        </Text>
        {last7DaysCounts.map((item) => (
          <Text
            key={item.day}
            style={[styles.actionDesc, { color: colors.textSecondary }]}
          >
            {item.day}: {item.count}
          </Text>
        ))}
      </View>
    </View>
  )}
</View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('admin.system.title')}</Text>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.card }]}
                        onPress={handleResetAdmin}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                            <Ionicons name="lock-closed" size={32} color="#FF3B30" />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={[styles.actionTitle, { color: '#FF3B30' }]}>{t('admin.system.lockAdmin.title')}</Text>
                            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                                {t('admin.system.removeAdminAccess')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <Ionicons name="information-circle" size={24} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        {t('admin.info')}
                    </Text>
                </View>
            </ScrollView>

            <AdminModal
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
                        onPress: () => {
                            if (!isUploading) {
                                setVisibleUpdate(false);
                            }
                        },
                        style: 'cancel',
                    },
                ]}
            >
                {!isUploading && (
                    <TouchableOpacity
                        style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                        onPress={handleUploadModel}
                    >
                        <Ionicons name="document" size={20} color="#fff" />
                        <Text style={styles.uploadButtonText}>Select Model File</Text>
                    </TouchableOpacity>
                )}
            </AdminModal>

            <AdminModal
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
                        label: t('common.ok'),
                        onPress: handleLockAdmin,
                        style: 'warning',
                    },
                ]}
            />

            <DiseaseEditor visible={visibleEdit} onClose={() => setVisibleEdit(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: { padding: 8 },
    title: { fontSize: 20, fontWeight: '700' },
    placeholder: { width: 40 },
    scrollView: { flex: 1 },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        gap: 12,
    },
    warningText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    actionIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionContent: { flex: 1 },
    actionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    actionDesc: { fontSize: 14, lineHeight: 20 },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    infoText: { flex: 1, fontSize: 14, lineHeight: 20 },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});