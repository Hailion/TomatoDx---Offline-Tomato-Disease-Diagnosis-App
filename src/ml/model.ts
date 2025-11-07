import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

let model: tf.GraphModel | tf.LayersModel | null = null;
let labels: string[] = [];
let initialized = false;

export async function initModel() {
    if (initialized && model) return; // already loaded

    try {
        await tf.ready();
        console.log('[model.ts] TensorFlow.js ready, current backend:', tf.getBackend());

        // Try to select the best backend for the device
        let backendSelected = false;

        // First try rn-webgl (requires OpenGL ES 3.0+, Android 6.0+)
        try {
            await tf.setBackend('rn-webgl');
            await tf.ready();
            backendSelected = true;
            console.log('[model.ts] Successfully initialized rn-webgl backend');
        } catch (webglError) {
            console.warn('[model.ts] rn-webgl backend not available:', webglError);
        }

        // Fall back to CPU backend (works on all Android versions)
        if (!backendSelected || tf.getBackend() !== 'rn-webgl') {
            try {
                await tf.setBackend('cpu');
                await tf.ready();
                console.log('[model.ts] Using CPU backend (compatible with all Android versions)');
            } catch (cpuError) {
                console.error('[model.ts] Failed to initialize CPU backend:', cpuError);
                throw new Error('Failed to initialize TensorFlow backend. Your device may not be supported.');
            }
        }

        console.log('[model.ts] Final backend:', tf.getBackend());
    } catch (error) {
        console.error('[model.ts] TensorFlow initialization failed:', error);
        throw new Error('Failed to initialize TensorFlow. Please ensure your device meets minimum requirements.');
    }

    const modelJson = require('../../assets/models/tfjs/model.json');
    const modelWeights = require('../../assets/models/tfjs/weights.bin');

    let lastErr: any;
    try {
        model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
    } catch (e: any) {
        lastErr = e;
    }
    if (!model) {
        try {
            model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
        } catch (e2: any) {
            throw new Error(`Failed to load model (graph and layers): ${String(e2?.message || lastErr)}`);
        }
    }

    try {
        // Load labels from metadata.json
        const metadata = require('../../assets/models/tfjs/metadata.json');
        labels = metadata.labels || metadata.classes || [];
    } catch {
        labels = [];
    }

    // Warm-up: run a dummy forward pass to initialize kernels/backends
    try {
        const warmupSize = 224;
        const warm = tf.zeros([1, warmupSize, warmupSize, 3]);
        const out = (model as any).predict(warm) as tf.Tensor;
        await out.data();
        warm.dispose();
        out.dispose();
    } catch { }

    if (!labels || labels.length === 0) {
        console.warn('model.ts: Labels not loaded from metadata.json; predictions will use class_{idx}.');
    }

    initialized = true;
}

export function getModel() {
    if (!model) throw new Error('Model not loaded');
    return model;
}

export function getLabels() {
    return labels;
}