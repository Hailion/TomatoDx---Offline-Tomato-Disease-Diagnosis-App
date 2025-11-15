// app/tomatodx/scan.tsx - Compact Scan Screen
import Colors from '@/constants/Colors';
import { getRecentDiagnoses } from '@/src/db/repository';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';


export default function ScanScreen() {
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    type RecentItem = {
    id: string;
    disease: string;
    date: string;
    confidence: number;
    };

    const [recentScans, setRecentScans] = useState<RecentItem[]>([]);
    const mapDiseaseNameToId = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('early') && nameLower.includes('blight')) return 'early_blight';
    if (nameLower.includes('late') && nameLower.includes('blight')) return 'late_blight';
    if (nameLower.includes('healthy')) return 'healthy';
    if (nameLower.includes('leaf') && nameLower.includes('mold')) return 'leaf_mold';
    if (nameLower.includes('septoria')) return 'septoria_leaf_spot';
    if (nameLower.includes('yellow') && nameLower.includes('curl')) return 'tomato_yellow_leaf_curl';
    if (nameLower.includes('target') && nameLower.includes('spot')) return 'target_spot';
    if (nameLower.includes('spider') && nameLower.includes('mite')) return 'spider_mites_two_spotted_spider_mites';
    if (nameLower.includes('mosaic')) return 'tomato_mosaic_virus';
    if (nameLower.includes('bacterial') && nameLower.includes('spot')) return 'bacterial_spot';
    return 'healthy';
    };

    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const colors = Colors[theme];

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const buttonScaleAnim = useRef(new Animated.Value(0.9)).current;



    const startAnimations = () => {
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        scaleAnim.setValue(0.8);
        buttonScaleAnim.setValue(0.9);

        Animated.stagger(150, [
            Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
            ]),
            Animated.spring(buttonScaleAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
        ]).start();
        };
        const loadRecentScans = () => {
  try {
    const dbDiagnoses = getRecentDiagnoses(3);
    const formatted = dbDiagnoses.map((d: any) => {
      const confidence = Math.round((d.confidence || 0) * 100);
      const diseaseId = mapDiseaseNameToId(d.nameEn || 'Unknown');

      const diseaseName = t(`diseases.${diseaseId}.name`, {
        lng: 'en',
        defaultValue: d.nameEn || 'Unknown',
      });

      const date = new Date(d.diagnosedAt).toLocaleDateString();

      return {
        id: d.diagnosisId,
        disease: diseaseName,
        date,
        confidence,
      };
    });

    setRecentScans(formatted);
  } catch (error) {
    console.error('Error loading recent scans:', error);
    setRecentScans([]);
  }
};

        useFocusEffect(
        useCallback(() => {
            startAnimations();
             ImagePicker.getCameraPermissionsAsync().then(({ status }) => {
                if (status === 'denied') {
                    setHasCameraPermission(false);
                } else if (status === 'granted') {
                    setHasCameraPermission(true);
                } else {
                    setHasCameraPermission(null); // not decided yet
                }
                });

                loadRecentScans();
        }, [])
        );    

   

const handleCameraWithCrop = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      setHasCameraPermission(false);
      Alert.alert(t('scan.permissionDenied'), t('scan.cameraPermissionDesc'));
      return;
    }

    setHasCameraPermission(true);

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: '/tomatodx/preview',
        params: { uri: result.assets[0].uri },
      });
    }
  } catch (error) {
    console.error('Camera error:', error);
    Alert.alert(t('scan.error'), t('scan.captureError'));
  }
};

    const handleGallery = async () => {
        try {
            // Request media library permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    t('scan.permissionDenied'),
                    t('scan.galleryPermissionDesc')
                );
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
                router.push({
                    pathname: '/tomatodx/preview',
                    params: { uri: result.assets[0].uri }
                });
            }
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert(t('scan.error'), t('scan.galleryError'));
        }
    };
if (hasCameraPermission === false) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={colors.muted} />
        <Text style={[styles.permissionTitle, { color: colors.text }]}>
          {t('scan.cameraPermission')}
        </Text>
        <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
          {t('scan.cameraPermissionDesc')}
        </Text>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: colors.primary }]}
          onPress={handleCameraWithCrop}
        >
          <Text style={styles.permissionButtonText}>
            {t('scan.grantPermission')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
else{
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                    style={styles.scanHome}
                    contentContainerStyle={styles.scanHomeContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Compact Header */}
                    <Animated.View style={[styles.scanHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={[styles.logoContainer, { backgroundColor: colors.primaryOverlay }]}>
                            <Ionicons name="camera" size={28} color={colors.primary} />
                        </View>
                        <Text style={[styles.scanTitle, { color: colors.text }]}>
                            {t('scan.title')}
                        </Text>
                        <Text style={[styles.scanSubtitle, { color: colors.textSecondary }]}>
                            {t('scan.subtitle')}
                        </Text>
                    </Animated.View>

                    {/* Compact Action Buttons - Side by Side */}
                    <Animated.View style={[styles.actionButtons, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.card }]}
                            onPress={handleCameraWithCrop}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                                <Ionicons name="camera" size={38} color="#fff" />
                            </View>
                            <Text style={[styles.actionButtonTitle, { color: colors.text }]}>
                                {t('scan.takePhoto')}
                            </Text>
                            <Text style={[styles.actionButtonDesc, { color: colors.textSecondary }]}>
                                {t('scan.takePhotoDesc')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.card}]}
                            onPress={handleGallery}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                                <Ionicons name="images" size={36} color="#fff" />
                            </View>
                            <Text style={[styles.actionButtonTitle, { color: colors.text }]}>
                                {t('scan.chooseGallery')}
                            </Text>
                            <Text style={[styles.actionButtonDesc, { color: colors.textSecondary }]}>
                                {t('scan.chooseGalleryDesc')}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Quick Tips - More Compact */}
                    <Animated.View style={[styles.tips, { backgroundColor: colors.primaryOverlay, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.tipsHeader}>
                            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
                            <Text style={[styles.tipsTitle, { color: colors.text }]}>
                                {t('scan.tips')}
                            </Text>
                        </View>
                        <View style={styles.tipsList}>
                            <View style={styles.tipItem}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                    {t('scan.tip1')}
                                </Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                    {t('scan.tip2')}
                                </Text>
                            </View>
                            <View style={styles.tipItem}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                                <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                                    {t('scan.tip3')}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Recent Activity Preview (Optional) */}
                    <Animated.View style={[styles.recentSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={[styles.recentTitle, { color: colors.text }]}>
                        {t('scan.recentScan')}
                    </Text>
                    <Text style={[styles.recentText, { color: colors.textSecondary }]}>
                        {t('scan.recentScanDesc')}
                    </Text>

                    {recentScans.length > 0 ? (
                        recentScans.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.recentItem, { backgroundColor: colors.card }]}
                            onPress={() => router.push(`/tomatodx/result?id=${item.id}`)}
                        >
                            <View>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                                {item.disease}
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                                {item.date}
                            </Text>
                            </View>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
                            {item.confidence}%
                            </Text>
                        </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>
                        {t('scan.noRecentScans', { defaultValue: 'No recent scans yet.' })}
                        </Text>
                    )}
                    </Animated.View>
                </ScrollView>
            </View>
    );
}
}

const styles = StyleSheet.create({
    permissionContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
permissionTitle: {
  fontSize: 22,
  fontWeight: '700',
  marginTop: 20,
  marginBottom: 8,
  textAlign: 'center',
},
permissionText: {
  fontSize: 14,
  textAlign: 'center',
  marginBottom: 30,
  lineHeight: 20,
},
permissionButton: {
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 12,
},
permissionButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
    container: {
        flex: 1,
    },
    scanHome: {
        flex: 1,
    },
    scanHomeContent: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    scanHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    scanTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    scanSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    actionButton: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    actionIcon: {
        width: 60,
        height: 60,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionButtonTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    actionButtonDesc: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    tips: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    tipsList: {
        gap: 8,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    tipText: {
        fontSize: 13,
        lineHeight: 18,
        flex: 1,
    },
    recentSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    recentTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    recentText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    recentItem: {
  width: '100%',
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
});