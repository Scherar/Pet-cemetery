import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { get, run } from './db';

const COOKIE = 'pc_session';
const SESSION_DAYS = 30;

export interface User { id: number; email: string; isAdmin: boolean }

export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}
export function verifyPassword(pw: string, stored: string): boolean {
  const [s, h] = stored.split(':');
  if (!s || !h) return false;
  const hash = crypto.scryptSync(pw, Buffer.from(s, 'hex'), 64);
  return crypto.timingSafeEqual(hash, Buffer.from(h, 'hex'));
}
const sha = (t: string) => crypto.createHash('sha256').update(t).digest('hex');
export const isAdminEmail = (email: string) =>
  (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  run('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?,?,?)', sha(token), userId, expires.toISOString());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const t = jar.get(COOKIE)?.value;
  if (t) run('DELETE FROM sessions WHERE token_hash = ?', sha(t));
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  const row = get<{ id: number; email: string; expires_at: string }>(
    'SELECT u.id, u.email, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?', sha(t));
  if (!row || new Date(row.expires_at) < new Date()) return null;
  return { id: row.id, email: row.email, isAdmin: isAdminEmail(row.email) };
}

export async function requireUser(): Promise<User> {
  const u = await currentUser();
  if (!u) throw new Response('Nicht angemeldet', { status: 401 });
  return u;
}
export async function requireAdmin(): Promise<User> {
  const u = await requireUser();
  if (!u.isAdmin) throw new Response('Keine Berechtigung', { status: 403 });
  return u;
}
