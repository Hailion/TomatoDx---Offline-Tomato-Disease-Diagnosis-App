// app/tomatodx/insights.tsx - Insights Screen
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getAnalyticsSummary, getLast7DaysCounts, getRecentDiagnoses } from '../../src/db/repository';

export default function InsightsScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const colors = Colors[theme];

    const [summary, setSummary] = useState<{ total: number; avgConfidence: number; healthyCount: number; topDisease: any | null }>({ total: 0, avgConfidence: 0, healthyCount: 0, topDisease: null });
    const [trend, setTrend] = useState<Array<{ day: string; count: number }>>([]);
    const [recent, setRecent] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

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
            setTrend(days);
        } catch (e) { }

        try {
            const rows = getRecentDiagnoses(5) as any[];
            setRecent(rows || []);
        } catch (e) { }
    };

    const barMax = Math.max(1, ...trend.map(d => d.count));

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>
                    {t('home.insights')}
                </Text>
                <View style={styles.placeholder} />
            </LinearGradient>

            {/* Summary Cards */}
            <View style={styles.cardsRow}>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardValue, { color: colors.text }]}>{summary.total}</Text>
                    <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>{t('home.totalScans')}</Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardValue, { color: colors.text }]}>{summary.avgConfidence}%</Text>
                    <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>{t('home.accuracy')}</Text>
                </View>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardValue, { color: colors.text }]}>{summary.healthyCount}</Text>
                    <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>{t('home.healthy')}</Text>
                </View>
            </View>

            {/* Top disease */}
            {summary.topDisease && (
                <View style={[styles.topDiseaseCard, { backgroundColor: colors.card }]}>
                    <Ionicons name="analytics-outline" size={20} color={colors.warning} />
                    <Text style={[styles.topDiseaseText, { color: colors.text }]}>
                        {summary.topDisease.nameEn || summary.topDisease.diseaseId}
                    </Text>
                    <Text style={[styles.topDiseaseCount, { color: colors.textTertiary }]}>
                        × {summary.topDisease.c}
                    </Text>
                </View>
            )}

            {/* 7-day trend */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Last 7 days</Text>
                <View style={[styles.trendCard, { backgroundColor: colors.card }]}>
                    <View style={styles.trendBars}>
                        {trend.map((d, idx) => (
                            <View key={idx} style={styles.trendBarWrap}>
                                <View style={[styles.trendBar, { height: Math.max(6, Math.round((d.count / barMax) * 80)), backgroundColor: colors.primary }]} />
                                <Text style={[styles.trendLabel, { color: colors.textTertiary }]}>
                                    {d.day.slice(5)}
                                </Text>
                            </View>
                        ))}
                        {trend.length === 0 && (
                            <Text style={{ color: colors.textTertiary }}>No data</Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Recent diagnoses */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('history.recentScans')}</Text>
                {recent.length === 0 && (
                    <Text style={{ color: colors.textTertiary }}>{t('history.noScans')}</Text>
                )}
                {recent.map((r) => (
                    <TouchableOpacity
                        key={r.diagnosisId}
                        style={[styles.recentItem, { backgroundColor: colors.card }]}
                        onPress={() => router.push({ pathname: '/tomatodx/result', params: { id: r.diagnosisId } } as any)}
                    >
                        <Ionicons name="leaf" size={18} color={colors.success} />
                        <View style={styles.recentContent}>
                            <Text style={[styles.recentTitle, { color: colors.text }]}>
                                {r.nameEn || r.diseaseId}
                            </Text>
                            <Text style={[styles.recentMeta, { color: colors.textTertiary }]}>
                                {new Date(r.diagnosedAt).toLocaleString()} • {(Math.round((r.confidence || 0) * 100))}%
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
        gap: 12,
        paddingHorizontal: 20,
        marginTop: 12,
    },
    card: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    cardValue: { fontSize: 20, fontWeight: '700' },
    cardLabel: { fontSize: 12 },

    topDiseaseCard: {
        marginHorizontal: 20,
        marginTop: 12,
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    topDiseaseText: { fontSize: 14, fontWeight: '700', flex: 1 },
    topDiseaseCount: { fontSize: 12 },

    section: { paddingHorizontal: 20, marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

    trendCard: { borderRadius: 12, padding: 16 },
    trendBars: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
    trendBarWrap: { alignItems: 'center' },
    trendBar: { width: 18, borderRadius: 6 },
    trendLabel: { fontSize: 10, marginTop: 6 },

    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    recentContent: { flex: 1 },
    recentTitle: { fontSize: 14, fontWeight: '600' },
    recentMeta: { fontSize: 12 },
});