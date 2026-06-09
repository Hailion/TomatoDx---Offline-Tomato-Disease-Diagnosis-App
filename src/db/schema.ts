import { open } from 'react-native-quick-sqlite';

export const db = open({ name: 'tomatodx.db' });

export function initDb() {
  db.execute('PRAGMA foreign_keys = ON;');

  db.execute(`CREATE TABLE IF NOT EXISTS User (
    userId TEXT PRIMARY KEY,
    name TEXT,
    nickname TEXT,
    password TEXT
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
    nameOro TEXT,
    symptoms TEXT,
    advice TEXT,
    adviceAm TEXT,
    adviceOro TEXT
  );`);

  // Migration: Add new columns if they don't exist (for existing installs)
  try { db.execute('ALTER TABLE Disease ADD COLUMN nameOro TEXT'); } catch (e) { }
  try { db.execute('ALTER TABLE Disease ADD COLUMN adviceAm TEXT'); } catch (e) { }
  try { db.execute('ALTER TABLE Disease ADD COLUMN adviceOro TEXT'); } catch (e) { }

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

  // Create default admin user with a default password if not exists
  db.execute(`INSERT OR IGNORE INTO User (userId, name, nickname, password) VALUES ('admin', 'Admin', 'Admin', 'admin123');`);
}
