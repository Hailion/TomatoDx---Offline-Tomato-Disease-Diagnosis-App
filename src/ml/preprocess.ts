import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native'; // Side-effect import for initialization
import { toByteArray } from 'base64-js';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

export async function uriToInputTensor(uri: string, size = 224) {
    if (!uri) throw new Error('No image URI');

    try {
        await tf.ready();
        console.log('[preprocess.ts] Starting image preprocessing for:', uri);

        // 1) Aspect-preserving resize so the shorter side >= size
        let first;
        try {
            first = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: size } }],
                { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: false }
            );
            console.log('[preprocess.ts] First resize complete:', first.width, 'x', first.height);
        } catch (resizeError) {
            console.error('[preprocess.ts] First resize failed:', resizeError);
            throw new Error(`Image resize failed. Your device may have insufficient memory or the image format is not supported.`);
        }

        let resizedStep = first;
        if ((first.height ?? 0) < size) {
            // If height ended up smaller than target, resize by height instead
            try {
                resizedStep = await ImageManipulator.manipulateAsync(
                    uri,
                    [{ resize: { height: size } }],
                    { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: false }
                );
                console.log('[preprocess.ts] Second resize complete:', resizedStep.width, 'x', resizedStep.height);
            } catch (resizeError) {
                console.error('[preprocess.ts] Second resize failed:', resizeError);
                throw new Error(`Image resize failed. Your device may have insufficient memory.`);
            }
        }

        // 2) Center-crop to exactly size x size
        const w = resizedStep.width ?? size;
        const h = resizedStep.height ?? size;
        const cropX = Math.max(0, Math.floor((w - size) / 2));
        const cropY = Math.max(0, Math.floor((h - size) / 2));

        let cropped;
        try {
            cropped = await ImageManipulator.manipulateAsync(
                resizedStep.uri,
                [{ crop: { originX: cropX, originY: cropY, width: size, height: size } }],
                { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: false }
            );
            console.log('[preprocess.ts] Crop complete:', cropped.width, 'x', cropped.height);
        } catch (cropError) {
            console.error('[preprocess.ts] Crop failed:', cropError);
            throw new Error(`Image crop failed. Your device may have insufficient memory.`);
        }

        // 3) Read file and decode
        let file;
        try {
            file = await FileSystem.readAsStringAsync(cropped.uri, { encoding: 'base64' });
            console.log('[preprocess.ts] File read complete, size:', file.length, 'chars');
        } catch (fileError) {
            console.error('[preprocess.ts] File read failed:', fileError);
            throw new Error(`Failed to read image file. Check storage permissions and available space.`);
        }

        let raw;
        try {
            raw = new Uint8Array(toByteArray(file));
            console.log('[preprocess.ts] Base64 decode complete, bytes:', raw.length);
        } catch (decodeError) {
            console.error('[preprocess.ts] Base64 decode failed:', decodeError);
            throw new Error(`Failed to decode image data.`);
        }
        
        // 4) Decode JPEG to tensor
        let image;
        try {
            // Dynamic import for decodeJpeg (required for @tensorflow/tfjs-react-native)
            const { decodeJpeg } = await import('@tensorflow/tfjs-react-native');
            image = decodeJpeg(raw, 3); // [H,W,3] - RGB channels
            console.log('[preprocess.ts] JPEG decode complete, shape:', image.shape);
        } catch (jpegError) {
            console.error('[preprocess.ts] JPEG decode failed:', jpegError);
            throw new Error(`Failed to decode JPEG. Your Android version may not support this operation.`);
        }
        
        // 5) Normalize and prepare input tensor
        let input;
        try {
            // CRITICAL FIX: Teachable Machine normalizes to [-1, 1], not [0, 1]
            // Previous: .div(255) → [0, 1] range
            // Correct: .div(127.5).sub(1) → [-1, 1] range (matches Teachable Machine web demo)
            input = image.toFloat().div(127.5).sub(1).expandDims(0); // [1,size,size,3]
            console.log('[preprocess.ts] Normalization complete, input shape:', input.shape);
        } catch (normalizeError) {
            image.dispose();
            console.error('[preprocess.ts] Normalization failed:', normalizeError);
            throw new Error(`Failed to normalize image tensor.`);
        }
        
        // DEBUG: Log preprocessing details (can be removed after verification)
        // Note: Reading full tensor data can be slow for large tensors, so we do a small sample
        if (__DEV__) {
            try {
                const shape = input.shape;
                // Sample a small portion of the tensor instead of reading all data
                const sample = input.slice([0, 0, 0, 0], [1, 10, 10, 3]); // Sample 10x10 pixels
                const sampleData = await sample.data();
                const first10Pixels = Array.from(sampleData).slice(0, 10);
                const minVal = Math.min(...Array.from(sampleData));
                const maxVal = Math.max(...Array.from(sampleData));
                console.log('[preprocess.ts] Input tensor shape:', shape);
                console.log('[preprocess.ts] Normalization range (sample):', { min: minVal.toFixed(4), max: maxVal.toFixed(4) });
                console.log('[preprocess.ts] First 10 pixel values (sample):', first10Pixels.map(v => v.toFixed(4)));
                console.log('[preprocess.ts] Expected: values in [-1, 1] range');
                sample.dispose();
            } catch (debugErr) {
                console.warn('[preprocess.ts] Debug logging failed:', debugErr);
            }
        }
        
        image.dispose();
        return input;
    } catch (e: any) {
        console.error('[preprocess.ts] Preprocessing error details:', {
            message: e?.message,
            stack: e?.stack,
            error: String(e),
            uri: uri
        });
        
        // Re-throw with more context if it's already our custom error
        if (e?.message?.includes('device') || e?.message?.includes('memory') || e?.message?.includes('Android')) {
            throw e;
        }
        
        throw new Error(`Failed to preprocess image: ${e?.message || String(e)}. This may be due to device limitations or Android version compatibility.`);
    }
}