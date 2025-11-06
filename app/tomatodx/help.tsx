// app/tomatodx/help.tsx - Help & Support Screen
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function HelpScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const colors = Colors[theme];

    const faqs = [
        {
            question: 'How accurate is the disease detection?',
            answer: 'Our AI model achieves 92% accuracy in detecting common tomato diseases under optimal conditions.'
        },
        {
            question: 'What types of diseases can be detected?',
            answer: 'We detect Early Blight, Late Blight, Bacterial Spot, Leaf Mold, and healthy plant status.'
        },
        {
            question: 'How do I take the best photo for scanning?',
            answer: 'Ensure good lighting, focus on affected leaves, and keep the camera steady for clear images.'
        },
        {
            question: 'What should I do if the results are unclear?',
            answer: 'Retake the photo with better lighting or consult with agricultural experts for confirmation.'
        }
    ];

    const contactMethods = [
        {
            icon: 'mail',
            title: 'Email Support',
            description: 'Get help via email',
            action: () => Linking.openURL('mailto:support@tomatodx.com')
        },
        {
            icon: 'globe',
            title: 'Website',
            description: 'Visit our knowledge base',
            action: () => Linking.openURL('https://tomatodx.com/help')
        },
        {
            icon: 'chatbubbles',
            title: 'Live Chat',
            description: 'Chat with our experts',
            action: () => console.log('Open live chat')
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
                    Help & Support
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Welcome Section */}
                <View style={[styles.welcomeCard, { backgroundColor: colors.card }]}>
                    <Ionicons name="help-circle" size={48} color={colors.primary} />
                    <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                        How can we help you?
                    </Text>
                    <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                        Find answers to common questions or get in touch with our support team.
                    </Text>
                </View>

                {/* FAQ Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Frequently Asked Questions
                    </Text>
                    {faqs.map((faq, index) => (
                        <View
                            key={index}
                            style={[styles.faqCard, { backgroundColor: colors.card }]}
                        >
                            <Text style={[styles.faqQuestion, { color: colors.text }]}>
                                {faq.question}
                            </Text>
                            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                                {faq.answer}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Contact Methods */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Get in Touch
                    </Text>
                    {contactMethods.map((method, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.contactCard, { backgroundColor: colors.card }]}
                            onPress={method.action}
                        >
                            <View style={styles.contactLeft}>
                                <View style={[styles.contactIcon, { backgroundColor: colors.primaryOverlay }]}>
                                    <Ionicons name={method.icon as any} size={24} color={colors.primary} />
                                </View>
                                <View style={styles.contactInfo}>
                                    <Text style={[styles.contactTitle, { color: colors.text }]}>
                                        {method.title}
                                    </Text>
                                    <Text style={[styles.contactDesc, { color: colors.textSecondary }]}>
                                        {method.description}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={colors.textTertiary}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Tips */}
                <View style={[styles.tipsCard, { backgroundColor: colors.card }]}>
                    <Ionicons name="bulb" size={24} color={colors.warning} />
                    <View style={styles.tipsContent}>
                        <Text style={[styles.tipsTitle, { color: colors.text }]}>
                            Quick Tips for Better Results
                        </Text>
                        <View style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                Use natural daylight for photos
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                Capture multiple angles of affected leaves
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                Include both healthy and affected areas
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

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
    welcomeCard: {
        margin: 20,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    welcomeText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
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
    faqCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    faqAnswer: {
        fontSize: 14,
        lineHeight: 20,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    contactLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    contactIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    contactDesc: {
        fontSize: 14,
    },
    tipsCard: {
        flexDirection: 'row',
        margin: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    tipsContent: {
        flex: 1,
        marginLeft: 12,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    tipText: {
        fontSize: 14,
        flex: 1,
    },
});