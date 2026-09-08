export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1ExecResult>;
  batch(statements: D1PreparedStatement[]): Promise<D1ExecResult[]>;
}

export interface D1PreparedStatement {
  bind(...params: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(col?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean }>;
  run(): Promise<{ success: boolean; meta: { changes: number; last_row_id: unknown } }>;
}

export interface D1ExecResult {
  success: boolean;
  meta: { duration: number; changes: number; last_row_id: unknown; rows_read: number; rows_written: number };
}

export interface DBUser {
  id: string;
  email: string;
  password: string;
  name: string | null;
  plan: string;
  usage_count: number;
  usage_limit: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;
  usage_reset_at: string | null;
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

interface CloudflareEnv {
  DB: D1Database;
}

let _db: D1Database | null = null;

export function getDb(env?: CloudflareEnv): D1Database {
  if (_db) return _db;
  if (env?.DB) {
    _db = env.DB;
    return _db;
  }
  throw new Error(
    "D1 database not available. Set the DB binding in your Cloudflare Pages configuration."
  );
}

export function setDb(db: D1Database) {
  _db = db;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    plan TEXT NOT NULL DEFAULT 'free',
    usage_count INTEGER NOT NULL DEFAULT 0,
    usage_limit INTEGER NOT NULL DEFAULT 5,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT NOT NULL DEFAULT 'none',
    usage_reset_at TEXT,
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

  CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    reset_at INTEGER NOT NULL
  );
`;

export async function ensureSchema(db: D1Database): Promise<void> {
  const statements = SCHEMA.split(";").filter((s) => s.trim());
  for (const stmt of statements) {
    await db.prepare(stmt.trim()).run();
  }
}
