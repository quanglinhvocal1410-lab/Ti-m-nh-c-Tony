import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath, { verbose: console.log });

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    _id TEXT PRIMARY KEY,
    stt INTEGER,
    studentCode TEXT,
    status TEXT,
    course TEXT,
    name TEXT NOT NULL,
    attendance TEXT, -- JSON string array
    phone TEXT,
    voiceType TEXT,
    rank TEXT,
    lowestNote TEXT,
    highestNote TEXT,
    className TEXT,
    startDate TEXT,
    birthYear TEXT,
    online INTEGER DEFAULT 0,
    avatar TEXT,
    voiceTest TEXT,
    driveLink TEXT,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    _id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'student',
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS lessons (
    _id TEXT PRIMARY KEY,
    studentId TEXT NOT NULL,
    date TEXT NOT NULL,
    so_buoi INTEGER,
    thoi_gian_luyen_thanh TEXT,
    thoi_gian_hat_bai TEXT,
    evaluations TEXT,
    diem_trung_binh REAL,
    xep_loai TEXT,
    diem_manh TEXT,
    diem_yeu TEXT,
    ghi_chu_ky_thuat TEXT,
    bai_tap_luyen_thanh TEXT,
    bai_hat_luyen TEXT,
    thoi_gian_luyen_hang_ngay TEXT,
    trong_tam TEXT,
    ky_thuat_can_day TEXT,
    muc_tieu TEXT,
    videoLink TEXT,
    teacherNotes TEXT,
    youtubeLink TEXT,
    score INTEGER,
    comparison TEXT,
    nextLessonPlan TEXT,
    courseGoal TEXT,
    songNotes TEXT,
    audios TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    FOREIGN KEY (studentId) REFERENCES students(_id)
  );
`);

// Try to add missing columns if they don't exist (for existing databases)
const columnsToAdd = [
  'lowestNote TEXT',
  'highestNote TEXT',
  'className TEXT',
  'startDate TEXT',
  'birthYear TEXT',
  'online INTEGER DEFAULT 0',
  'avatar TEXT',
  'voiceTest TEXT',
  'driveLink TEXT'
];

columnsToAdd.forEach(col => {
  try {
    db.exec(`ALTER TABLE students ADD COLUMN ${col};`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) {
      console.log(`Note: ${col} column might already exist or error:`, e.message);
    }
  }
});

const lessonColumnsToAdd = [
  'so_buoi INTEGER',
  'thoi_gian_luyen_thanh TEXT',
  'thoi_gian_hat_bai TEXT',
  'evaluations TEXT',
  'diem_trung_binh REAL',
  'xep_loai TEXT',
  'diem_manh TEXT',
  'diem_yeu TEXT',
  'ghi_chu_ky_thuat TEXT',
  'bai_tap_luyen_thanh TEXT',
  'bai_hat_luyen TEXT',
  'thoi_gian_luyen_hang_ngay TEXT',
  'trong_tam TEXT',
  'ky_thuat_can_day TEXT',
  'muc_tieu TEXT',
  'audios TEXT'
];

lessonColumnsToAdd.forEach(col => {
  try {
    db.exec(`ALTER TABLE lessons ADD COLUMN ${col};`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) {
      console.log(`Note: ${col} column might already exist or error:`, e.message);
    }
  }
});

export default db;
