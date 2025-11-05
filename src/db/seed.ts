import { upsertModelMeta } from './repository';

export async function seedInitialData() {
    try {
        const metadata = require('../../assets/models/tfjs/metadata.json');
        const version = metadata?.modelVersion ?? 'v1';
        const exportedAt = metadata?.exportedAt ?? new Date().toISOString();
        const classes = metadata?.labels ?? metadata?.classes ?? [];
        upsertModelMeta(version, exportedAt, classes);
    } catch { }
}
