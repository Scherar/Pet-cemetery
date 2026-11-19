import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

// Lokaler Speicher. Für Livebetrieb: S3-kompatibel (EU), Tausch nur hier.
const ROOT = path.join(process.cwd(), 'storage');

export async function saveFile(buf: Buffer, ext: string): Promise<string> {
  const name = `${crypto.randomUUID()}.${ext}`;
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(path.join(ROOT, name), buf);
  return name;
}
export async function readFile(name: string): Promise<Buffer> {
  if (!/^[\w-]+\.\w+$/.test(name)) throw new Error('Ungültiger Dateiname');
  return fs.readFile(path.join(ROOT, name));
}
export async function removeFile(name: string | null | undefined) {
  if (!name || !/^[\w-]+\.\w+$/.test(name)) return;
  await fs.rm(path.join(ROOT, name), { force: true });
}
