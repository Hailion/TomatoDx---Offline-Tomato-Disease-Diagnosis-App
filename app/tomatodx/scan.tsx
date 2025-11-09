// app/tomatodx/scan.tsx - Compact Scan Screen
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [isCameraActive, setIsCameraActive] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const colors = Colors[theme];

    // Enhanced animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const buttonScaleAnim = useRef(new Animated.Value(0.9)).current;
    const cameraTransitionAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Staggered entrance animations with spring physics
        Animated.stagger(150, [
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 60,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
            Animated.spring(buttonScaleAnim, {
                toValue: 1,
                tension: 80,
                friction: 6,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Camera transition animation
    const animateCameraTransition = (toCamera: boolean) => {
        Animated.timing(cameraTransitionAnim, {
            toValue: toCamera ? 1 : 0,
            duration: 400,
            useNativeDriver: true,
        }).start();
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.permissionContainer}>
                    <Ionicons name="camera-outline" size={64} color={colors.muted} />
                    <Text style={[styles.permissionTitle, { color: colors.text }]}>
                        {t('scan.cameraPermission')}
                    </Text>
                    <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
                        {t('scan.cameraPermissionDesc')}
                    </Text>
                    <TouchableOpacity
                        style={[styles.permissionButton, { backgroundColor: colors.primary }]}
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
        try {
            // Request media library permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    t('scan.permissionDenied'),
                    t('scan.galleryPermissionDesc')
                );
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
                router.push({
                    pathname: '/tomatodx/preview',
                    params: { uri: result.assets[0].uri }
                });
            }
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert(t('scan.error'), t('scan.galleryError'));
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {isCameraActive ? (
                <>
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing="back"
                    />
                    <View style={styles.cameraOverlay}>
                        {/* Scan Frame with Corners */}
                        <View style={styles.scanFrameContainer}>
                            <View style={[styles.scanFrame, { borderColor: colors.primary }]} />
                            <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
                            <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
                            <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
                            <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
                        </View>

                        <Text style={styles.scanText}>{t('scan.alignGuide')}</Text>

                        <View style={styles.cameraControls}>
                            <TouchableOpacity
                                style={[styles.controlButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                                onPress={handleGallery}
                            >
                                <Ionicons name="images" size={20} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.captureButton}
                                onPress={handleCapture}
                            >
                                <View style={[styles.captureInner, { backgroundColor: colors.primary }]} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.controlButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                                onPress={() => setIsCameraActive(false)}
                            >
                                <Ionicons name="close" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            ) : (
                <ScrollView
                    style={styles.scanHome}
                    contentContainerStyle={styles.scanHomeContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Compact Header */}
                    <Animated.View style={[styles.scanHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={[styles.logoContainer, { backgroundColor: colors.primaryOverlay }]}>
                            <Ionicons name="camera" size={28} color={colors.primary} />
                        </View>
                        <Text style={[styles.scanTitle, { color: colors.text }]}>
                            {t('scan.title')}
                        </Text>
                        <Text style={[styles.scanSubtitle, { color: colors.textSecondary }]}>
                            {t('scan.subtitle')}
                        </Text>
                    </Animated.View>

                    {/* Compact Action Buttons - Side by Side */}
                    <Animated.View style={[styles.actionButtons, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.card }]}
                            onPress={() => setIsCameraActive(true)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                                <Ionicons name="camera" size={24} color="#fff" />
                            </View>
                            <Text style={[styles.actionButtonTitle, { color: colors.text }]}>
                                {t('scan.takePhoto')}
                            </Text>
                            <Text style={[styles.actionButtonDesc, { color: colors.textSecondary }]}>
                                {t('scan.takePhotoDesc')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.card }]}
                            onPress={handleGallery}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                                <Ionicons name="images" size={24} color="#fff" />
                            </View>
                            <Text style={[styles.actionButtonTitle, { color: colors.text }]}>
                                {t('scan.chooseGallery')}
                            </Text>
                            <Text style={[styles.actionButtonDesc, { color: colors.textSecondary }]}>
                                {t('scan.chooseGalleryDesc')}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Quick Tips - More Compact */}
                    <Animated.View style={[styles.tips, { backgroundColor: colors.primaryOverlay, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.tipsHeader}>
                            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
                            <Text style={[styles.tipsTitle, { color: colors.text }]}>
                                {t('scan.tips')}
                            </Text>
                        </View>
                        <View style={styles.tipsList}>
                            <View style={styles.tipItem}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                    {t('scan.tip1')}
                                </Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                    {t('scan.tip2')}
                                </Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                    {t('scan.tip3')}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Recent Activity Preview (Optional) */}
                    <Animated.View style={[styles.recentSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={[styles.recentTitle, { color: colors.text }]}>
                            {t('scan.quickStart')}
                        </Text>
                        <Text style={[styles.recentText, { color: colors.textSecondary }]}>
                            {t('scan.quickStartDesc')}
                        </Text>
                    </Animated.View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 8,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    permissionButton: {
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
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'space-between',
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    scanFrameContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    scanFrame: {
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_WIDTH * 0.85,
        borderWidth: .5,
        borderRadius: 12,
        marginVertical: 20,
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderWidth: 3.5,
    },
    cornerTL: {
        top: -1,
        left: -1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 8,
    },
    cornerTR: {
        top: -1,
        right: -1,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 8,
    },
    cornerBL: {
        bottom: -1,
        left: -1,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
    },
    cornerBR: {
        bottom: -1,
        right: -1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 8,
    },
    scanText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 20,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 74,
        height: 74,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    captureInner: {
        width: 62,
        height: 62,
        borderRadius: 31,
        opacity: 0.8
    },
    scanHome: {
        flex: 1,
    },
    scanHomeContent: {
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    scanHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    scanTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    scanSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    actionButton: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionButtonTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    actionButtonDesc: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    tips: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    tipsList: {
        gap: 8,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    tipText: {
        fontSize: 13,
        lineHeight: 18,
        flex: 1,
    },
    recentSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    recentTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    recentText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
});