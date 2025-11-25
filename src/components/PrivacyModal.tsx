// src/components/PrivacyModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Animated,
    Dimensions,
    ImageBackground,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PrivacyModalProps {
    visible: boolean;
    onClose: (accepted: boolean) => void;
    onToggle: (value: boolean) => void;
    optIn: boolean;
}

export default function PrivacyModal({ visible, onClose, onToggle, optIn }: PrivacyModalProps) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const colors = Colors[theme];

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            // Start entrance animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 80,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 80,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Reset animation values
            fadeAnim.setValue(0);
            slideAnim.setValue(50);
            scaleAnim.setValue(0.9);
        }
    }, [visible]);

    const handleClose = (accepted: boolean) => {
        // Exit animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 50,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose(accepted);
        });
    };

    if (!visible) return null;

    return (
          <ImageBackground
    source={require('../../assets/images/image.png')}
    style={styles.backgroundImage}
    imageStyle={{ resizeMode: 'cover' }}
  >
    <View style={[styles.overlay, { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.65)' }]}>
    
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={() => handleClose(false)}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            backgroundColor: `${colors.card}BB`,
                            transform: [
                                { translateY: slideAnim },
                                { scale: scaleAnim },
                            ],
                        },
                    ]}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primaryOverlay }]}>
                                <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
                            </View>
                            <Text style={[styles.title, { color: colors.text }]}>
                                {t('privacy.title')}
                            </Text>
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            <Text style={[styles.description, { color: colors.textSecondary }]}>
                                {t('privacy.description')}
                            </Text>

                            {/* Key Points */}
                            <View style={styles.keyPoints}>
                                <View style={styles.keyPoint}>
                                    <Ionicons name="phone-portrait" size={20} color={colors.success} />
                                    <Text style={[styles.keyPointText, { color: colors.textSecondary }]}>
                                        {t('privacy.localProcessing')}
                                    </Text>
                                </View>
                                <View style={styles.keyPoint}>
                                    <Ionicons name="shield" size={20} color={colors.success} />
                                    <Text style={[styles.keyPointText, { color: colors.textSecondary }]}>
                                        {t('privacy.noDataCollection')}
                                    </Text>
                                </View>
                                <View style={styles.keyPoint}>
                                    <Ionicons name="lock-closed" size={20} color={colors.success} />
                                    <Text style={[styles.keyPointText, { color: colors.textSecondary }]}>
                                        {t('privacy.secureStorage')}
                                    </Text>
                                </View>
                            </View>

                            {/* Research Opt-in */}
                            {/* <View style={[styles.optInContainer, { backgroundColor: colors.backgroundAlt }]}>
                                <View style={styles.optInHeader}>
                                    <Ionicons name="flask" size={20} color={colors.primary} />
                                    <Text style={[styles.optInTitle, { color: colors.text }]}>
                                        {t('privacy.researchTitle')}
                                    </Text>
                                </View>
                                <Text style={[styles.optInDescription, { color: colors.textSecondary }]}>
                                    {t('privacy.researchDescription')}
                                </Text>
                                <View style={styles.switchContainer}>
                                    <Switch
                                        value={optIn}
                                        onValueChange={onToggle}
                                        trackColor={{ false: colors.muted, true: colors.primary }}
                                        thumbColor={optIn ? colors.primary : colors.textTertiary}
                                    />
                                    <Text style={[styles.switchLabel, { color: colors.text }]}>
                                        {t('privacy.researchOptIn')}
                                    </Text>
                                </View>
                            </View> */}
                        </View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.declineButton, { backgroundColor: colors.backgroundAlt }]}
                                onPress={() => handleClose(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.declineButtonText, { color: colors.textSecondary }]}>
                                    {t('privacy.decline')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.acceptButton, { backgroundColor: colors.primary }]}
                                onPress={() => handleClose(true)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="checkmark" size={20} color="#fff" />
                                <Text style={styles.acceptButtonText}>
                                    {t('privacy.acceptAndContinue')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
        </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: { flex: 1 },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        maxHeight: SCREEN_HEIGHT * 0.8,
        borderRadius: 20,
        padding: 24,
       
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    content: {
        marginBottom: 24,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 20,
    },
    keyPoints: {
        marginBottom: 20,
    },
    keyPoint: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    keyPointText: {
        fontSize: 14,
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
    },
    optInContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    optInHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    optInTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    optInDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 12,
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    declineButton: {
        flex: 2,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    declineButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    acceptButton: {
        flex: 2,
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});