import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

export const mailConfigured = () => !!(process.env.SMTP_HOST && process.env.MAIL_FROM);

/**
 * Versand per SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM).
 * Ohne SMTP-Einstellungen wird die Mail nur als Datei in STORAGE_DIR/outbox abgelegt und der Betreff ins Protokoll
 * geschrieben (Entwicklung). Dann kommt KEINE Mail beim Empfänger an.
 */
export async function sendMail(to: string, subject: string, text: string) {
  if (mailConfigured()) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port, secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
    return;
  }
  const dir = path.join(process.env.STORAGE_DIR ?? path.join(process.cwd(), 'storage'), 'outbox');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${Date.now()}-${crypto.randomUUID()}.json`), JSON.stringify({ to, subject, text }, null, 2));
  console.warn(`[mail] SMTP nicht eingerichtet – Mail "${subject}" nur als Datei in ${dir} abgelegt (nicht versendet).`);
}
