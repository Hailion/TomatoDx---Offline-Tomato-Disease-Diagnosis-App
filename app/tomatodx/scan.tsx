// app/tomatodx/scan.tsx - Scan Screen
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [isCameraActive, setIsCameraActive] = useState(false);
    const cameraRef = useRef(null);
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
                <View style={styles.permissionContainer}>
                    <Ionicons name="camera-outline" size={64} color="#666" />
                    <Text style={[styles.permissionTitle, theme === 'dark' && styles.darkText]}>
                        {t('scan.cameraPermission')}
                    </Text>
                    <Text style={[styles.permissionText, theme === 'dark' && styles.darkSubtext]}>
                        {t('scan.cameraPermissionDesc')}
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestPermission}
                    >
                        <Text style={styles.permissionButtonText}>
                            {t('scan.grantPermission')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handleCapture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                router.push({
                    pathname: '/tomatodx/preview',
                    params: { uri: photo.uri }
                });
            } catch (error) {
                Alert.alert(t('scan.error'), t('scan.captureError'));
            }
        }
    };

    const handleGallery = async () => {
        // Gallery implementation would go here
        router.push('/tomatodx/preview');
    };

    return (
        <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
            {isCameraActive ? (
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="back"
                >
                    <View style={styles.cameraOverlay}>
                        <View style={styles.scanFrame} />
                        <Text style={styles.scanText}>{t('scan.alignGuide')}</Text>

                        <View style={styles.cameraControls}>
                            <TouchableOpacity
                                style={styles.galleryButton}
                                onPress={handleGallery}
                            >
                                <Ionicons name="images" size={24} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.captureButton}
                                onPress={handleCapture}
                            >
                                <View style={styles.captureInner} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.flipButton}
                                onPress={() => setIsCameraActive(false)}
                            >
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </CameraView>
            ) : (
                <View style={styles.scanHome}>
                    <View style={styles.scanHeader}>
                        <Text style={[styles.scanTitle, theme === 'dark' && styles.darkText]}>
                            {t('scan.title')}
                        </Text>
                        <Text style={[styles.scanSubtitle, theme === 'dark' && styles.darkSubtext]}>
                            {t('scan.subtitle')}
                        </Text>
                    </View>

                    <View style={styles.scanOptions}>
                        <TouchableOpacity
                            style={[styles.scanOption, theme === 'dark' && styles.darkCard]}
                            onPress={() => setIsCameraActive(true)}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: '#10b981' }]}>
                                <Ionicons name="camera" size={32} color="#fff" />
                            </View>
                            <Text style={[styles.optionTitle, theme === 'dark' && styles.darkText]}>
                                {t('scan.takePhoto')}
                            </Text>
                            <Text style={[styles.optionDesc, theme === 'dark' && styles.darkSubtext]}>
                                {t('scan.takePhotoDesc')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.scanOption, theme === 'dark' && styles.darkCard]}
                            onPress={handleGallery}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: '#8b5cf6' }]}>
                                <Ionicons name="images" size={32} color="#fff" />
                            </View>
                            <Text style={[styles.optionTitle, theme === 'dark' && styles.darkText]}>
                                {t('scan.chooseGallery')}
                            </Text>
                            <Text style={[styles.optionDesc, theme === 'dark' && styles.darkSubtext]}>
                                {t('scan.chooseGalleryDesc')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tips}>
                        <Text style={[styles.tipsTitle, theme === 'dark' && styles.darkText]}>
                            {t('scan.tips')}
                        </Text>
                        <Text style={[styles.tipsText, theme === 'dark' && styles.darkSubtext]}>
                            • {t('scan.tip1')}
                        </Text>
                        <Text style={[styles.tipsText, theme === 'dark' && styles.darkSubtext]}>
                            • {t('scan.tip2')}
                        </Text>
                        <Text style={[styles.tipsText, theme === 'dark' && styles.darkSubtext]}>
                            • {t('scan.tip3')}
                        </Text>
                    </View>
                </View>
            )}
        </View>
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
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginTop: 20,
        marginBottom: 8,
    },
    permissionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    permissionButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        padding: 20,
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#10b981',
        borderRadius: 12,
        alignSelf: 'center',
        marginTop: 100,
    },
    scanText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    galleryButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#10b981',
    },
    flipButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanHome: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    scanHeader: {
        alignItems: 'center',
        marginBottom: 40,
    },
    scanTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    scanSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    scanOptions: {
        gap: 16,
        marginBottom: 40,
    },
    scanOption: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    darkCard: {
        backgroundColor: '#1a1a1a',
    },
    optionIcon: {
        width: 60,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    optionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    optionDesc: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    tips: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: 20,
        borderRadius: 12,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    tipsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
});