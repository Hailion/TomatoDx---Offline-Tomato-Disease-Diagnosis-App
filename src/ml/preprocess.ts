import { toByteArray } from 'base64-js';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
// If you know your URIs are JPEG, you can import { decodeJpeg } from '@tensorflow/tfjs-react-native';

export async function uriToInputTensor(uri: string, size = 224) {
    // Ensure 224x224 and JPEG to simplify decoding
    const { uri: resizedUri } = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: size, height: size } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: false }
    );

    const file = await FileSystem.readAsStringAsync(resizedUri, { encoding: 'base64' });
    const raw = new Uint8Array(toByteArray(file));
    const { decodeJpeg } = await import('@tensorflow/tfjs-react-native');
    const image = decodeJpeg(raw, 3); // [H,W,3]

    const input = image.toFloat().div(255).expandDims(0); // [1,224,224,3]
    image.dispose();
    return input;
}