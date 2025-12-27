// app/tomatodx/about.tsx - About Screen
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, FlatList, Image, ImageBackground, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function AboutScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const colors = Colors[theme];
    const [visible, setVisible] = useState(false);
    const { width: SCREEN_WIDTH } = Dimensions.get('window');
    const [currentDevIndex, setCurrentDevIndex] = useState(0);
    const devListRef = useRef<FlatList<any> | null>(null);

    // Admin unlock state
    const [tapCount, setTapCount] = useState(0);
    

    // Handle version tap for admin entry (no auto-unlock)
    const handleVersionTap = () => {
        const newCount = tapCount + 1;
        setTapCount(newCount);

        if (newCount === 6) {
            setVisible(true);
            setTapCount(0);
        } else if (newCount > 6) {
            setTapCount(0);
        }

        // Reset counter after 2 seconds of inactivity
        setTimeout(() => setTapCount(0), 2000);
    };

    const handleCancel = () => {
        setVisible(false);
        setTapCount(0);
    };

    const handleGoToAdmin = () => { setVisible(false); router.push('/admin' as any) }


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

    const features = [
        {
            icon: 'camera',
            title: t('about.featuresList.aiDetection.title'),
            description: t('about.featuresList.aiDetection.description')
        },
        {
            icon: 'speedometer',
            title: t('about.featuresList.instantResults.title'),
            description: t('about.featuresList.instantResults.description')
        },
        {
            icon: 'library',
            title: t('about.featuresList.scanHistory.title'),
            description: t('about.featuresList.scanHistory.description')
        },
        {
            icon: 'globe',
            title: t('about.featuresList.multiLanguage.title'),
            description: t('about.featuresList.multiLanguage.description')
        }
    ];

    const devTeam = [
    {
        name: t('about.teamMembers.mobileDevelopers.name'), 
        role: t('about.teamMembers.mobileDevelopers.role'),
        photo: require('../../assets/images/team/haileamlak.jpg'), // replace with real photo
        description: t('about.teamMembers.mobileDevelopers.description')
    },
    {
        name: t('about.teamMembers.aiEngineers.name'),
        role: t('about.teamMembers.aiEngineers.role'),
        photo: require('../../assets/images/team/habtamu.jpg'), // replace path
        description: t('about.teamMembers.aiEngineers.description')
    },
    {
        name: t('about.teamMembers.aiEngineers.name2'),
        role: t('about.teamMembers.aiEngineers.role'),
        photo: require('../../assets/images/team/kemal.jpg'), // replace path
        description: t('about.teamMembers.aiEngineers.description')
    },
    {
        name: t('about.teamMembers.agricultureExperts.name'),
        role: t('about.teamMembers.agricultureExperts.role'),
        photo: require('../../assets/images/team/admasu.jpg'), // replace path
        description: t('about.teamMembers.agricultureExperts.description')
    },
    {
        name: t('about.teamMembers.dataAnalyst.name'),
        role: t('about.teamMembers.dataAnalyst.role'),
        photo: require('../../assets/images/team/derara.jpg'), // replace path
        description: t('about.teamMembers.dataAnalyst.description')
    }
    ];

    useEffect(() => {
    if (devTeam.length === 0) return;

    const interval = setInterval(() => {
        setCurrentDevIndex((prev) => {
        const next = (prev + 1) % devTeam.length;
        devListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
        });
    }, 4000);

    return () => clearInterval(interval);
    }, [devTeam.length]);

 

    return (
         <ImageBackground
    source={require('../../assets/images/screenBg/about.jpg')}
    style={styles.backgroundImage}
    imageStyle={{ resizeMode: 'cover' }}
  >
    <View style={[styles.overlay, { backgroundColor:'rgba(0,0,0,0.9)'}]}>
        <View style={[styles.container, { backgroundColor:  theme === 'dark' ? `${colors.background}80` : `${colors.background}79`}]}>
            {/* Header */}
            <View style={[styles.header,{backgroundColor: theme === 'dark' ? `${colors.card}50` : `${colors.card}BB`,borderColor: theme === 'dark' ? colors.border : colors.borderDark}]}>
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
                    {t('about.title')}
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                {/* Hero Section */}
                <View style={[styles.heroCard, { backgroundColor:  theme === 'dark' ? `${colors.card}50` : `${colors.card}BB`,borderColor: theme === 'dark' ? colors.border : colors.borderDark}]}>
                    <View style={[styles.logo, { backgroundColor: colors.primaryOverlay,  outlineColor:theme === 'dark' ?'#FFF':'#000',   borderRadius:60 }]}>
                        {/* <Ionicons name="leaf" size={48} color={colors.primary} /> */}                        
                            <Image source={ require('../../assets/images/app/3.png')} style={{...styles.logoImage,borderWidth:theme === 'dark' ? 0:0.6, borderColor:theme === 'dark' ? "":'#0000009c',borderRadius: 60}} />
                    </View>
                    <Text style={[styles.appName, { color: colors.text }]}>
                        TomatoDx
                    </Text>
                    <Text style={[styles.tagline, { color: colors.text }]}>
                        {t('about.subtitle')}
                    </Text>
                    <TouchableOpacity
                        style={styles.versionTap}
                        onPress={handleVersionTap}
                    >
                        <Text style={[styles.version, { color: colors.textTertiary }]}>
                            {t('common.version')} {Constants.expoConfig?.version || '1.0.0'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Mission Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('about.mission')}
                    </Text>
                    <View style={[styles.missionCard, { backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}EE`,borderColor: theme === 'dark' ? colors.border : colors.borderDark }]}>
                        <Text style={[styles.missionText, { color: colors.textSecondary }]}>
                            {t('about.missiondesc')}
                        </Text>
                    </View>
                </View>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('about.features')}
                    </Text>

                    {features.map((feature, index) => (
                        <View
                            key={index}
                            style={[styles.featureCard, { backgroundColor:  theme === 'dark' ? `${colors.card}00` : `${colors.card}EE`,borderColor: theme === 'dark' ? colors.border : colors.borderDark }]}
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
                        {t('about.technology')}
                    </Text>
                    <View style={[styles.techCard, { backgroundColor:  theme === 'dark' ? `${colors.card}00` : `${colors.card}EE`,borderColor: theme === 'dark' ? colors.border : colors.borderDark }]}>
                        <View style={styles.techItem}>
                            <Ionicons name="hardware-chip" size={20} color={colors.primary} />
                            <Text style={[styles.techText, { color: colors.text }]}>
                                {t('about.techStack.tensorFlow')}
                            </Text>
                        </View>
                        <View style={styles.techItem}>
                            <Ionicons name="cellular" size={20} color={colors.primary} />
                            <Text style={[styles.techText, { color: colors.text }]}>
                                {t('about.techStack.reactNative')}
                            </Text>
                        </View>
                        <View style={styles.techItem}>
                            <Ionicons name="cloud" size={20} color={colors.primary} />
                            <Text style={[styles.techText, { color: colors.text }]}>
                                {t('about.techStack.computerVision')}
                            </Text>
                        </View>
                        <View style={styles.techItem}>
                            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                            <Text style={[styles.techText, { color: colors.text }]}>
                                {t('about.techStack.privacyFirst')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Team */}
                <View style={styles.teamSection}>
                <Text style={[styles.sectionTitle, { color: colors.text, textAlign: 'center' }]}>
                    {t('about.team')}
                </Text>

                {/* Dev team carousel – one per screen, swipe + auto-rotate */}
                {devTeam.length > 0 && (
                    <>
                    <FlatList
                        ref={devListRef}
                        data={devTeam}
                        keyExtractor={(_, index) => `dev-${index}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(event) => {
                        const index = Math.round(
                            event.nativeEvent.contentOffset.x / SCREEN_WIDTH
                        );
                        setCurrentDevIndex(index);
                        }}
                        renderItem={({ item }) => (
                      <View
                            style={[
                            styles.teamCardHorizontal,
                            { width: SCREEN_WIDTH - 42, backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}EE`,borderColor: theme === 'dark' ? colors.border : colors.borderDark },
                            ]}
                        >
                            
                            <Image source={item.photo} style={styles.teamAvatar} />
                            <View style={styles.teamContent}>
                                <Text style={[styles.teamName, { color: colors.text }]}>
                                {item.name}
                                </Text>
                                <Text style={[styles.teamRole, { color: colors.primary }]}>
                                {item.role}
                                </Text>
                                <Text style={[styles.teamDesc, { color: colors.textSecondary }]}>
                                {item.description}
                                </Text>
                            </View>
                        </View>
                        
                        )}
                        contentContainerStyle={{ paddingHorizontal: 0 }}
                        ItemSeparatorComponent={() => <View style={{ width:10 }} />}  // <-- gap
                    />

                    {/* Indicator dots under the carousel */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10, gap: 8 }}>
                        {devTeam.map((_, idx) => (
                        <View
                            key={idx}
                            style={{
                            width: idx === currentDevIndex ? 24 : 14,
                            height: 8,
                            borderRadius: 3,
                            backgroundColor:
                                idx === currentDevIndex ? colors.primary : colors.border,
                            }}
                        />
                        ))}
                    </View>
                    </>
                )}

                {/* Optional: keep the existing role/description cards, or remove if redundant
                {team.map((member, index) => (
                    <View
                    key={`role-${index}`}
                    style={[styles.teamCard, { backgroundColor: `${colors.card}99` }]}
                    >
                    <Text style={[styles.teamName, { color: colors.text }]}>
                        {member.title}
                    </Text>
                    <Text style={[styles.teamRole, { color: colors.primary }]}>
                        {member.role}
                    </Text>
                    <Text style={[styles.teamDesc, { color: colors.textSecondary }]}>
                        {member.description}
                    </Text>
                    </View>
                ))} */}
                </View>

                {/* Footer */}
                <View style={[styles.footer, { backgroundColor:   theme === 'dark' ? `${colors.card}50` : `${colors.card}EE`,borderColor: theme === 'dark' ? colors.primaryDark : colors.textSecondary }]}>
                    <Text style={[styles.footerText, { color: theme === 'dark' ? colors.primaryDark : colors.text }]}>
                        {t('about.footer.madeWith')}
                    </Text>
                    <Text style={[styles.copyright, { color: colors.textTertiary }]}>
                        {t('about.footer.copyright')}</Text>

                    <View style={styles.links}>
                        <TouchableOpacity
                            style={styles.link}
                        // onPress={() => Linking.openURL('https://tomatodx.com/privacy')}
                        >
                            <Text style={[styles.linkText, { color: colors.textSecondary}]}>
                                {t('about.footer.privacyPolicy')}
                            </Text>
                        </TouchableOpacity>
                        <Text style={[styles.linkSeparator, { color: colors.textTertiary }]}>
                            •
                        </Text>
                        <TouchableOpacity
                            style={styles.link}
                        // onPress={() => Linking.openURL('https://tomatodx.com/terms')}
                        >
                            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                                {t('about.footer.termsOfService')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Social Media Links */}
                    <View style={styles.socialLinks}>
                        <TouchableOpacity
                            style={[styles.socialLink, { backgroundColor: `${colors.card}60`,borderColor: theme === 'dark' ? colors.primaryDark : colors.textSecondary, borderWidth: .5 }]}
                        onPress={() => Linking.openURL('https://t.me/hailion')}
                        >
                            <Ionicons name="paper-plane" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.socialLink, { backgroundColor: `${colors.card}60`,borderColor: theme === 'dark' ? colors.primaryDark : colors.textSecondary, borderWidth: .5} ]}
                        onPress={() => Linking.openURL('https://github.com/haileamlak12')}
                        >
                            <Ionicons name="logo-github" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.socialLink, { backgroundColor: `${colors.card}60`,borderColor: theme === 'dark' ? colors.primaryDark : colors.textSecondary, borderWidth: .5} ]}
                        onPress={() => Linking.openURL('https://x.com/tomatodx')}
                        >
                            <Ionicons name="logo-twitter" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
                </Animated.View>
            </ScrollView>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={handleCancel}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={[styles.modalIcon, { backgroundColor: colors.background + '80' }]}>
                            <Text style={styles.modalEmoji}>
                                <Ionicons name="key" size={40} color={colors.primary} />
                            </Text>
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {t('about.modal.title')}
                        </Text>
                        <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                            {t('about.modal.subtitle')}
                        </Text>
                        <View style={styles.modalButtons}>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: colors.backgroundAlt }]}
                                onPress={handleCancel}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                                    {t('common.later')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonAdmin, { backgroundColor: colors.primary }]}
                                onPress={handleGoToAdmin}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                                    {t('about.modal.goToAdmin')} <Ionicons name="chevron-forward" size={16} color={colors.text}></Ionicons>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
        </View>
  </ImageBackground>
    );
}

// ... (styles remain the same, just remove theme conditionals)
const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
    container: {
        flex: 1,
        // paddingBottom:10
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        // paddingBottom: 10,
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
        marginBottom: 10,
        paddingBottom: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        // borderRadius:10,
        borderBottomWidth:.5
        },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        outlineWidth:.5
    },
    logoImage:{
        width:58,
        height:58,
        borderRadius:60,
        // borderColor: '#fff'
    },
    appName: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 4,
    },
    
    section: {
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    missionCard: {
        padding: 10,
        borderRadius: 8,
        borderWidth:.5       
    },
    missionText: {
        fontSize: 15,
        lineHeight: 20,
        textAlign: 'center',
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth:.5
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
        fontSize: 13,
        lineHeight: 20,
    },
    techCard: {
        padding: 10,
        borderRadius: 10,
        borderWidth:.5       
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
        padding: 10,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth:1
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
        textAlign: 'center',
    },
    footer: {
        paddingBottom: 30,
        marginTop:0,
        padding: 16,
        // borderRadius: 16,
        alignItems: 'center',
        borderTopWidth: 0.2
       
    },
    footerText: {
        fontSize: 16,
        textAlign: 'center',
    },
    copyright: {
        fontSize: 13,
        textAlign: 'center',
        margin: 10,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 10,
        padding: 10,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        borderColor: '#646464',
        borderWidth: 1,
    },
    modalIcon: {
        marginBottom: 16,
        width: 80,
        height: 80,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalEmoji: {
        fontSize: 48,
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
    modalDiseaseName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 24,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 8,
        width: '100%',
        marginTop:10
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#646464',
    },
    modalButtonAdmin: {
        backgroundColor: '#f3f4f6',
    },
    modalButtonDelete: {
        backgroundColor: '#ef4444',
    },
    modalButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },

    socialLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 8,
    },
    socialLink: {
        width: 80,
        height: 40,
        borderRadius: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    versionTap: {
        margin: 10,
        textDecorationLine:'underline',

    },
    version: {
        fontSize: 14,
        textDecorationLine:'underline'
    },
    teamCarousel: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 12,
},

teamSection: {
        padding: 10,
        paddingHorizontal:16    
    },

teamCardHorizontal: {
//   padding: 10,
  paddingBottom:20,
  borderRadius: 8,
  borderWidth:1,
  marginRight: 0,
  alignItems: 'center',
  overflow:'hidden' ,
    flex:1,
    flexDirection:'column',
    gap:8
  },
teamAvatar: {
    width: '100%',
    height:300,
    // borderRadius: 1000,
    // marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
},
teamContent:{
    flex:1,
    alignItems: 'center',
    padding:10
}
});