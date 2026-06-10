import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const isPg = !!process.env.DATABASE_URL;

let pgPool: pg.Pool | null = null;
let sqliteDb: any = null;

if (isPg) {
  console.log('Connecting to PostgreSQL / Supabase...');
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  console.log('Connecting to local SQLite...');
  const dbPath = path.join(process.cwd(), 'database.sqlite');
  sqliteDb = new Database(dbPath, { verbose: console.log });
}

// Translate SQLite parameterized queries to PG parameterized queries
function translateQuery(sql: string, params: any): { text: string; values: any[] } {
  // If params is a single object (and not null, array, Date), treat as named parameters
  if (params && typeof params === 'object' && !Array.isArray(params) && !(params instanceof Date)) {
    const values: any[] = [];
    let index = 1;
    // Replace @name with $1, $2...
    const regex = /@([a-zA-Z0-9_]+)/g;
    const text = sql.replace(regex, (match, name) => {
      values.push(params[name]);
      return `$${index++}`;
    });
    return { text, values };
  } else {
    // Positional parameters
    let index = 1;
    const text = sql.replace(/\?/g, () => `$${index++}`);
    const values = Array.isArray(params) ? params : (params !== undefined ? [params] : []);
    return { text, values };
  }
}

class AsyncStatement {
  constructor(private sql: string) {}

  async all(...params: any[]): Promise<any[]> {
    if (isPg && pgPool) {
      const actualParams = params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0]) ? params[0] : params;
      const { text, values } = translateQuery(this.sql, actualParams);
      const res = await pgPool.query(text, values);
      return res.rows;
    } else {
      const stmt = sqliteDb.prepare(this.sql);
      const actualParams = params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0]) ? params[0] : params;
      if (Array.isArray(actualParams)) {
        return stmt.all(...actualParams);
      }
      return stmt.all(actualParams);
    }
  }

  async get(...params: any[]): Promise<any | undefined> {
    if (isPg && pgPool) {
      const actualParams = params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0]) ? params[0] : params;
      const { text, values } = translateQuery(this.sql, actualParams);
      const res = await pgPool.query(text, values);
      return res.rows[0];
    } else {
      const stmt = sqliteDb.prepare(this.sql);
      const actualParams = params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0]) ? params[0] : params;
      if (Array.isArray(actualParams)) {
        return stmt.get(...actualParams);
      }
      return stmt.get(actualParams);
    }
  }

  async run(...params: any[]): Promise<{ changes: number; lastInsertRowid?: any }> {
    if (isPg && pgPool) {
      const actualParams = params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0]) ? params[0] : params;
      const { text, values } = translateQuery(this.sql, actualParams);
      const res = await pgPool.query(text, values);
      return { changes: res.rowCount ?? 0 };
    } else {
      const stmt = sqliteDb.prepare(this.sql);
      const actualParams = params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0]) ? params[0] : params;
      let result;
      if (Array.isArray(actualParams)) {
        result = stmt.run(...actualParams);
      } else {
        result = stmt.run(actualParams);
      }
      return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
    }
  }
}

export const db = {
  prepare: (sql: string) => new AsyncStatement(sql),
  exec: async (sql: string) => {
    if (isPg && pgPool) {
      await pgPool.query(sql);
    } else {
      sqliteDb.exec(sql);
    }
  }
};

// Initialize database schema
async function initializeDb() {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        _id TEXT PRIMARY KEY,
        stt INTEGER,
        studentCode TEXT,
        status TEXT,
        course TEXT,
        name TEXT NOT NULL,
        attendance TEXT,
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

    // Dynamic columns for migration
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

    for (const col of columnsToAdd) {
      try {
        await db.exec(`ALTER TABLE students ADD COLUMN ${col};`);
      } catch (e: any) {
        // Ignore duplicate column errors
      }
    }

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

    for (const col of lessonColumnsToAdd) {
      try {
        await db.exec(`ALTER TABLE lessons ADD COLUMN ${col};`);
      } catch (e: any) {
        // Ignore duplicate column errors
      }
    }

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDb();

export default db;
