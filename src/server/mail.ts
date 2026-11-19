import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

/** Versand. Ohne Anbieter wird die Mail als Datei in storage/outbox abgelegt (nur Entwicklung). */
export async function sendMail(to: string, subject: string, text: string) {
  if (process.env.MAIL_PROVIDER_URL) {
    // [PLATZHALTER – EU-Mail-Anbieter anbinden]
    throw new Error('Mail-Anbieter noch nicht angebunden');
  }
  const dir = path.join(process.env.STORAGE_DIR ?? path.join(process.cwd(), 'storage'), 'outbox');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${Date.now()}-${crypto.randomUUID()}.json`), JSON.stringify({ to, subject, text }, null, 2));
}
