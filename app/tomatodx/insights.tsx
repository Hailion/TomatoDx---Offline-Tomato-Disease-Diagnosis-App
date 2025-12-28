// app/tomatodx/insights.tsx - Insights Screen
import Colors from '@/constants/Colors';
import { formatEthiopianDate } from '@/src/utils/ethiopianCalendar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getAnalyticsSummary, getLast7DaysCounts, getRecentDiagnoses } from '../../src/db/repository';

export default function InsightsScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t, i18n } = useTranslation();
    const colors = Colors[theme];

    const [summary, setSummary] = useState<{ total: number; avgConfidence: number; healthyCount: number; topDisease: any | null }>({ total: 0, avgConfidence: 0, healthyCount: 0, topDisease: null });
    const [trend, setTrend] = useState<{ day: string; count: number; date: Date }[]>([]);
    const [recent, setRecent] = useState<any[]>([]);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const cardsAnim = useRef(new Animated.Value(0)).current;
    const chartAnim = useRef(new Animated.Value(0)).current;
    const sectionsAnim = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            load();
            startAnimations();
        }, [])
    );

    const startAnimations = () => {
        fadeAnim.setValue(0);
        cardsAnim.setValue(0);
        chartAnim.setValue(0);
        sectionsAnim.setValue(0);

        Animated.stagger(150, [
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(cardsAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(chartAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(sectionsAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const load = () => {
        try {
            const s = getAnalyticsSummary();
            setSummary({
                total: s.total || 0,
                avgConfidence: Math.round((s.avgConfidence || 0) * 100),
                healthyCount: s.healthyCount || 0,
                topDisease: s.topDisease || null,
            });
        } catch (e) { }

        try {
            const days = getLast7DaysCounts();
            // Convert date strings to Date objects for proper formatting
            const daysWithDates = days.map(day => ({
                ...day,
                date: new Date(day.day) // Convert day string to Date object
            }));
            setTrend(daysWithDates);
        } catch (e) { }

        try {
            const rows = getRecentDiagnoses(5) as any[];
            setRecent(rows || []);
        } catch (e) { }
    };

    const barMax = Math.max(1, ...trend.map(d => d.count));

    return (
        <ImageBackground
            source={theme === 'dark' ? require('../../assets/images/screenBg/insights1.jpg') : require('../../assets/images/screenBg/insights.jpg')}
            style={styles.backgroundImage}
            imageStyle={{ resizeMode: 'cover' }}
        >
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>

                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme === 'dark' ? `${colors.background}80` : `${colors.background}79` }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {t('home.insights')}
                    </Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={[styles.container, { backgroundColor: theme === 'dark' ? `${colors.background}80` : `${colors.background}79` }]}>
                    {/* Summary Cards */}
                    <Animated.View style={[styles.cardsRow, { opacity: cardsAnim, transform: [{ scale: cardsAnim }] }]}>
                        <View style={[styles.card, { backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}CC`, borderColor: theme === 'dark' ? colors.borderLight : colors.borderDark }, theme !== 'dark' ? styles.cardShadow : undefined]}>
                            <Text style={[styles.cardValue, { color: colors.text }]}>{summary.total}</Text>
                            <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>{t('home.totalScans')}</Text>
                        </View>
                        <View style={[styles.card, { backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}CC`, borderColor: theme === 'dark' ? colors.borderLight : colors.borderDark }, theme !== 'dark' ? styles.cardShadow : undefined]}>
                            <Text style={[styles.cardValue, { color: colors.text }]}>{summary.avgConfidence}%</Text>
                            <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>{t('home.accuracy')}</Text>
                        </View>
                        <View style={[styles.card, { backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}CC`, borderColor: theme === 'dark' ? colors.borderLight : colors.borderDark }, theme !== 'dark' ? styles.cardShadow : undefined]}>
                            <Text style={[styles.cardValue, { color: colors.text }]}>{summary.healthyCount}</Text>
                            <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>{t('home.healthy')}</Text>
                        </View>
                    </Animated.View>

                    {/* Top disease */}
                    {summary.topDisease && (
                        <Animated.View style={[styles.topDiseaseCard, { backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}CC`, borderColor: theme === 'dark' ? colors.borderLight : colors.borderDark, opacity: chartAnim, transform: [{ translateY: Animated.multiply(chartAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }), 1) }] }, theme !== 'dark' ? styles.cardShadow : undefined]}>
                            <Ionicons name="analytics-outline" size={20} color={colors.warning} />
                            <Text style={[styles.topDiseaseText, { color: colors.text }]}>
                                {i18n.language === 'am'
                                    ? summary.topDisease.nameAm || summary.topDisease.nameEn || summary.topDisease.diseaseId
                                    : summary.topDisease.nameEn || summary.topDisease.diseaseId
                                }
                            </Text>
                            <Text style={[styles.topDiseaseCount, { color: colors.textTertiary }]}>
                                × {summary.topDisease.c}
                            </Text>
                        </Animated.View>
                    )}

                    {/* 7-day trend */}
                    <Animated.View style={[styles.section, { opacity: chartAnim, transform: [{ translateY: Animated.multiply(chartAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }), 1) }] }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.last7Days')}</Text>
                        <View style={[styles.trendCard, { backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}CC`, borderColor: theme === 'dark' ? colors.borderLight : colors.borderDark }, theme !== 'dark' ? styles.cardShadow : undefined]}>
                            <View style={styles.trendBars}>
                                {trend.map((d, idx) => (
                                    <View key={idx} style={styles.trendBarWrap}>
                                        <View style={[styles.trendBar, { height: Math.max(6, Math.round((d.count / barMax) * 80)), backgroundColor: colors.primary }]} />
                                        <Text style={[styles.trendLabel, { color: colors.textTertiary }]}>
                                            {i18n.language === 'am'
                                                ? formatEthiopianDate(d.date).split('፣')[0].split(' ')[0] // Just show day number in Ethiopian
                                                : d.date.getDate().toString() // Show day number in Gregorian
                                            }
                                        </Text>
                                    </View>
                                ))}
                                {trend.length === 0 && (
                                    <Text style={{ color: colors.textTertiary }}>{t('home.noData')}</Text>
                                )}
                            </View>
                        </View>
                    </Animated.View>

                    {/* Recent diagnoses */}
                    <Animated.View style={[styles.section, { opacity: sectionsAnim, transform: [{ translateY: Animated.multiply(sectionsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }), 1) }] }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('history.recentScans')}</Text>
                        {recent.length === 0 && (
                            <Text style={{ color: colors.textTertiary }}>{t('history.noScans')}</Text>
                        )}
                        {recent.map((r) => (
                            <TouchableOpacity
                                key={r.diagnosisId}
                                style={[styles.recentItem, { backgroundColor: theme === 'dark' ? `${colors.card}00` : `${colors.card}CC`, borderColor: theme === 'dark' ? colors.borderLight : colors.borderDark }]}
                                onPress={() => router.push({ pathname: '/tomatodx/result', params: { id: r.diagnosisId } } as any)}
                            >
                                <Ionicons name="leaf" size={18} color={colors.success} />
                                <View style={styles.recentContent}>
                                    <Text style={[styles.recentTitle, { color: colors.text }]}>
                                        {i18n.language === 'am'
                                            ? r.nameAm || r.nameEn || r.diseaseId
                                            : r.nameEn || r.diseaseId
                                        }
                                    </Text>
                                    <Text style={[styles.recentMeta, { color: colors.textTertiary }]}>
                                        {i18n.language === 'am'
                                            ? formatEthiopianDate(new Date(r.diagnosedAt))
                                            : new Date(r.diagnosedAt).toLocaleString()
                                        } • {Math.round((r.confidence || 0) * 100)}%
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                            </TouchableOpacity>
                        ))}
                    </Animated.View>
                </ScrollView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: { flex: 1 },
    overlay: { flex: 1 },
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
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: { padding: 8 },
    title: { fontSize: 20, fontWeight: '700' },
    placeholder: { width: 40 },

    cardsRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 20,
        marginTop: 12,
    },
    card: {
        flex: 1,
        borderRadius: 9,
        padding: 10,
        alignItems: 'center',
        borderWidth: .5
    },
    cardValue: { fontSize: 20, fontWeight: '700' },
    cardLabel: { fontSize: 12 },

    topDiseaseCard: {
        marginHorizontal: 20,
        marginTop: 12,
        borderRadius: 8,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: .5
    },
    topDiseaseText: { fontSize: 14, fontWeight: '700', flex: 1 },
    topDiseaseCount: { fontSize: 12 },

    section: { paddingHorizontal: 20, marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

    trendCard: { borderRadius: 8, padding: 8, borderWidth: .5 },
    trendBars: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
    trendBarWrap: { alignItems: 'center' },
    trendBar: { width: 18, borderRadius: 4 },
    trendLabel: { fontSize: 10, marginTop: 6 },

    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        borderRadius: 8,
        marginBottom: 4,
        borderWidth: .5
    },
    recentContent: { flex: 1 },
    recentTitle: { fontSize: 14, fontWeight: '600' },
    recentMeta: { fontSize: 12 },
});