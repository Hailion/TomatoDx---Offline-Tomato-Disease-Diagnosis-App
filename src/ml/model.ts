import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

let model: tf.GraphModel | tf.LayersModel | null = null;
let labels: string[] = [];
let initialized = false;

export async function initModel() {
    if (initialized && model) return; // already loaded

    await tf.ready();
    // Try to ensure the best backend is selected
    try {
        // Prefer rn-webgl for performance; fall back to cpu if unavailable
        await tf.setBackend('rn-webgl');
        await tf.ready();
    } catch { }
    if (tf.getBackend() !== 'rn-webgl') {
        try {
            await tf.setBackend('cpu');
            await tf.ready();
        } catch { }
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

    initialized = true;
}

export function getModel() {
    if (!model) throw new Error('Model not loaded');
    return model;
}

export function getLabels() {
    return labels;
}