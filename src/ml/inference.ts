import * as tf from '@tensorflow/tfjs';
import { getModel, getLabels } from './model';
import { uriToInputTensor } from './preprocess';

export async function predictFromUri(uri: string) {
    const m = getModel();
    const input = await uriToInputTensor(uri, 224);
    const out = m.predict(input) as tf.Tensor; // [1, numClasses]
    // If your model already outputs probabilities, skip softmax
    const probs = tf.softmax(out);
    const values = await probs.data();
    input.dispose(); out.dispose(); probs.dispose();

    let bestIdx = 0, bestVal = -Infinity;
    values.forEach((v, i) => { if (v > bestVal) { bestVal = v; bestIdx = i; } });
    const labels = getLabels();
    return { label: labels[bestIdx] ?? `class_${bestIdx}`, confidence: bestVal, all: values };
}