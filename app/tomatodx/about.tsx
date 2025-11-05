// app/tomatodx/about.tsx - About Screen
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function AboutScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();

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
        <View style={[styles.container, theme === 'dark' && styles.darkContainer]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={theme === 'dark' ? '#fff' : '#1a1a1a'}
                    />
                </TouchableOpacity>
                <Text style={[styles.title, theme === 'dark' && styles.darkText]}>
                    About TomatoDx
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={[styles.heroCard, theme === 'dark' && styles.darkCard]}>
                    <View style={styles.logo}>
                        <Ionicons name="leaf" size={48} color="#10b981" />
                    </View>
                    <Text style={[styles.appName, theme === 'dark' && styles.darkText]}>
                        TomatoDx
                    </Text>
                    <Text style={[styles.tagline, theme === 'dark' && styles.darkSubtext]}>
                        AI-Powered Tomato Disease Detection
                    </Text>
                    <Text style={[styles.version, theme === 'dark' && styles.darkSubtext]}>
                        Version 1.0.0
                    </Text>
                </View>

                {/* Mission Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
                        Our Mission
                    </Text>
                    <View style={[styles.missionCard, theme === 'dark' && styles.darkCard]}>
                        <Text style={[styles.missionText, theme === 'dark' && styles.darkSubtext]}>
                            TomatoDx empowers farmers and gardeners with instant, accurate tomato disease detection using artificial intelligence. Our goal is to make plant healthcare accessible to everyone, helping to increase crop yields and reduce pesticide misuse.
                        </Text>
                    </View>
                </View>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
                        Features
                    </Text>
                    {features.map((feature, index) => (
                        <View
                            key={index}
                            style={[styles.featureCard, theme === 'dark' && styles.darkCard]}
                        >
                            <View style={[styles.featureIcon, { backgroundColor: '#10b98120' }]}>
                                <Ionicons name={feature.icon as any} size={24} color="#10b981" />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={[styles.featureTitle, theme === 'dark' && styles.darkText]}>
                                    {feature.title}
                                </Text>
                                <Text style={[styles.featureDesc, theme === 'dark' && styles.darkSubtext]}>
                                    {feature.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Technology */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
                        Technology
                    </Text>
                    <View style={[styles.techCard, theme === 'dark' && styles.darkCard]}>
                        <View style={styles.techItem}>
                            <Ionicons name="hardware-chip" size={20} color="#10b981" />
                            <Text style={[styles.techText, theme === 'dark' && styles.darkText]}>
                                TensorFlow Lite
                            </Text>
                        </View>
                        <View style={styles.techItem}>
                            <Ionicons name="cellular" size={20} color="#10b981" />
                            <Text style={[styles.techText, theme === 'dark' && styles.darkText]}>
                                React Native
                            </Text>
                        </View>
                        <View style={styles.techItem}>
                            <Ionicons name="cloud" size={20} color="#10b981" />
                            <Text style={[styles.techText, theme === 'dark' && styles.darkText]}>
                                Computer Vision
                            </Text>
                        </View>
                        <View style={styles.techItem}>
                            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                            <Text style={[styles.techText, theme === 'dark' && styles.darkText]}>
                                Privacy-First
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Team */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
                        Our Team
                    </Text>
                    {team.map((member, index) => (
                        <View
                            key={index}
                            style={[styles.teamCard, theme === 'dark' && styles.darkCard]}
                        >
                            <Text style={[styles.teamName, theme === 'dark' && styles.darkText]}>
                                {member.name}
                            </Text>
                            <Text style={[styles.teamRole, theme === 'dark' && styles.darkSubtext]}>
                                {member.role}
                            </Text>
                            <Text style={[styles.teamDesc, theme === 'dark' && styles.darkSubtext]}>
                                {member.description}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <View style={[styles.footer, theme === 'dark' && styles.darkCard]}>
                    <Text style={[styles.footerText, theme === 'dark' && styles.darkSubtext]}>
                        Made with ❤️ for farmers and gardeners worldwide
                    </Text>
                    <Text style={[styles.copyright, theme === 'dark' && styles.darkSubtext]}>
                        © 2024 TomatoDx. All rights reserved.
                    </Text>

                    <View style={styles.links}>
                        <TouchableOpacity
                            style={styles.link}
                            onPress={() => Linking.openURL('https://tomatodx.com/privacy')}
                        >
                            <Text style={[styles.linkText, theme === 'dark' && styles.darkSubtext]}>
                                Privacy Policy
                            </Text>
                        </TouchableOpacity>
                        <Text style={[styles.linkSeparator, theme === 'dark' && styles.darkSubtext]}>
                            •
                        </Text>
                        <TouchableOpacity
                            style={styles.link}
                            onPress={() => Linking.openURL('https://tomatodx.com/terms')}
                        >
                            <Text style={[styles.linkText, theme === 'dark' && styles.darkSubtext]}>
                                Terms of Service
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// Add these missing styles to the StyleSheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    darkContainer: {
        backgroundColor: '#000',
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
        color: '#1a1a1a',
    },
    darkText: {
        color: '#fff',
    },
    darkSubtext: {
        color: '#999',
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    heroCard: {
        backgroundColor: '#fff',
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
    darkCard: {
        backgroundColor: '#1a1a1a',
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    appName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    version: {
        fontSize: 14,
        color: '#999',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    missionCard: {
        backgroundColor: '#fff',
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
        color: '#666',
        lineHeight: 24,
        textAlign: 'center',
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
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
        color: '#1a1a1a',
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    techCard: {
        backgroundColor: '#fff',
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
        color: '#1a1a1a',
    },
    teamCard: {
        backgroundColor: '#fff',
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
        color: '#1a1a1a',
        marginBottom: 4,
    },
    teamRole: {
        fontSize: 14,
        color: '#10b981',
        fontWeight: '600',
        marginBottom: 8,
    },
    teamDesc: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    footer: {
        backgroundColor: '#fff',
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
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    copyright: {
        fontSize: 14,
        color: '#999',
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
        color: '#666',
        fontWeight: '500',
    },
    linkSeparator: {
        fontSize: 14,
        color: '#999',
    },
});

// Add missing import
import { TouchableOpacity } from 'react-native';
