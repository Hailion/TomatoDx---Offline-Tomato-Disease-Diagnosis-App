// app/tomatodx/help.tsx - Help & Support Screen
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, ImageBackground, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function HelpScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    // Animation function
    const startAnimations = useCallback(() => {
        // Reset animation values
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        scaleAnim.setValue(0.95);

        // Staggered entrance animations
        Animated.stagger(100, [
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 60,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 80,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [fadeAnim, slideAnim, scaleAnim]);

    // Trigger animations on screen focus
    useFocusEffect(
        useCallback(() => {
            startAnimations();
        }, [startAnimations])
    );

    const toggleFaq = (index: number) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    const faqs = [
        {
            question: t('help.faqs.accuracy.question'),
            answer: t('help.faqs.accuracy.answer')
        },
        {
            question: t('help.faqs.diseases.question'),
            answer: t('help.faqs.diseases.answer')
        },
        {
            question: t('help.faqs.photo.question'),
            answer: t('help.faqs.photo.answer')
        },
        {
            question: t('help.faqs.unclear.question'),
            answer: t('help.faqs.unclear.answer')
        }
    ];

    const contactMethods = [
        {
            icon: 'mail',
            title: t('help.contactMethods.email.title'),
            description: t('help.contactMethods.email.description'),
            action: () => Linking.openURL('mailto:support@tomatodx.com')
        },
        {
            icon: 'globe',
            title: t('help.contactMethods.website.title'),
            description: t('help.contactMethods.website.description'),
            action: () => Linking.openURL('https://tomatodx.com/help')
        },
        // {
        //     icon: 'chatbubbles',
        //     title: t('help.contactMethods.chat.title'),
        //     description: t('help.contactMethods.chat.description'),
        //     action: () => console.log('Open live chat')
        // }
    ];

    return (
        // Background image placeholder for Help screen - replace with a suitable image from assets later
        <ImageBackground
            source={require('../../assets/images/screenBg/help.jpg')}
            style={styles.backgroundImage}
            imageStyle={{ resizeMode: 'cover' }}
        >
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
                <View style={[styles.container, { backgroundColor: theme === 'dark' ? `${colors.background}80` : `${colors.background}79` }]}>
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
                            {t('help.title')}
                        </Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView style={[styles.scrollView]} showsVerticalScrollIndicator={false}>
                        {/* Welcome Section */}
                        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <View style={[styles.wellcomeCardContainer, { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)', marginHorizontal: 16, borderRadius: 8 }, theme !== 'dark' ? styles.cardShadow : undefined]}>
                                <ImageBackground
                                    source={require('../../assets/images/screenBg/about.jpg')}
                                    style={styles.backgroundImage}
                                    imageStyle={{ resizeMode: 'cover' }}
                                >
                                    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                                        <View style={[styles.welcomeCard]}>
                                            <View style={[styles.iconContainer]}>
                                                <Ionicons name="help-circle" size={48} color={colors.primary} />
                                            </View>
                                            <Text style={[styles.welcomeTitle, { color: '#fff' }]}>
                                                {t('help.welcomeTitle')}
                                            </Text>
                                            <Text style={[styles.welcomeText, { color: '#fff' }]}>
                                                {t('help.welcomeText')}
                                            </Text>
                                        </View>
                                    </View>
                                </ImageBackground>
                            </View>
                        </Animated.View>

                        {/* FAQ Section */}
                        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <View style={[styles.section, { paddingTop: 10 }]}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    {t('help.faq')}
                                </Text>
                                {faqs.map((faq, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.faqCard, { backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}EE`, borderColor: theme === 'dark' ? colors.borderLight : colors.borderDark }, theme !== 'dark' ? styles.cardShadow : undefined]}
                                        onPress={() => toggleFaq(index)}
                                    >
                                        <View style={styles.faqHeader}>
                                            <Text style={[styles.faqQuestion, { color: colors.text }]}>
                                                {faq.question}
                                            </Text>
                                            <Ionicons
                                                name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                                                size={20}
                                                color={colors.textSecondary}
                                            />
                                        </View>
                                        {expandedFaq === index && (
                                            <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                                                {faq.answer}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Animated.View>

                        {/* Contact Methods */}
                        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <View style={[styles.section]}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    {t('help.contact')}
                                </Text>
                                {contactMethods.map((method, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.contactCard, { backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}EE`, borderColor: theme === 'dark' ? colors.borderLight : colors.borderDark }, theme !== 'dark' ? styles.cardShadow : undefined]}
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
                        </Animated.View>

                        {/* Quick Tips */}
                        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <View style={[styles.tipsCard, { backgroundColor: theme === 'dark' ? `${colors.card}50` : `${colors.card}EE`, borderColor: theme === 'dark' ? colors.borderLight : colors.borderDark }, theme !== 'dark' ? styles.cardShadow : undefined]}>
                                {/* <Ionicons name="bulb" size={24} color={colors.warning} /> */}
                                <View style={styles.tipsContent}>
                                    <Text style={[styles.tipsTitle, { color: colors.text }]}>
                                        {t('help.tips')}
                                    </Text>
                                    <View style={styles.tipItem}>
                                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                            {t('help.quickTips.tip1')}
                                        </Text>
                                    </View>
                                    <View style={styles.tipItem}>
                                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                            {t('help.quickTips.tip2')}
                                        </Text>
                                    </View>
                                    <View style={styles.tipItem}>
                                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                            {t('help.quickTips.tip3')}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    container: {
        flex: 1,
        paddingBottom: 0
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
    wellcomeCardContainer: {
        marginHorizontal: 16,
        borderRadius: 10,
        overflow: 'hidden',
    },
    welcomeCard: {
        // margin: 20,
        // borderRadius: 20,
        marginBottom: 20,
        padding: 10,
        alignItems: 'center'
    },
    iconContainer: {
        borderRadius: 100,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 10,
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
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 10,

    },
    faqCard: {
        padding: 8,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginBottom: 6,
        borderWidth: .5
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 12,
    },
    faqAnswer: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 12,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 6,
        borderRadius: 8,
        marginBottom: 6,
        borderWidth: .5
    },
    contactLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
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
        marginTop: 10,
        padding: 20,
        borderTopWidth: .5
    },
    tipsContent: {
        flex: 1,
        marginLeft: 12,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center'
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginLeft: 16,
        gap: 8,
    },
    tipText: {
        fontSize: 14,
        flex: 1,
    },
});