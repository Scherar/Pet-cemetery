import { LIMITS } from './config';

export type MediaKind = 'image' | 'video';

export function kindOf(mime: string): MediaKind | null {
  if ((LIMITS.imageTypes as readonly string[]).includes(mime)) return 'image';
  if ((LIMITS.videoTypes as readonly string[]).includes(mime)) return 'video';
  return null;
}

export interface UploadCheck { ok: boolean; error?: string }

export function checkUpload(
  file: { mime: string; size: number },
  existing: { images: number; videos: number },
): UploadCheck {
  const kind = kindOf(file.mime);
  if (!kind) return { ok: false, error: 'Dieses Dateiformat wird nicht unterstützt.' };
  if (file.size <= 0) return { ok: false, error: 'Die Datei ist leer.' };
  if (file.size > LIMITS.maxFileBytes) return { ok: false, error: 'Die Datei ist größer als 5 MB.' };
  if (kind === 'image' && existing.images >= LIMITS.maxImages) return { ok: false, error: 'Es sind höchstens 20 Bilder möglich.' };
  if (kind === 'video' && existing.videos >= LIMITS.maxVideos) return { ok: false, error: 'Es sind höchstens 4 Videos möglich.' };
  return { ok: true };
}

/** Dateityp anhand der ersten Bytes prüfen (nicht dem Browser-Typ vertrauen). */
export function sniffMime(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  const s = (o: number, n: number) => String.fromCharCode(...b.slice(o, o + n));
  if (s(0, 4) === 'RIFF' && s(8, 4) === 'WEBP') return 'image/webp';
  if (s(4, 4) === 'ftyp') return 'video/mp4';
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return 'video/webm';
  return null;
}
