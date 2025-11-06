// app/tomatodx/about.tsx - About Screen
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function AboutScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const colors = Colors[theme];

    const features = [
        {
            icon: 'camera',
            title: 'AI-Powered Detection',
            description: 'Advanced machine learning for accurate disease identification'
        },
        {
            icon: 'speedometer',
            title: 'Instant Results',
            description: 'Get diagnosis in seconds with detailed treatment recommendations'
        },
        {
            icon: 'library',
            title: 'Scan History',
            description: 'Track your plant health over time with comprehensive history'
        },
        {
            icon: 'globe',
            title: 'Multi-Language',
            description: 'Available in English and Amharic for wider accessibility'
        }
    ];

    const team = [
        {
            name: 'Agriculture Experts',
            role: 'Plant Pathology',
            description: 'Ensuring accurate disease identification and treatment recommendations'
        },
        {
            name: 'AI Engineers',
            role: 'Machine Learning',
            description: 'Developing and training advanced computer vision models'
        },
        {
            name: 'Mobile Developers',
            role: 'App Development',
            description: 'Creating intuitive and user-friendly mobile experiences'
        }
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={colors.text}
                    />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>
                    About TomatoDx
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
                    <View style={[styles.logo, { backgroundColor: colors.primaryOverlay }]}>
                        <Ionicons name="leaf" size={48} color={colors.primary} />
                    </View>
                    <Text style={[styles.appName, { color: colors.text }]}>
                        TomatoDx
                    </Text>
                    <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                        AI-Powered Tomato Disease Detection
                    </Text>
                    <Text style={[styles.version, { color: colors.textTertiary }]}>
                        Version 1.0.0
                    </Text>
                </View>

                {/* Mission Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Our Mission
                    </Text>
                    <View style={[styles.missionCard, { backgroundColor: colors.card }]}>
                        <Text style={[styles.missionText, { color: colors.textSecondary }]}>
                            TomatoDx empowers farmers and gardeners with instant, accurate tomato disease detection using artificial intelligence. Our goal is to make plant healthcare accessible to everyone, helping to increase crop yields and reduce pesticide misuse.
                        </Text>
                    </View>
                </View>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Features
                    </Text>
                    {features.map((feature, index) => (
                        <View
                            key={index}
                            style={[styles.featureCard, { backgroundColor: colors.card }]}
                        >
                            <View style={[styles.featureIcon, { backgroundColor: colors.primaryOverlay }]}>
                                <Ionicons name={feature.icon as any} size={24} color={colors.primary} />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={[styles.featureTitle, { color: colors.text }]}>
                                    {feature.title}
                                </Text>
                                <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                                    {feature.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Technology */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Technology
                    </Text>
                    <View style={[styles.techCard, { backgroundColor: colors.card }]}>
                        <View style={styles.techItem}>
                            <Ionicons name="hardware-chip" size={20} color={colors.primary} />
                            <Text style={[styles.techText, { color: colors.text }]}>
                                TensorFlow Lite
                            </Text>
                        </View>
                        <View style={styles.techItem}>
                            <Ionicons name="cellular" size={20} color={colors.primary} />
                            <Text style={[styles.techText, { color: colors.text }]}>
                                React Native
                            </Text>
                        </View>
                        <View style={styles.techItem}>
                            <Ionicons name="cloud" size={20} color={colors.primary} />
                            <Text style={[styles.techText, { color: colors.text }]}>
                                Computer Vision
                            </Text>
                        </View>
                        <View style={styles.techItem}>
                            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                            <Text style={[styles.techText, { color: colors.text }]}>
                                Privacy-First
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Team */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Our Team
                    </Text>
                    {team.map((member, index) => (
                        <View
                            key={index}
                            style={[styles.teamCard, { backgroundColor: colors.card }]}
                        >
                            <Text style={[styles.teamName, { color: colors.text }]}>
                                {member.name}
                            </Text>
                            <Text style={[styles.teamRole, { color: colors.primary }]}>
                                {member.role}
                            </Text>
                            <Text style={[styles.teamDesc, { color: colors.textSecondary }]}>
                                {member.description}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <View style={[styles.footer, { backgroundColor: colors.card }]}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        Made with ❤️ for farmers and gardeners worldwide
                    </Text>
                    <Text style={[styles.copyright, { color: colors.textTertiary }]}>
                        © 2024 TomatoDx. All rights reserved.
                    </Text>

                    <View style={styles.links}>
                        <TouchableOpacity
                            style={styles.link}
                            onPress={() => Linking.openURL('https://tomatodx.com/privacy')}
                        >
                            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                                Privacy Policy
                            </Text>
                        </TouchableOpacity>
                        <Text style={[styles.linkSeparator, { color: colors.textTertiary }]}>
                            •
                        </Text>
                        <TouchableOpacity
                            style={styles.link}
                            onPress={() => Linking.openURL('https://tomatodx.com/terms')}
                        >
                            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                                Terms of Service
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// ... (styles remain the same, just remove theme conditionals)
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    heroCard: {
        margin: 20,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    appName: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
    },
    version: {
        fontSize: 14,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    missionCard: {
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    missionText: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    techCard: {
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    techItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    techText: {
        fontSize: 16,
        fontWeight: '500',
    },
    teamCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    teamName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    teamRole: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    teamDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        margin: 20,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    footerText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
    },
    copyright: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    links: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    link: {
        paddingVertical: 4,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '500',
    },
    linkSeparator: {
        fontSize: 14,
    },
});