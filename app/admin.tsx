// app/admin.tsx - Admin Panel
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';

export default function AdminScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = Colors[theme];
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuthorization();
    }, []);

    const checkAuthorization = async () => {
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
    };

    const handleUploadModel = () => {
        Alert.alert(
            'Upload Model',
            'Model upload functionality. Select a TensorFlow.js model file to upload.',
            [{ text: 'OK' }]
        );
    };

    const handleEditDatabase = () => {
        Alert.alert(
            'Edit Database',
            'Database editor functionality. Edit disease information here.',
            [{ text: 'OK' }]
        );
    };

    const handleResetAdmin = async () => {
        Alert.alert(
            'Reset Admin Access',
            'Are you sure you want to lock admin mode?',
            [
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('adminUnlocked');
                        Alert.alert('Admin Locked', 'Admin mode has been locked.');
                        router.back();
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
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
                <Text style={[styles.title, { color: colors.text }]}>Admin Panel</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={[styles.warningBanner, { backgroundColor: '#FFA500' }]}>
                    <Ionicons name="warning" size={24} color="#fff" />
                    <Text style={styles.warningText}>Admin Mode - Use with caution</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Model Management</Text>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.card }]}
                        onPress={handleUploadModel}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: colors.primaryOverlay }]}>
                            <Ionicons name="cloud-upload" size={32} color={colors.primary} />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={[styles.actionTitle, { color: colors.text }]}>Upload Model (Local)</Text>
                            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                                Upload a new TensorFlow.js model
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Database Management</Text>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.card }]}
                        onPress={handleEditDatabase}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: colors.primaryOverlay }]}>
                            <Ionicons name="create" size={32} color={colors.primary} />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={[styles.actionTitle, { color: colors.text }]}>Edit Disease DB</Text>
                            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                                Modify disease information
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>System</Text>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: colors.card }]}
                        onPress={handleResetAdmin}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                            <Ionicons name="lock-closed" size={32} color="#FF3B30" />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={[styles.actionTitle, { color: '#FF3B30' }]}>Lock Admin Mode</Text>
                            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                                Remove admin access
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <Ionicons name="information-circle" size={24} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        Development admin panel. Production needs proper authentication.
                    </Text>
                </View>
            </ScrollView>
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
});