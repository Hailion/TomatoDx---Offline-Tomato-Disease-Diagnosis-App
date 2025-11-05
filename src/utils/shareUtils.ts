// shareUtils.ts - Sharing utilities
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';

export interface ShareData {
    primaryName: string;
    secondaryName?: string;
    confidence: number;
    advice: string;
    severity?: string;
    symptoms?: string[];
    treatment?: {
        immediate: string[];
        longTerm: string[];
    };
    preventionTips?: string[];
    description?: string;
}

export interface ShareOptions {
    resultData: ShareData;
    uri?: string;
    t: (key: string) => string;
    showToast: (message: string, type: 'success' | 'error' | 'warning', duration: number) => void;
}

export const handleShare = async (options: ShareOptions) => {
    const { resultData, uri, t, showToast } = options;

    try {
        if (!resultData || !uri) {
            showToast(t('result.noResultToShare'), 'warning', 3000);
            return;
        }

        if (!(await Sharing.isAvailableAsync())) {
            showToast(t('result.shareNotAvailable'), 'warning', 3000);
            return;
        }

        // Build comprehensive share text with detailed diagnosis information
        let shareText = `🍅 ${t('result.shareText')}\n\n`;

        // Disease Information
        shareText += `📋 ${t('result.disease')}: ${resultData.primaryName}${resultData.secondaryName ? ` (${resultData.secondaryName})` : ''}\n`;
        shareText += `📊 ${t('result.confidence')}: ${Math.round(resultData.confidence * 100)}%\n`;

        if (resultData.severity) {
            shareText += `⚡ ${t('result.severity') || 'Severity'}: ${resultData.severity}\n`;
        }

        if (resultData.description) {
            shareText += `📝 ${t('result.description') || 'Description'}: ${resultData.description}\n`;
        }

        shareText += `\n`;

        // Symptoms
        if (resultData.symptoms && resultData.symptoms.length > 0) {
            shareText += `👁️ ${t('common.symptoms') || 'Symptoms'}:\n`;
            resultData.symptoms.forEach((symptom, index) => {
                shareText += `  ${index + 1}. ${symptom}\n`;
            });
            shareText += `\n`;
        }

        // Immediate Treatment
        if (resultData.treatment?.immediate && resultData.treatment.immediate.length > 0) {
            shareText += `🚨 ${t('common.immediateActions') || 'Immediate Actions'}:\n`;
            resultData.treatment.immediate.forEach((action, index) => {
                shareText += `  ${index + 1}. ${action}\n`;
            });
            shareText += `\n`;
        }

        // Long-term Treatment
        if (resultData.treatment?.longTerm && resultData.treatment.longTerm.length > 0) {
            shareText += `🔄 ${t('common.longTermManagement') || 'Long-term Management'}:\n`;
            resultData.treatment.longTerm.forEach((action, index) => {
                shareText += `  ${index + 1}. ${action}\n`;
            });
            shareText += `\n`;
        }

        // Prevention Tips
        if (resultData.preventionTips && resultData.preventionTips.length > 0) {
            shareText += `🛡️ ${t('result.prevTips') || 'Prevention Tips'}:\n`;
            resultData.preventionTips.forEach((tip, index) => {
                shareText += `  ${index + 1}. ${tip}\n`;
            });
            shareText += `\n`;
        }

        // Recommendation
        shareText += `⚠️ ${t('result.recommendation')}: ${resultData.advice}\n\n`;

        // Footer
        const currentDate = new Date().toLocaleDateString();
        shareText += `📱 Diagnosed via TomatoDx App\n`;
        shareText += `📅 Date: ${currentDate}\n`;
        shareText += `\n⚠️ Note: This is an AI-based diagnosis. Please consult with agricultural experts for professional advice.`;

        // Strategy: Use platform-specific approaches for best results
        if (Platform.OS === 'ios') {
            // iOS: Try Share API with both image and text
            try {
                const shareOptions: any = {
                    message: shareText,
                    title: `${resultData.primaryName} - ${t('result.shareTitle')}` || t('common.shareDiagnosis'),
                };

                if (uri && (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('http://') || uri.startsWith('https://'))) {
                    shareOptions.url = uri;
                }

                const result = await Share.share(shareOptions);

                if (result.action === Share.sharedAction) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    showToast(t('result.shareSuccessful'), 'success', 2000);
                } else if (result.action === Share.dismissedAction) {
                    return;
                }
                return;
            } catch (iosShareError) {
                console.warn('iOS Share API failed, falling back:', iosShareError);
                // Fall through to expo-sharing
            }
        }

        // Android or iOS fallback: Share image with expo-sharing
        if (uri && (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('http://') || uri.startsWith('https://'))) {
            try {
                // Share image first
                await Sharing.shareAsync(uri, {
                    mimeType: 'image/jpeg',
                    dialogTitle: `${resultData.primaryName} - ${t('result.shareTitle')}` || t('common.shareDiagnosis'),
                    UTI: 'public.jpeg',
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // On Android, share text file after image
                if (Platform.OS === 'android') {
                    await shareTextFile(shareText, t);
                }
                return;
            } catch (imageShareError: any) {
                console.warn('Image sharing failed, sharing text instead:', imageShareError);
                await Share.share({
                    message: shareText,
                    title: t('result.shareTitle') || 'Share Diagnosis',
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } else {
            // No image URI, share text only
            await Share.share({
                message: shareText,
                title: t('result.shareTitle') || 'Share Diagnosis',
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    } catch (error: any) {
        console.error('Share error:', error);
        showToast(`${t('result.shareFailed')}: ${error?.message || t('common.unknownError')}`, 'error', 4000);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
};

const shareTextFile = async (shareText: string, t: (key: string) => string) => {
    const textFileName = `tomatodx-diagnosis-${Date.now()}.txt`;
    let textFileUri: string | null = null;

    try {
        const docPath = FileSystem.documentDirectory;
        if (docPath) {
            const dir = `${docPath}shares/`;
            await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => { });
            textFileUri = `${dir}${textFileName}`;
            await FileSystem.writeAsStringAsync(textFileUri, shareText);
        }
    } catch (fileErr) {
        console.warn('Could not create text file:', fileErr);
    }

    if (textFileUri) {
        setTimeout(async () => {
            try {
                await Sharing.shareAsync(textFileUri!, {
                    mimeType: 'text/plain',
                    dialogTitle: t('result.diagnosisDetails'),
                });

                // Clean up text file
                setTimeout(async () => {
                    try {
                        await FileSystem.deleteAsync(textFileUri!, { idempotent: true });
                    } catch { }
                }, 2000);
            } catch (textError) {
                console.warn('Text file sharing failed:', textError);
            }
        }, 400);
    }
};