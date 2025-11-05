// app/tomatodx/help.tsx - Help & Support Screen
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function HelpScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();

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
                    Help & Support
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Welcome Section */}
                <View style={[styles.welcomeCard, theme === 'dark' && styles.darkCard]}>
                    <Ionicons name="help-circle" size={48} color="#10b981" />
                    <Text style={[styles.welcomeTitle, theme === 'dark' && styles.darkText]}>
                        How can we help you?
                    </Text>
                    <Text style={[styles.welcomeText, theme === 'dark' && styles.darkSubtext]}>
                        Find answers to common questions or get in touch with our support team.
                    </Text>
                </View>

                {/* FAQ Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
                        Frequently Asked Questions
                    </Text>
                    {faqs.map((faq, index) => (
                        <View
                            key={index}
                            style={[styles.faqCard, theme === 'dark' && styles.darkCard]}
                        >
                            <Text style={[styles.faqQuestion, theme === 'dark' && styles.darkText]}>
                                {faq.question}
                            </Text>
                            <Text style={[styles.faqAnswer, theme === 'dark' && styles.darkSubtext]}>
                                {faq.answer}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Contact Methods */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, theme === 'dark' && styles.darkText]}>
                        Get in Touch
                    </Text>
                    {contactMethods.map((method, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.contactCard, theme === 'dark' && styles.darkCard]}
                            onPress={method.action}
                        >
                            <View style={styles.contactLeft}>
                                <View style={[styles.contactIcon, { backgroundColor: '#10b98120' }]}>
                                    <Ionicons name={method.icon as any} size={24} color="#10b981" />
                                </View>
                                <View style={styles.contactInfo}>
                                    <Text style={[styles.contactTitle, theme === 'dark' && styles.darkText]}>
                                        {method.title}
                                    </Text>
                                    <Text style={[styles.contactDesc, theme === 'dark' && styles.darkSubtext]}>
                                        {method.description}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={theme === 'dark' ? '#666' : '#999'}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Tips */}
                <View style={[styles.tipsCard, theme === 'dark' && styles.darkCard]}>
                    <Ionicons name="bulb" size={24} color="#f59e0b" />
                    <View style={styles.tipsContent}>
                        <Text style={[styles.tipsTitle, theme === 'dark' && styles.darkText]}>
                            Quick Tips for Better Results
                        </Text>
                        <View style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                            <Text style={[styles.tipText, theme === 'dark' && styles.darkSubtext]}>
                                Use natural daylight for photos
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                            <Text style={[styles.tipText, theme === 'dark' && styles.darkSubtext]}>
                                Capture multiple angles of affected leaves
                            </Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                            <Text style={[styles.tipText, theme === 'dark' && styles.darkSubtext]}>
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
    welcomeCard: {
        backgroundColor: '#fff',
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
    darkCard: {
        backgroundColor: '#1a1a1a',
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    welcomeText: {
        fontSize: 16,
        color: '#666',
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
        color: '#1a1a1a',
        marginBottom: 16,
    },
    faqCard: {
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
    faqQuestion: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    faqAnswer: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        color: '#1a1a1a',
        marginBottom: 4,
    },
    contactDesc: {
        fontSize: 14,
        color: '#666',
    },
    tipsCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
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
        color: '#1a1a1a',
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
        color: '#666',
        flex: 1,
    },
});