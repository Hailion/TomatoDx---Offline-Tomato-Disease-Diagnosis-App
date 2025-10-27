import { db } from './schema';

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

export function upsertUser(userId: string, name?: string, nickname?: string) {
    run(
        `INSERT INTO User (userId, name, nickname) VALUES (?, ?, ?)
     ON CONFLICT(userId) DO UPDATE SET name=excluded.name, nickname=excluded.nickname`,
        [userId, name ?? null, nickname ?? null]
    );
}

export function insertImage(imageId: string, filePath: string, capturedAtISO: string, userId?: string) {
    run(
        `INSERT OR REPLACE INTO Image (imageId, filePath, capturedAt, userId) VALUES (?, ?, ?, ?)`,
        [imageId, filePath, capturedAtISO, userId ?? null]
    );
}

export function upsertDisease(diseaseId: string, nameEn?: string, nameAm?: string, symptoms?: string, advice?: string) {
    run(
        `INSERT INTO Disease (diseaseId, nameEn, nameAm, symptoms, advice) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(diseaseId) DO UPDATE SET
       nameEn=COALESCE(excluded.nameEn, Disease.nameEn),
       nameAm=COALESCE(excluded.nameAm, Disease.nameAm),
       symptoms=COALESCE(excluded.symptoms, Disease.symptoms),
       advice=COALESCE(excluded.advice, Disease.advice)`,
        [diseaseId, nameEn ?? null, nameAm ?? null, symptoms ?? null, advice ?? null]
    );
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
            ds.diseaseId, ds.nameEn, ds.nameAm
     FROM Diagnosis d
     JOIN Image i ON i.imageId = d.imageId
     JOIN Disease ds ON ds.diseaseId = d.diseaseId
     ORDER BY d.diagnosedAt DESC
     LIMIT ?`,
        [limit]
    );
}

export function upsertModelMeta(modelVersion: string, exportedAtISO?: string, classes?: string[]) {
    run(
        `INSERT INTO ModelMeta (modelVersion, exportedAt, classes) VALUES (?, ?, ?)
     ON CONFLICT(modelVersion) DO UPDATE SET exportedAt=excluded.exportedAt, classes=excluded.classes`,
        [modelVersion, exportedAtISO ?? null, classes ? JSON.stringify(classes) : null]
    );
}
