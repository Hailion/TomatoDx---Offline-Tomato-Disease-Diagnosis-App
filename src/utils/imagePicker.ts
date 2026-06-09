// imagePicker.ts - Image picker utilities
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
import { insertImage } from '../db/repository';
import { NavigationUtils } from './navigation';

export interface ImagePickerOptions {
    onSuccess?: (uri: string, imageId: string) => void;
    onError?: (message: string) => void;
    showToast?: (message: string, type: 'error' | 'success', duration: number) => void;
}

export const handleCameraCapture = async (options: ImagePickerOptions = {}) => {
    const { onSuccess, onError, showToast } = options;

    try {
        // Always request permission when camera button is clicked
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            const message = 'Camera permission is required';
            showToast?.(message, 'error', 4000);
            onError?.(message);
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            const imageId = uuidv4();
            insertImage(imageId, uri, new Date().toISOString(), undefined);

            if (onSuccess) {
                onSuccess(uri, imageId);
            } else {
                NavigationUtils.pushWithSuccess('/tomatodx/preview', { uri, imageId });
            }
        }
    } catch (error) {
        const message = 'Failed to open camera';
        showToast?.(message, 'error', 4000);
        onError?.(message);
    }
};

export const handleGalleryPicker = async (options: ImagePickerOptions = {}) => {
    const { onSuccess, onError, showToast } = options;

    try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            const message = 'Gallery permission is required';
            showToast?.(message, 'error', 4000);
            onError?.(message);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            const imageId = uuidv4();
            insertImage(imageId, uri, new Date().toISOString(), undefined);

            if (onSuccess) {
                onSuccess(uri, imageId);
            } else {
                NavigationUtils.pushWithSuccess('/tomatodx/preview', { uri, imageId });
            }
        }
    } catch (error) {
        const message = 'Failed to open gallery';
        showToast?.(message, 'error', 4000);
        onError?.(message);
    }
};