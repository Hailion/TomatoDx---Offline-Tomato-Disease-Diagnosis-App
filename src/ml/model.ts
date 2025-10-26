import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

let model: tf.GraphModel | null = null;
let labels: string[] = [];

export async function initModel() {
    await tf.ready();

    // Model + weights bundled via Metro
    const modelJson = require('../../assets/models/tfjs/model.json');
    const modelWeights = require('../../assets/models/tfjs/weights.bin');
    model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));

    // Load labels from metadata.json
    const metadata = require('../../assets/models/tfjs/metadata.json');
    labels = metadata.labels || metadata.classes || [];
}

export function getModel() {
    if (!model) throw new Error('Model not loaded');
    return model;
}

export function getLabels() {
    return labels;
}