import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    stt INTEGER,
    studentCode TEXT,
    status TEXT,
    course TEXT,
    name TEXT NOT NULL,
    attendance TEXT,
    phone TEXT,
    voiceType TEXT,
    rank TEXT,
    range TEXT,
    className TEXT,
    startDate TEXT,
    birthYear TEXT,
    online INTEGER DEFAULT 0,
    avatar TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
