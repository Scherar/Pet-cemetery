import path from 'node:path';
import fs from 'node:fs';

// node:sqlite wird zur Laufzeit geladen (nicht gebündelt). Für Livebetrieb: Postgres, Tausch nur hier.
type Db = import('node:sqlite').DatabaseSync;
const g = globalThis as unknown as { __db?: Db };

export function db(): Db {
  if (g.__db) return g.__db;
  const { DatabaseSync } = process.getBuiltinModule('node:sqlite') as typeof import('node:sqlite');
  const dir = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
  fs.mkdirSync(dir, { recursive: true });
  const d = new DatabaseSync(process.env.DB_FILE ?? path.join(dir, 'app.db'));
  d.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  d.exec(SCHEMA);
  // Migration älterer Datenbanken: Spalten für die E-Mail-Bestätigung. Bestehende Konten gelten als bestätigt.
  const cols = (d.prepare('PRAGMA table_info(users)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('email_verified_at')) {
    d.exec('ALTER TABLE users ADD COLUMN email_verified_at TEXT; ALTER TABLE users ADD COLUMN verify_sent_at TEXT;');
    d.exec("UPDATE users SET email_verified_at = datetime('now')");
  }
  g.__db = d;
  return d;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, pw_hash TEXT NOT NULL,
  email_verified_at TEXT, verify_sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS password_tokens (
  token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS email_tokens (
  token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS subscriptions (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT, status TEXT NOT NULL DEFAULT 'none', paid_until TEXT, grace_until TEXT, paypal_sub_id TEXT);
CREATE TABLE IF NOT EXISTS graves (
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, species TEXT NOT NULL, breed TEXT, birth_date TEXT, death_date TEXT, memo TEXT,
  show_owner INTEGER NOT NULL DEFAULT 0, owner_name TEXT,
  visibility TEXT NOT NULL DEFAULT 'private', clickable INTEGER NOT NULL DEFAULT 1, show_photos INTEGER NOT NULL DEFAULT 0,
  share_token TEXT NOT NULL UNIQUE, slot INTEGER NOT NULL, main_media_id INTEGER,
  remind INTEGER NOT NULL DEFAULT 0, remind_email TEXT, remind_confirmed INTEGER NOT NULL DEFAULT 0, remind_token TEXT,
  deactivated INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY, grave_id INTEGER NOT NULL REFERENCES graves(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, file TEXT NOT NULL, pin_file TEXT,
  caption TEXT, alt TEXT, status TEXT NOT NULL DEFAULT 'pending', mod_reason TEXT, sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS moderation_log (
  id INTEGER PRIMARY KEY, media_id INTEGER, grave_id INTEGER, admin_id INTEGER, action TEXT NOT NULL, reason TEXT,
  at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS reminders_sent (grave_id INTEGER NOT NULL, year INTEGER NOT NULL, PRIMARY KEY (grave_id, year));
CREATE TABLE IF NOT EXISTS webhook_events (id TEXT PRIMARY KEY, at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY, grave_id INTEGER NOT NULL, reason TEXT NOT NULL, at TEXT NOT NULL DEFAULT (datetime('now')));
`;

export type Row = Record<string, unknown>;
export const all = <T = Row>(sql: string, ...p: (string | number | null)[]) => db().prepare(sql).all(...p) as T[];
export const get = <T = Row>(sql: string, ...p: (string | number | null)[]) => db().prepare(sql).get(...p) as T | undefined;
export const run = (sql: string, ...p: (string | number | null)[]) => db().prepare(sql).run(...p);
