// app/tomatodx/scan.tsx - Enhanced Scan Screen
import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync } from 'expo-audio';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const startAnimations = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            })
        ]).start();
    };

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
                <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
                <View style={styles.permissionContainer}>
                    <Animated.View style={[styles.iconContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                        <Ionicons name="camera-outline" size={80} color={theme === 'dark' ? '#4ade80' : '#10b981'} />
                    </Animated.View>
                    <Text style={[styles.permissionTitle, theme === 'dark' && styles.darkText]}>
                        {t('scan.cameraPermission')}
                    </Text>
                    <Text style={[styles.permissionText, theme === 'dark' && styles.darkSubtext]}>
                        {t('scan.cameraPermissionDesc')}
                    </Text>
                    <TouchableOpacity
                        style={[styles.permissionButton, theme === 'dark' && styles.darkPermissionButton]}
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
        if (cameraRef.current && !isCapturing) {
            setIsCapturing(true);
            try {
                // Mute shutter sound on Android by setting audio mode
                if (Platform.OS === 'android') {
                    await setAudioModeAsync({
                        playsInSilentMode: true,
                        shouldPlayInBackground: false,
                    });
                }

                const photo = await cameraRef.current.takePictureAsync();
                setIsCapturing(false);
                router.push({
                    pathname: '/tomatodx/preview',
                    params: { uri: photo.uri }
                });
            } catch (error) {
                setIsCapturing(false);
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
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
            <StatusBar
                barStyle={isCameraActive ? 'light-content' : theme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={isCameraActive ? '#000' : 'transparent'}
            />

            {isCameraActive ? (
                <>
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing="back"
                    />
                    <View style={styles.cameraOverlay}>
                        {/* Scan Frame with Animation */}
                        <View style={styles.scanFrameContainer}>
                            <Animated.View
                                style={[
                                    styles.scanFrame,
                                    { transform: [{ scale: pulseAnim }] }
                                ]}
                            />
                            <View style={styles.cornerTL} />
                            <View style={styles.cornerTR} />
                            <View style={styles.cornerBL} />
                            <View style={styles.cornerBR} />
                        </View>

                        <Text style={styles.scanText}>{t('scan.alignGuide')}</Text>

                        <View style={styles.cameraControls}>
                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={handleGallery}
                            >
                                <Ionicons name="images" size={24} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
                                onPress={handleCapture}
                                disabled={isCapturing}
                            >
                                <View style={styles.captureInner} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.controlButton}
                                onPress={() => setIsCameraActive(false)}
                            >
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            ) : (
                <ScrollView
                    style={styles.scanHome}
                    contentContainerStyle={styles.scanHomeContent}
                    showsVerticalScrollIndicator={false}
                    onLayout={startAnimations}
                >
                    <Animated.View
                        style={[
                            styles.scanHeader,
                            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                        ]}
                    >
                        <View style={styles.titleContainer}>
                            <Text style={[styles.scanTitle, theme === 'dark' && styles.darkText]}>
                                {t('scan.title')}
                            </Text>
                            <View style={[styles.titleUnderline, theme === 'dark' && styles.darkTitleUnderline]} />
                        </View>
                        <Text style={[styles.scanSubtitle, theme === 'dark' && styles.darkSubtext]}>
                            {t('scan.subtitle')}
                        </Text>
                    </Animated.View>

                    <View style={styles.scanOptions}>
                        <Animated.View
                            style={[
                                styles.optionContainer,
                                {
                                    opacity: fadeAnim, transform: [{
                                        translateY: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [50, 0]
                                        })
                                    }]
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={[styles.scanOption, theme === 'dark' && styles.darkCard]}
                                onPress={() => {
                                    setIsCameraActive(true);
                                    startPulseAnimation();
                                }}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.optionIcon, styles.cameraIcon]}>
                                    <Ionicons name="camera" size={32} color="#fff" />
                                </View>
                                <Text style={[styles.optionTitle, theme === 'dark' && styles.darkText]}>
                                    {t('scan.takePhoto')}
                                </Text>
                                <Text style={[styles.optionDesc, theme === 'dark' && styles.darkSubtext]}>
                                    {t('scan.takePhotoDesc')}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.optionContainer,
                                {
                                    opacity: fadeAnim, transform: [{
                                        translateY: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [70, 0]
                                        })
                                    }]
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={[styles.scanOption, theme === 'dark' && styles.darkCard]}
                                onPress={handleGallery}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.optionIcon, styles.galleryIcon]}>
                                    <Ionicons name="images" size={32} color="#fff" />
                                </View>
                                <Text style={[styles.optionTitle, theme === 'dark' && styles.darkText]}>
                                    {t('scan.chooseGallery')}
                                </Text>
                                <Text style={[styles.optionDesc, theme === 'dark' && styles.darkSubtext]}>
                                    {t('scan.chooseGalleryDesc')}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    <Animated.View
                        style={[
                            styles.tips,
                            theme === 'dark' && styles.darkTips,
                            {
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [30, 0]
                                    })
                                }]
                            }
                        ]}
                    >
                        <View style={styles.tipsHeader}>
                            <Ionicons name="bulb-outline" size={20} color={theme === 'dark' ? '#4ade80' : '#10b981'} />
                            <Text style={[styles.tipsTitle, theme === 'dark' && styles.darkText]}>
                                {t('scan.tips')}
                            </Text>
                        </View>
                        <View style={styles.tipsList}>
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
                    </Animated.View>
                </ScrollView>
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
        padding: 30,
    },
    iconContainer: {
        marginBottom: 20,
    },
    permissionTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 12,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    permissionButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    darkPermissionButton: {
        backgroundColor: '#4ade80',
        shadowColor: '#4ade80',
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    darkText: {
        color: '#fff',
    },
    darkSubtext: {
        color: '#ccc',
    },
    darkCard: {
        backgroundColor: '#1a1a1a',
        shadowColor: '#000',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'space-between',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    scanFrameContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#10b981',
        borderRadius: 16,
        position: 'absolute',
    },
    cornerTL: {
        position: 'absolute',
        top: -2,
        left: -2,
        width: 30,
        height: 30,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#10b981',
        borderTopLeftRadius: 12,
    },
    cornerTR: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 30,
        height: 30,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: '#10b981',
        borderTopRightRadius: 12,
    },
    cornerBL: {
        position: 'absolute',
        bottom: -2,
        left: -2,
        width: 30,
        height: 30,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#10b981',
        borderBottomLeftRadius: 12,
    },
    cornerBR: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 30,
        height: 30,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: '#10b981',
        borderBottomRightRadius: 12,
    },
    scanText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
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
        paddingHorizontal: 40,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    captureButtonDisabled: {
        opacity: 0.6,
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#10b981',
    },
    scanHome: {
        flex: 1,
    },
    scanHomeContent: {
        paddingTop: 80,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    scanHeader: {
        alignItems: 'center',
        marginBottom: 50,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    scanTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    titleUnderline: {
        width: 60,
        height: 4,
        backgroundColor: '#10b981',
        borderRadius: 2,
    },
    darkTitleUnderline: {
        backgroundColor: '#4ade80',
    },
    scanSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 300,
    },
    scanOptions: {
        gap: 20,
        marginBottom: 50,
    },
    optionContainer: {
        // Container for animation
    },
    scanOption: {
        backgroundColor: '#fff',
        padding: 28,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    optionIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    cameraIcon: {
        backgroundColor: '#10b981',
    },
    galleryIcon: {
        backgroundColor: '#8b5cf6',
    },
    optionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    optionDesc: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    tips: {
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        padding: 24,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    darkTips: {
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderLeftColor: '#4ade80',
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    tipsTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a1a1a',
        marginLeft: 8,
    },
    tipsList: {
        gap: 6,
    },
    tipsText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});