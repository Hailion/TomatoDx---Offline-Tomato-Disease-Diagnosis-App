import * as tf from '@tensorflow/tfjs';
import { getLabels, getModel } from './model';
import { uriToInputTensor } from './preprocess';

export async function predictFromUri(uri: string) {
    const m = getModel();
    const input = await uriToInputTensor(uri, 224);

    // 1) Forward pass
    let out = m.predict(input) as tf.Tensor; // [1, numClasses] or [1, H, W, C] depending on model

    // 2) Ensure shape is [numClasses]
    try {
        if (out.shape.length > 2) {
            out = out.squeeze();
        } else if (out.shape.length === 2 && out.shape[0] === 1) {
            out = out.squeeze();
        }
    } catch { }

    // 3) Convert logits to probabilities if needed
    let probs = out;
    try {
        const raw = await probs.data();
        const vals = Array.from(raw as Iterable<number>);
        const sum = vals.reduce((a, b) => a + b, 0);
        const nonNegative = vals.every((v) => v >= 0);
        const approxProb = Math.abs(sum - 1) < 1e-3 && nonNegative;
        if (!approxProb) {
            const soft = tf.softmax(probs);
            probs.dispose?.();
            probs = soft as tf.Tensor;
        }
    } catch {
        // Fallback to softmax if reading failed
        try {
            const soft = tf.softmax(probs);
            probs.dispose?.();
            probs = soft as tf.Tensor;
        } catch { }
    }

    // 4) Read values and guard against NaNs/Infinities
    const values = Array.from(await probs.data());
    input.dispose(); out.dispose(); probs.dispose?.();

    if (!values.length || values.some((v) => !Number.isFinite(v))) {
        throw new Error('Invalid model output: non-finite probabilities.');
    }

    // 5) Argmax
    let bestIdx = 0, bestVal = -Infinity;
    values.forEach((v, i) => { if (v > bestVal) { bestVal = v; bestIdx = i; } });

    // 6) Labels mapping with validation
    const labels = getLabels();
    if (labels.length && labels.length !== values.length) {
        console.warn(`predictFromUri: labels length (${labels.length}) != output size (${values.length}).`);
    }

    return { label: labels[bestIdx] ?? `class_${bestIdx}`, confidence: bestVal, all: values };
}