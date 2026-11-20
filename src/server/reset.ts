import crypto from 'node:crypto';
import { get, run } from './db';
import { sendMail } from './mail';
import { appUrl } from './paypal';

const sha = (t: string) => crypto.createHash('sha256').update(t).digest('hex');
const TOKEN_MINUTES = 60;
const RESEND_SECONDS = 60;

/** Schickt den Link zum Zurücksetzen. Höchstens eine Mail pro Minute und Konto. */
export async function sendPasswordReset(userId: number, email: string): Promise<boolean> {
  const last = get<{ created_at: string }>('SELECT created_at FROM password_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', userId);
  if (last && Date.now() - new Date(last.created_at + 'Z').getTime() < RESEND_SECONDS * 1000) return false;
  const token = crypto.randomBytes(32).toString('base64url');
  run('DELETE FROM password_tokens WHERE user_id = ?', userId);
  run('INSERT INTO password_tokens (token_hash, user_id, expires_at) VALUES (?,?,?)', sha(token), userId,
    new Date(Date.now() + TOKEN_MINUTES * 60e3).toISOString());
  await sendMail(email, 'Passwort zurücksetzen',
    `Guten Tag,\n\nfür Ihr Konto wurde das Zurücksetzen des Passworts angefordert. Über diesen Link vergeben Sie ein neues Passwort:\n` +
    `${appUrl()}/passwort-neu?token=${token}\n\nDer Link ist ${TOKEN_MINUTES} Minuten gültig und nur einmal verwendbar. ` +
    `Wenn Sie das nicht angefordert haben, können Sie diese Nachricht ignorieren; Ihr Passwort bleibt dann unverändert.\n`);
  return true;
}

/** Ist der Link noch gültig? (verändert nichts) */
export function resetTokenValid(token: string): boolean {
  if (token.length < 20) return false;
  const row = get<{ expires_at: string }>('SELECT expires_at FROM password_tokens WHERE token_hash = ?', sha(token));
  return !!row && new Date(row.expires_at) > new Date();
}

/** Setzt das Passwort, entwertet den Link und meldet alle bestehenden Sitzungen ab. Liefert die E-Mail-Adresse oder null. */
export function consumeReset(token: string, newHash: string): string | null {
  if (!resetTokenValid(token)) return null;
  const row = get<{ user_id: number }>('SELECT user_id FROM password_tokens WHERE token_hash = ?', sha(token))!;
  run('UPDATE users SET pw_hash = ?, email_verified_at = COALESCE(email_verified_at, datetime(\'now\')) WHERE id = ?', newHash, row.user_id);
  run('DELETE FROM password_tokens WHERE user_id = ?', row.user_id);
  run('DELETE FROM sessions WHERE user_id = ?', row.user_id);
  return get<{ email: string }>('SELECT email FROM users WHERE id = ?', row.user_id)?.email ?? null;
}
