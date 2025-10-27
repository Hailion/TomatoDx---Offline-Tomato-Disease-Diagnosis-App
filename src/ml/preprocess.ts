import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { toByteArray } from 'base64-js';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

export async function uriToInputTensor(uri: string, size = 224) {
    if (!uri) throw new Error('No image URI');

    await tf.ready();

    // Ensure 224x224 and JPEG to simplify decoding
    const { uri: resizedUri } = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: size, height: size } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: false }
    );

    try {
        const file = await FileSystem.readAsStringAsync(resizedUri, { encoding: 'base64' });
        const raw = new Uint8Array(toByteArray(file));
        const { decodeJpeg } = await import('@tensorflow/tfjs-react-native');
        const image = decodeJpeg(raw, 3); // [H,W,3]
        const input = image.toFloat().div(255).expandDims(0); // [1,224,224,3]
        image.dispose();
        return input;
    } catch (e: any) {
        throw new Error(`Failed to preprocess image: ${e?.message || e}`);
    }
}