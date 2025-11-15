// src/components/AdminModal.tsx - Reusable Admin Modal Component
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface AdminModalProps {
    visible: boolean;
    onClose: () => void;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    buttons?: {
        label: string;
        onPress: () => void;
        style?: 'primary' | 'cancel' | 'danger' | 'warning';
    }[];
    children?: React.ReactNode;
}

export default function AdminModal({
    visible,
    onClose,
    icon,
    title,
    message,
    buttons,
    children,
}: AdminModalProps) {
    const { theme } = useTheme();
    const colors = Colors[theme];

    const defaultButtons = buttons || [
        {
            label: 'OK',
            onPress: onClose,
            style: 'cancel' as const,
        },
    ];

    const getButtonStyle = (style?: string) => {
        switch (style) {
            case 'primary':
                return { backgroundColor: colors.primary };
            case 'danger':
                return { backgroundColor: colors.danger || '#FF3B30' };
            case 'warning':
                return { backgroundColor: colors.warning };
            default:
                return { backgroundColor: colors.backgroundAlt };
        }
    };

    const getIconColor = (style?: string) => {
        switch (style) {
            case 'danger':
                return colors.danger || '#FF3B30';
            case 'warning':
                return colors.warning;
            default:
                return colors.primary;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <View style={[styles.modalIcon, { backgroundColor: colors.background + '80' }]}>
                        <Ionicons name={icon} size={40} color={getIconColor(buttons?.[0]?.style)} />
                    </View>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>{message}</Text>
                    {children}
                    <View style={styles.modalButtons}>
                        {defaultButtons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.modalButton,
                                    getButtonStyle(button.style),
                                    defaultButtons.length === 1 && styles.modalButtonSingle,
                                ]}
                                onPress={button.onPress}
                            >
                                <Text
                                    style={[
                                        styles.modalButtonText,
                                        { color: button.style === 'danger' || button.style === 'warning' ? '#fff' : colors.text },
                                    ]}
                                >
                                    {button.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalIcon: {
        marginBottom: 16,
        width: 80,
        height: 80,
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

