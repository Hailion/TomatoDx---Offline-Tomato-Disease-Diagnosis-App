import { open } from 'react-native-quick-sqlite';

export const db = open({ name: 'tomatodx.db' });

export function initDb() {
  db.execute('PRAGMA foreign_keys = ON;');

  db.execute(`CREATE TABLE IF NOT EXISTS User (
    userId TEXT PRIMARY KEY,
    name TEXT,
    nickname TEXT
  );`);

  db.execute(`CREATE TABLE IF NOT EXISTS Image (
    imageId TEXT PRIMARY KEY,
    filePath TEXT NOT NULL,
    capturedAt TEXT NOT NULL,
    userId TEXT,
    FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE SET NULL
  );`);

  db.execute(`CREATE TABLE IF NOT EXISTS Disease (
    diseaseId TEXT PRIMARY KEY,
    nameEn TEXT,
    nameAm TEXT,
    symptoms TEXT,
    advice TEXT
  );`);

  db.execute(`CREATE TABLE IF NOT EXISTS Diagnosis (
    diagnosisId TEXT PRIMARY KEY,
    imageId TEXT NOT NULL,
    diseaseId TEXT NOT NULL,
    confidence REAL NOT NULL,
    diagnosedAt TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (imageId) REFERENCES Image(imageId) ON DELETE CASCADE,
    FOREIGN KEY (diseaseId) REFERENCES Disease(diseaseId) ON DELETE RESTRICT
  );`);

  db.execute(`CREATE TABLE IF NOT EXISTS ModelMeta (
    modelVersion TEXT PRIMARY KEY,
    exportedAt TEXT,
    classes TEXT
  );`);

  // Create default device user if not exists
  db.execute(`INSERT OR IGNORE INTO User (userId, name, nickname) VALUES ('device', 'Device User', 'User');`);
}
