import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import { db } from './schema';

export type SaveToDownloadsResult =
    | { ok: true; path: string }
    | { ok: false; error: string };

export async function saveToAndroidDownloads(
    fileName: string,
    data: string | object
): Promise<SaveToDownloadsResult> {
    try {
        // NOTE: On Android, access to the public Downloads directory depends on
        // OS version and Expo/runtime permissions. Modern Expo-managed apps
        // usually can write here, but production behavior may vary. When the
        // Downloads directory is not exposed (e.g. Expo Go, some emulators or
        // non-Android platforms), we gracefully fall back to app-internal
        // storage so the export still works.
        const downloadsDir = (FileSystem as any).downloadsDirectory as string | undefined;
        const appDir =
            ((FileSystem as any).documentDirectory as string | undefined) ||
            ((FileSystem as any).cacheDirectory as string | undefined);

        if (!downloadsDir && !appDir) {
            return {
                ok: false,
                error:
                    'Neither Downloads nor app storage directories are available on this platform or Expo runtime.',
            };
        }

        const baseDir = downloadsDir ?? appDir!;
        const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        const normalizedName = fileName.replace(/^\/+/, '');
        const fullPath = `${baseDir}${normalizedName}`;

        await FileSystem.writeAsStringAsync(fullPath, content);

        return { ok: true, path: fullPath };
    } catch (error: any) {
        return {
            ok: false,
            error:
                error?.message ??
                'Failed to write file to storage (Android Downloads or app storage; permissions/OS limitations).',
        };
    }
}

export function run(sql: string, params: any[] = []) {
    db.execute(sql, params);
}

export function getAll<T = any>(sql: string, params: any[] = []): T[] {
    const res = db.execute(sql, params);
    // react-native-quick-sqlite returns rows as an array on result.rows._array
    // but latest versions return result.rows as array directly; handle both
    // @ts-ignore
    const rows = (res && (res.rows?._array ?? res.rows)) || [];
    return rows as T[];
}

// Password hashing helpers (salted SHA-256 stored as "salt$hash" in the password column)
async function generateSalt(length = 16): Promise<string> {
    const bytes = (await Crypto.getRandomBytesAsync(length)) as Uint8Array;
    return Array.from(bytes)
        .map((b: number) => b.toString(16).padStart(2, '0'))
        .join('');
}

async function hashPassword(password: string, salt?: string): Promise<{ salt: string; hash: string }> {
    const actualSalt = salt ?? (await generateSalt());
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        actualSalt + password
    );
    return { salt: actualSalt, hash: digest };
}

function parseStoredPassword(stored?: string | null): { salt: string; hash: string } | null {
    if (!stored) return null;
    const parts = stored.split('$');
    if (parts.length !== 2) return null;
    const [salt, hash] = parts;
    if (!salt || !hash) return null;
    return { salt, hash };
}

export function upsertUser(userId: string, name?: string, nickname?: string) {
    run(
        `INSERT INTO User (userId, name, nickname) VALUES (?, ?, ?)
     ON CONFLICT(userId) DO UPDATE SET name=excluded.name, nickname=excluded.nickname`,
        [userId, name ?? null, nickname ?? null]
    );
}

export function getCurrentUser() {
    const rows = getAll<{ userId: string; name?: string; nickname?: string }>(
        `SELECT userId, name, nickname FROM User WHERE userId = ? LIMIT 1`,
        ['device']
    );
    return rows[0] ?? null;
}

export async function validateAdminPassword(inputPassword: string): Promise<boolean> {
    const rows = getAll<{ password?: string }>(
        `SELECT password FROM User WHERE userId = 'admin' LIMIT 1`
    );
    const stored = rows[0]?.password ?? null;
    if (!stored) return false;

    const parsed = parseStoredPassword(stored);

    // Legacy plaintext password: migrate to hashed format on successful match
    if (!parsed) {
        if (stored !== inputPassword) {
            return false;
        }

        const { salt, hash } = await hashPassword(inputPassword);
        run(`UPDATE User SET password = ? WHERE userId = 'admin'`, [`${salt}$${hash}`]);
        return true;
    }

    const { salt, hash } = parsed;
    const candidate = await hashPassword(inputPassword, salt);
    return candidate.hash === hash;
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<boolean> {
    const rows = getAll<{ password?: string }>(
        `SELECT password FROM User WHERE userId = 'admin' LIMIT 1`
    );
    const stored = rows[0]?.password ?? null;
    if (!stored) return false;

    const parsed = parseStoredPassword(stored);

    let currentMatches = false;

    if (!parsed) {
        // Legacy plaintext comparison
        currentMatches = stored === currentPassword;
    } else {
        const { salt, hash } = parsed;
        const candidate = await hashPassword(currentPassword, salt);
        currentMatches = candidate.hash === hash;
    }

    if (!currentMatches) {
        return false;
    }

    const { salt, hash } = await hashPassword(newPassword);
    run(`UPDATE User SET password = ? WHERE userId = 'admin'`, [`${salt}$${hash}`]);
    return true;
}

export function insertImage(imageId: string, filePath: string, capturedAtISO: string, userId?: string) {
    run(
        `INSERT OR REPLACE INTO Image (imageId, filePath, capturedAt, userId) VALUES (?, ?, ?, ?)`,
        [imageId, filePath, capturedAtISO, userId ?? null]
    );
}

export function upsertDisease(diseaseId: string, nameEn?: string, nameAm?: string, nameOro?: string, symptoms?: string, advice?: string, adviceAm?: string, adviceOro?: string) {
    run(
        `INSERT INTO Disease (diseaseId, nameEn, nameAm, nameOro, symptoms, advice, adviceAm, adviceOro) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(diseaseId) DO UPDATE SET
       nameEn=COALESCE(excluded.nameEn, Disease.nameEn),
       nameAm=COALESCE(excluded.nameAm, Disease.nameAm),
       nameOro=COALESCE(excluded.nameOro, Disease.nameOro),
       symptoms=COALESCE(excluded.symptoms, Disease.symptoms),
       advice=COALESCE(excluded.advice, Disease.advice),
       adviceAm=COALESCE(excluded.adviceAm, Disease.adviceAm),
       adviceOro=COALESCE(excluded.adviceOro, Disease.adviceOro)`,
        [diseaseId, nameEn ?? null, nameAm ?? null, nameOro ?? null, symptoms ?? null, advice ?? null, adviceAm ?? null, adviceOro ?? null]
    );
}

export function getAllDiseases() {
    return getAll<{ diseaseId: string; nameEn?: string; nameAm?: string; nameOro?: string; symptoms?: string; advice?: string; adviceAm?: string; adviceOro?: string }>(
        `SELECT diseaseId, nameEn, nameAm, nameOro, symptoms, advice, adviceAm, adviceOro FROM Disease ORDER BY diseaseId`
    );
}

export function getDiseaseById(diseaseId: string) {
    const rows = getAll<{ diseaseId: string; nameEn?: string; nameAm?: string; nameOro?: string; symptoms?: string; advice?: string; adviceAm?: string; adviceOro?: string }>(
        `SELECT diseaseId, nameEn, nameAm, nameOro, symptoms, advice, adviceAm, adviceOro FROM Disease WHERE diseaseId = ? LIMIT 1`,
        [diseaseId]
    );
    return rows[0] ?? null;
}

export function insertDiagnosis(diagnosisId: string, imageId: string, diseaseId: string, confidence: number, diagnosedAtISO: string, notes?: string) {
    run(
        `INSERT OR REPLACE INTO Diagnosis (diagnosisId, imageId, diseaseId, confidence, diagnosedAt, notes)
     VALUES (?, ?, ?, ?, ?, ?)` ,
        [diagnosisId, imageId, diseaseId, confidence, diagnosedAtISO, notes ?? null]
    );
}

export function getRecentDiagnoses(limit = 20) {
    return getAll(
        `SELECT d.diagnosisId, d.confidence, d.diagnosedAt,
            i.imageId, i.filePath, i.capturedAt,
            ds.diseaseId, ds.nameEn, ds.nameAm, ds.nameOro
     FROM Diagnosis d
     JOIN Image i ON i.imageId = d.imageId
     LEFT JOIN Disease ds ON ds.diseaseId = d.diseaseId
     ORDER BY d.diagnosedAt DESC
     LIMIT ?`,
        [limit]
    );
}

export function getDiagnosisCount() {
    const rows = getAll<{ count: number }>(`SELECT COUNT(*) as count FROM Diagnosis`);
    return rows[0]?.count ?? 0;
}

export function getDiagnosisById(diagnosisId: string) {
    const rows = getAll(
        `SELECT d.diagnosisId, d.confidence, d.diagnosedAt, d.notes,
            i.imageId, i.filePath, i.capturedAt,
            ds.diseaseId, ds.nameEn, ds.nameAm, ds.nameOro, ds.symptoms, ds.advice, ds.adviceAm, ds.adviceOro
         FROM Diagnosis d
         JOIN Image i ON d.imageId = i.imageId
         LEFT JOIN Disease ds ON d.diseaseId = ds.diseaseId
         WHERE d.diagnosisId = ?
         LIMIT 1`,
        [diagnosisId]
    );
    return rows[0] ?? null;
}

export function getDiagnosesPage(
    limit: number,
    offset: number,
    opts?: { search?: string; severity?: 'Low' | 'Medium' | 'High' }
) {
    const where: string[] = [];
    const params: any[] = [];

    if (opts?.search) {
        const q = `%${opts.search}%`;
        where.push('(ds.nameEn LIKE ? OR ds.nameAm LIKE ? OR ds.nameOro LIKE ? OR ds.diseaseId LIKE ? OR i.filePath LIKE ?)');
        params.push(q, q, q, q, q);
    }

    if (opts?.severity === 'Low') {
        where.push('d.confidence < 0.7');
    } else if (opts?.severity === 'Medium') {
        where.push('d.confidence >= 0.7 AND d.confidence < 0.9');
    } else if (opts?.severity === 'High') {
        where.push('d.confidence >= 0.9');
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `SELECT d.diagnosisId, d.confidence, d.diagnosedAt,
            i.imageId, i.filePath, i.capturedAt,
            ds.diseaseId, ds.nameEn, ds.nameAm, ds.nameOro
     FROM Diagnosis d
     JOIN Image i ON i.imageId = d.imageId
     LEFT JOIN Disease ds ON ds.diseaseId = d.diseaseId
     ${whereSql}
     ORDER BY d.diagnosedAt DESC
     LIMIT ? OFFSET ?`;

    return getAll(sql, [...params, limit, offset]);
}

export async function deleteDiagnosis(diagnosisId: string) {
    const imageRows = getAll<{ imageId: string; filePath: string }>(
        `SELECT i.imageId, i.filePath
         FROM Diagnosis d
         JOIN Image i ON i.imageId = d.imageId
         WHERE d.diagnosisId = ?
         LIMIT 1`,
        [diagnosisId]
    );

    const image = imageRows[0];

    // Always delete the diagnosis row itself
    run(`DELETE FROM Diagnosis WHERE diagnosisId = ?`, [diagnosisId]);

    if (!image) {
        return;
    }

    // Check if any other diagnoses still reference this image
    const remaining = getAll<{ count: number }>(
        `SELECT COUNT(*) as count FROM Diagnosis WHERE imageId = ?`,
        [image.imageId]
    );

    const remainingCount = remaining[0]?.count ?? 0;
    if (remainingCount > 0) {
        return;
    }

    // No more diagnoses reference this image: remove DB row and underlying file
    run(`DELETE FROM Image WHERE imageId = ?`, [image.imageId]);

    try {
        if (image.filePath) {
            await FileSystem.deleteAsync(image.filePath, { idempotent: true });
        }
    } catch (error) {
        console.error('Failed to delete image file for diagnosis cleanup:', error);
    }
}

export function updateDiagnosisNotes(diagnosisId: string, notes: string) {
    run(
        `UPDATE Diagnosis SET notes = ? WHERE diagnosisId = ?`,
        [notes, diagnosisId]
    );
}

export function getAllDiagnosesExport() {
    const sql = `SELECT d.diagnosisId, d.confidence, d.diagnosedAt, d.notes,
            i.imageId, i.filePath, i.capturedAt,
            ds.diseaseId, ds.nameEn, ds.nameAm, ds.nameOro
     FROM Diagnosis d
     JOIN Image i ON i.imageId = d.imageId
     LEFT JOIN Disease ds ON ds.diseaseId = d.diseaseId
     ORDER BY d.diagnosedAt DESC`;
    return getAll(sql, []);
}

// Lightweight helper for admin-info export button. It returns all diagnoses
// so the UI can decide how to persist/share them (e.g. write to a file).
// src/db/repository.ts
function buildAnalyticsExportContent(
    diagnoses: any[],
    format: 'json' | 'csv',
): string {
    if (format === 'csv') {
        if (!diagnoses.length) return '';

        const headers = Object.keys(diagnoses[0]);
        const escape = (value: any) => {
            if (value == null) return '';
            const str = String(value).replace(/"/g, '""');
            return /[",\n]/.test(str) ? `"${str}"` : str;
        };

        const rows = diagnoses.map(row =>
            headers.map(key => escape((row as any)[key])).join(',')
        );

        return [headers.join(','), ...rows].join('\n');
    }

    // default JSON
    return JSON.stringify(diagnoses, null, 2);
}

export async function exportAnalyticsData(
    format: 'json' | 'csv' = 'json',
    fileName?: string
) {
    try {
        const diagnoses = getAllDiagnosesExport();

        const safeFileName = (fileName && fileName.trim().length > 0)
            ? fileName.trim()
            : `analytics-${new Date().toISOString().split('T')[0]}`;
        const extension = format === 'csv' ? 'csv' : 'json';
        const content = buildAnalyticsExportContent(diagnoses, format);

        const result = await saveToAndroidDownloads(`${safeFileName}.${extension}`, content);

        if (!result.ok) {
            console.error('exportAnalyticsData error (Downloads):', result.error);
            return { success: false, error: result.error };
        }

        return { success: true, filePath: result.path };
    } catch (error: any) {
        console.error('exportAnalyticsData error:', error);
        return { success: false, error: error?.message ?? 'Unknown error' };
    }
}

export function upsertModelMeta(modelVersion: string, exportedAtISO?: string, classes?: string[]) {
    run(
        `INSERT INTO ModelMeta (modelVersion, exportedAt, classes) VALUES (?, ?, ?)
     ON CONFLICT(modelVersion) DO UPDATE SET exportedAt=excluded.exportedAt, classes=excluded.classes`,
        [modelVersion, exportedAtISO ?? null, classes ? JSON.stringify(classes) : null]
    );
}

export function getAnalyticsSummary() {
    const rows = getAll<{ avgConfidence: number; total: number; low: number; medium: number; high: number; healthyCount: number }>(
        `SELECT AVG(confidence) as avgConfidence,
                COUNT(*) as total,
                SUM(CASE WHEN confidence < 0.7 THEN 1 ELSE 0 END) as low,
                SUM(CASE WHEN confidence >= 0.7 AND confidence < 0.9 THEN 1 ELSE 0 END) as medium,
                SUM(CASE WHEN confidence >= 0.9 THEN 1 ELSE 0 END) as high,
                SUM(CASE WHEN d.diseaseId LIKE '%healthy%' THEN 1 ELSE 0 END) as healthyCount
         FROM Diagnosis d
         LEFT JOIN Disease ds ON ds.diseaseId = d.diseaseId`
    );
    const top = getAll<{ diseaseId: string; nameEn?: string; nameAm?: string; nameOro?: string; c: number }>(
        `SELECT d.diseaseId, ds.nameEn, ds.nameAm, ds.nameOro, COUNT(*) as c
         FROM Diagnosis d
         LEFT JOIN Disease ds ON ds.diseaseId = d.diseaseId
         GROUP BY d.diseaseId
         ORDER BY c DESC
         LIMIT 1`
    );
    return {
        ...(rows[0] ?? { avgConfidence: 0, total: 0, low: 0, medium: 0, high: 0, healthyCount: 0 }),
        topDisease: top[0] ?? null,
    };
}

export function getLast7DaysCounts() {
    return getAll<{ day: string; count: number }>(
        `SELECT date(diagnosedAt) as day, COUNT(*) as count
         FROM Diagnosis
         WHERE date(diagnosedAt) >= date('now','-6 days')
         GROUP BY date(diagnosedAt)
         ORDER BY day ASC`
    );
}

// Top N diseases by diagnosis count with percentage of total
export function getTopDiseases(limit = 5) {
    const totalRows = getAll<{ total: number }>(
        `SELECT COUNT(*) as total FROM Diagnosis`
    );
    const total = totalRows[0]?.total ?? 0;

    const rows = getAll<{
        diseaseId: string;
        nameEn?: string;
        nameAm?: string;
        nameOro?: string;
        count: number;
    }>(
        `SELECT d.diseaseId, ds.nameEn, ds.nameAm, ds.nameOro, COUNT(*) as count
         FROM Diagnosis d
         LEFT JOIN Disease ds ON ds.diseaseId = d.diseaseId
         GROUP BY d.diseaseId
         ORDER BY count DESC
         LIMIT ?`,
        [limit]
    );

    return rows.map((row) => ({
        ...row,
        percentage: total > 0 ? Number(((row.count * 100) / total).toFixed(1)) : 0,
    }));
}

// Monthly trends: total, healthy, and at-risk counts per month
export function getMonthlyTrends() {
    return getAll<{
        month: string;
        count: number;
        healthy: number;
        risk: number;
    }>(
        `SELECT strftime('%Y-%m', diagnosedAt) as month,
                COUNT(*) as count,
                SUM(CASE WHEN d.diseaseId LIKE '%healthy%' THEN 1 ELSE 0 END) as healthy,
                SUM(CASE WHEN d.diseaseId NOT LIKE '%healthy%' THEN 1 ELSE 0 END) as risk
         FROM Diagnosis d
         GROUP BY strftime('%Y-%m', diagnosedAt)
         ORDER BY month ASC`
    );
}

// Clear all analytics data (diagnoses); keep diseases and users intact
export async function clearAnalyticsData() {
    try {
        run(`DELETE FROM Diagnosis`, []);
        return true;
    } catch (error) {
        console.error('clearAnalyticsData error:', error);
        return false;
    }
}
