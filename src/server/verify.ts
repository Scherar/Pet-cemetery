import crypto from 'node:crypto';
import { get, run } from './db';
import { sendMail, mailConfigured } from './mail';
import { appUrl } from './paypal';

const sha = (t: string) => crypto.createHash('sha256').update(t).digest('hex');
const TOKEN_HOURS = 24;
const RESEND_SECONDS = 60;

/** Schickt die Bestätigungs-Mail. Höchstens eine pro Minute und Konto. Liefert false, wenn gedrosselt. */
export async function sendVerification(userId: number, email: string): Promise<boolean> {
  const u = get<{ verify_sent_at: string | null }>('SELECT verify_sent_at FROM users WHERE id = ?', userId);
  if (u?.verify_sent_at && Date.now() - new Date(u.verify_sent_at + 'Z').getTime() < RESEND_SECONDS * 1000) return false;
  const token = crypto.randomBytes(32).toString('base64url');
  run('DELETE FROM email_tokens WHERE user_id = ?', userId);
  run('INSERT INTO email_tokens (token_hash, user_id, expires_at) VALUES (?,?,?)', sha(token), userId,
    new Date(Date.now() + TOKEN_HOURS * 3600e3).toISOString());
  run("UPDATE users SET verify_sent_at = datetime('now') WHERE id = ?", userId);
  const link = `${appUrl()}/api/email/bestaetigen?token=${token}`;
  await sendMail(email, 'Bitte bestätigen Sie Ihre E-Mail-Adresse',
    `Guten Tag,\n\nbitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren:\n${link}\n\n` +
    `Der Link ist ${TOKEN_HOURS} Stunden gültig. Wenn Sie sich nicht registriert haben, können Sie diese Nachricht ignorieren.\n`);
  if (!mailConfigured() && process.env.NODE_ENV !== 'production') console.warn(`[mail] Bestätigungslink (nur Entwicklung): ${link}`);
  return true;
}

/** Löst den Link ein. Liefert true bei Erfolg. */
export function consumeVerification(token: string): boolean {
  const row = get<{ user_id: number; expires_at: string }>('SELECT user_id, expires_at FROM email_tokens WHERE token_hash = ?', sha(token));
  if (!row) return false;
  run('DELETE FROM email_tokens WHERE token_hash = ?', sha(token));
  if (new Date(row.expires_at) < new Date()) return false;
  run("UPDATE users SET email_verified_at = datetime('now') WHERE id = ?", row.user_id);
  return true;
}
