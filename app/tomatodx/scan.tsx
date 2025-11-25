// app/tomatodx/scan.tsx - Compact Scan Screen
import Colors from '@/constants/Colors';
import { getRecentDiagnoses } from '@/src/db/repository';
import { formatEthiopianDate } from '@/src/utils/ethiopianCalendar';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    const { t, i18n } = useTranslation();
    const colors = Colors[theme];

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const buttonScaleAnim = useRef(new Animated.Value(0.9)).current;
    const scanLineAnim = useRef(new Animated.Value(0)).current;

    const startAnimations = () => {
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        scaleAnim.setValue(0.8);
        buttonScaleAnim.setValue(0.9);
        scanLineAnim.setValue(0);

        Animated.stagger(150, [
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
            ]),
            Animated.spring(buttonScaleAnim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
        ]).start();
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 1,
                    duration: 1800,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 1800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const loadRecentScans = () => {
        try {
            const dbDiagnoses = getRecentDiagnoses(3);
            const formatted = dbDiagnoses.map((d: any) => {
                const confidence = Math.round((d.confidence || 0) * 100);
                const diseaseId = mapDiseaseNameToId(d.nameEn || 'Unknown');

                const diseaseNameEn = t(`diseases.${diseaseId}.name`, {
                    lng: 'en',
                    defaultValue: d.nameEn || 'Unknown',
                });
                const diseaseNameAm = t(`diseases.${diseaseId}.name`, {
                    lng: 'am',
                    defaultValue: d.nameAm || diseaseNameEn,
                });
                const diseaseName = i18n.language === 'am' ? diseaseNameAm : diseaseNameEn;

                const dateObj = new Date(d.diagnosedAt);
                const displayDate = i18n.language === 'am'
                    ? formatEthiopianDate(dateObj)
                    : dateObj.toLocaleDateString();

                return {
                    id: d.diagnosisId,
                    disease: diseaseName,
                    date: displayDate,
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
        <ImageBackground
  source={require('../../assets/images/screenBg/scan1.jpg')}
  style={styles.backgroundImage}
  imageStyle={{ resizeMode: 'cover' }}
>
  <View style={[styles.overlay, { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.77)' : 'rgba(0,0,0,0.87)' }]}>
   
        <View style={[styles.container, { backgroundColor:  theme === 'dark' ? `${colors.background}99` : `${colors.background}80` }]}>
            <ScrollView                    
                    showsVerticalScrollIndicator={false}
                >
                <View style={styles.scanHome}>
                    <View style={styles.scanHomeContent}>
                    {/* Compact Header */}
                    <Animated.View style={[styles.scanHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={[styles.logoContainer, { backgroundColor: theme === 'dark' ? colors.primaryOverlay : `${colors.primaryOverlay3}99` }]}>
                            <Ionicons name="camera" size={52} color={colors.primary} />
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
                            style={styles.actionButton}
                            onPress={handleCameraWithCrop}
                        >
                            <ImageBackground
                                source={require('../../assets/images/scan/takePhoto.jpg')}
                                style={styles.actionButtonBackground}
                                imageStyle={{ resizeMode: 'cover', borderRadius: 16 }}
                            >
                                {/* <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                                    <Ionicons name="camera" size={38} color="#fff" />
                                </View> */}
                                <View style={[styles.actionContentOverlay,{ backgroundColor: 'rgba(0,0,0,0.5)'}]}>
                                <Text style={[styles.actionButtonTitle, { color: '#fff' }]}>
                                    {t('scan.takePhoto')}
                                </Text>
                                <Text style={[styles.actionButtonDesc, { color: '#fff' }]}>
                                    {t('scan.takePhotoDesc')}
                                </Text>
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                        

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleGallery}
                        >
                            <ImageBackground
                                source={require('../../assets/images/scan/fromGallery.jpg')}
                                style={styles.actionButtonBackground}
                                imageStyle={{ resizeMode: 'cover', borderRadius: 16 }}
                            >
                                {/* <View style={[styles.actionIcon, { backgroundColor: colors.primary ,opacity: 0.5}]}>
                                    <Ionicons name="images" size={36} color="#fff" />
                                </View> */}
                                <View style={[styles.actionContentOverlay,{ backgroundColor: 'rgba(0,0,0,0.5)'}]}>
                                <Text style={[styles.actionButtonTitle, { color: '#fff' }]}>
                                    {t('scan.chooseGallery')}
                                </Text>
                                <Text style={[styles.actionButtonDesc, { color: '#fff' }]}>
                                    {t('scan.chooseGalleryDesc')}
                                </Text>
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Quick Tips - More Compact */}
                    <Animated.View style={[styles.tips, { backgroundColor: `${colors.card}70`, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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

                    <Animated.View style={[styles.guideSection, { backgroundColor: theme === 'dark'?`${colors.card}BB`:`${colors.card}70`, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                       <View style={[styles.imageContainer]}>
                            {/* <Ionicons name="camera" size={64} color={colors.primary} /> */}
                            <Image
                                source={theme === 'dark' ? require('../../assets/images/screenBg/scan1.jpg') : require('../../assets/images/scan/sample-tomato-leaf.jpg')}
                                style={styles.image}
                                resizeMode="cover"                              
                                height={300}
                            />      
                            {/* Scan frame overlay */}
                            <View style={styles.scanOverlay}>
                            <View style={styles.scanFrame}>
                                {/* Corner brackets */}
                                <View style={[styles.corner, styles.cornerTopLeft]} />
                                <View style={[styles.corner, styles.cornerTopRight]} />
                                <View style={[styles.corner, styles.cornerBottomLeft]} />
                                <View style={[styles.corner, styles.cornerBottomRight]} />
                                <View style={[styles.crossOverlay, {backgroundColor: `${colors.primary}60`}]}>
                                <View style={[styles.centerCross]}>
                                    <View style={[ styles.verticalBar]}/>
                                    <View style={[ styles.horizontalBar]}/>
                                </View>
                                </View>
                                {/* Animated scan line */}
                                <Animated.View
                                style={[
                                    styles.scanLine,
                                    {
                                    transform: [
                                        {
                                        translateY: scanLineAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 180], // adjust for frame height
                                        }),
                                        },
                                    ],
                                    },
                                ]}
                                />
                            </View>
                            </View>                      
                        </View>
                        <View style={[styles.guideTitleContainer,{backgroundColor: theme === 'dark'?`${colors.card}BB`:`${colors.card}70`}]}>
                        <Text style={[styles.guideTitle, { color: colors.text }]}>
                                {t('scan.alignGuide')}
                        </Text>
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
                            style={[styles.recentItem, { backgroundColor: `${colors.card}CC` }]}
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
                    </View>
                </View>
                </ScrollView>
            </View>
            </View>
            </ImageBackground>
    );
}
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
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
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    scanHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        flex:1,
        padding:10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: .5,
        borderColor: '#fff',
        borderRadius: 50,
        

    },
    logo: {
       borderRadius: 5,
       outlineWidth: 1,
       outlineColor: '#fff',
       outlineOffset: 3,
       outlineStyle: 'solid',
    //    overflow: 'hidden',
    width:"100%",
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
    actionContentOverlay: {
        flex:1,
        justifyContent:'center',
        height:"100%",
        borderRadius: 12,       
        alignItems: 'center',
    },
    actionButton: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        height: 150,
    },
    actionButtonBackground: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccccccc4',
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
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    actionButtonDesc: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 16,
        padding:6
    },
    tips: {
        padding: 16,
        borderTopRightRadius: 16,
        borderTopLeftRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ccccccc4',
        
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
    guideSection: {
        alignItems: 'center',
        borderBottomRightRadius:16,
        borderBottomLeftRadius:16,
        overflow:"hidden",
        borderWidth: 1,
        borderColor: '#ccccccc4',
    },
    imageContainer:{
         flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        width:"100%",
    },
    image:{
        width:"100%",
        borderRadius: 5,
    },

    guideTitleContainer:{
        flex:1,
        width:"100%",
        paddingVertical: 16,

    }    ,
    guideTitle: {
       fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    guideText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    scanOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
},

scanFrame: {
  width: '75%',
  aspectRatio: 1,
//   borderRadius: 12,
  borderColor: 'rgba(255,255,255,0.25)',
  borderWidth: 1,
  justifyContent: 'center',
  overflow: 'hidden',
},

corner: {
  position: 'absolute',
  width: 26,
  height: 26,
  borderColor: '#00ff88',
  borderWidth: 3,
},

cornerTopLeft: {
  top: 0,
  left: 0,
  borderRightWidth: 0,
  borderBottomWidth: 0,
},

cornerTopRight: {
  top: 0,
  right: 0,
  borderLeftWidth: 0,
  borderBottomWidth: 0,
},

cornerBottomLeft: {
  bottom: 0,
  left: 0,
  borderRightWidth: 0,
  borderTopWidth: 0,
},

cornerBottomRight: {
  bottom: 0,
  right: 0,
  borderLeftWidth: 0,
  borderTopWidth: 0,
},

crossOverlay: {
    position: 'relative',
    padding:40,
    margin:'auto',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:100,
    borderColor: '#ffffff82',
    borderWidth: 1,
    opacity: 0.8,

},
centerCross: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
},

verticalBar: {
    position:'absolute',
    width: 2,
    height: 50,
    backgroundColor: '#00ff88',
},

horizontalBar: {
    position:'absolute',
    width: 50,
    height: 2,
    backgroundColor: '#00ff88',
},
scanLine: {
  position: 'absolute',
  left: 0,
  right: 0,
  height: 3,
  backgroundColor: '#00ff88',
  opacity: 0.9,
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