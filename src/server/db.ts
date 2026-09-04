import Database from "better-sqlite3";
import path from "path";
import { existsSync, mkdirSync } from "fs";

const DB_PATH = path.join(process.cwd(), "data", "clipper.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  const dir = path.dirname(DB_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      usage_count INTEGER NOT NULL DEFAULT 0,
      usage_limit INTEGER NOT NULL DEFAULT 5,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      file_name TEXT NOT NULL,
      duration REAL NOT NULL,
      size INTEGER NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'upload',
      original_url TEXT,
      video_url TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clips (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      start_time REAL NOT NULL,
      end_time REAL NOT NULL,
      duration REAL NOT NULL,
      thumbnail TEXT DEFAULT '',
      file_path TEXT,
      video_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
    );
  `);

  return _db;
}

const db = new Proxy({} as Database.Database, {
  get(_, prop) {
    const target = getDb();
    const val = (target as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof val === "function") {
      return val.bind(target);
    }
    return val;
  },
});

export default db;

export interface DBUser {
  id: string;
  email: string;
  password: string;
  name: string | null;
  plan: string;
  usage_count: number;
  usage_limit: number;
  created_at: string;
  updated_at: string;
}

export interface DBVideo {
  id: string;
  name: string;
  file_name: string;
  duration: number;
  size: number;
  source: string;
  original_url: string | null;
  video_url: string;
  user_id: string;
  created_at: string;
}

export interface DBClip {
  id: string;
  title: string;
  start_time: number;
  end_time: number;
  duration: number;
  thumbnail: string;
  file_path: string | null;
  video_id: string;
  created_at: string;
}
