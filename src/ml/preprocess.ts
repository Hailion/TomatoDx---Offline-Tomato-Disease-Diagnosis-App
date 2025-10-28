import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { toByteArray } from 'base64-js';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

export async function uriToInputTensor(uri: string, size = 224) {
    if (!uri) throw new Error('No image URI');

    await tf.ready();

    // 1) Aspect-preserving resize so the shorter side >= size
    const first = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: size } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: false }
    );

    let resizedStep = first;
    if ((first.height ?? 0) < size) {
        // If height ended up smaller than target, resize by height instead
        resizedStep = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { height: size } }],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: false }
        );
    }

    // 2) Center-crop to exactly size x size
    const w = resizedStep.width ?? size;
    const h = resizedStep.height ?? size;
    const cropX = Math.max(0, Math.floor((w - size) / 2));
    const cropY = Math.max(0, Math.floor((h - size) / 2));

    const cropped = await ImageManipulator.manipulateAsync(
        resizedStep.uri,
        [{ crop: { originX: cropX, originY: cropY, width: size, height: size } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: false }
    );

    try {
        const file = await FileSystem.readAsStringAsync(cropped.uri, { encoding: 'base64' });
        const raw = new Uint8Array(toByteArray(file));
        const { decodeJpeg } = await import('@tensorflow/tfjs-react-native');
        const image = decodeJpeg(raw, 3); // [H,W,3]
        const input = image.toFloat().div(255).expandDims(0); // [1,size,size,3]
        image.dispose();
        return input;
    } catch (e: any) {
        throw new Error(`Failed to preprocess image: ${e?.message || e}`);
    }
}