import crypto from 'node:crypto';
import sharp from 'sharp';
import { all, get, run } from './db';
import { saveFile, removeFile } from './storage';
import { hasAccess, type Subscription } from '@/lib/subscription';
import { checkUpload, sniffMime, kindOf } from '@/lib/limits';
import { nextSlot } from '@/lib/slots';
import type { GraveAccess, ModStatus, Viewer } from '@/lib/visibility';
import { canViewGrave } from '@/lib/visibility';

export interface GraveRow {
  id: number; user_id: number; name: string; species: string; breed: string | null; birth_date: string | null;
  death_date: string | null; memo: string | null; show_owner: number; owner_name: string | null;
  visibility: 'private' | 'link' | 'public'; clickable: number; show_photos: number; share_token: string; slot: number;
  main_media_id: number | null; remind: number; remind_email: string | null; remind_confirmed: number;
  remind_token: string | null; deactivated: number;
}
export interface MediaRow {
  id: number; grave_id: number; kind: 'image' | 'video'; mime: string; size: number; file: string; pin_file: string | null;
  caption: string | null; alt: string | null; status: ModStatus; mod_reason: string | null; sort: number;
}

export function userSub(userId: number): Subscription & { plan: string | null; paypalSubId: string | null } {
  const r = get<{ plan: string | null; status: Subscription['status']; paid_until: string | null; grace_until: string | null; paypal_sub_id: string | null }>(
    'SELECT * FROM subscriptions WHERE user_id = ?', userId);
  return { plan: r?.plan ?? null, status: r?.status ?? 'none', paidUntil: r?.paid_until ?? null, graceUntil: r?.grace_until ?? null, paypalSubId: r?.paypal_sub_id ?? null };
}
export const userHasAccess = (userId: number, now = new Date()) => hasAccess(userSub(userId), now);

export const accessOf = (g: GraveRow, now = new Date()): GraveAccess => ({
  visibility: g.visibility, clickable: !!g.clickable, showPhotos: !!g.show_photos, shareToken: g.share_token,
  ownerHasAccess: userHasAccess(g.user_id, now), deactivated: !!g.deactivated,
});

export const graveById = (id: number) => get<GraveRow>('SELECT * FROM graves WHERE id = ?', id);
export const gravesOfUser = (uid: number) => all<GraveRow>('SELECT * FROM graves WHERE user_id = ? ORDER BY id', uid);
export const mediaOfGrave = (gid: number) => all<MediaRow>('SELECT * FROM media WHERE grave_id = ? ORDER BY sort, id', gid);
export const mediaById = (id: number) => get<MediaRow>('SELECT * FROM media WHERE id = ?', id);

export function publicGraves(now = new Date()): GraveRow[] {
  return all<GraveRow>("SELECT * FROM graves WHERE visibility = 'public' AND deactivated = 0 ORDER BY id")
    .filter((g) => userHasAccess(g.user_id, now));
}

export interface GraveInput {
  name: string; species: string; breed?: string; birth_date?: string; death_date?: string; memo?: string;
  owner_name?: string; show_owner?: boolean;
}
export function createGrave(userId: number, i: GraveInput): number {
  const used = all<{ slot: number }>('SELECT slot FROM graves').map((r) => r.slot);
  const r = run(
    `INSERT INTO graves (user_id,name,species,breed,birth_date,death_date,memo,owner_name,show_owner,share_token,slot)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    userId, i.name, i.species, i.breed || null, i.birth_date || null, i.death_date || null, i.memo || null,
    i.owner_name || null, i.show_owner ? 1 : 0, crypto.randomBytes(18).toString('base64url'), nextSlot(used));
  return Number(r.lastInsertRowid);
}
export function updateGrave(id: number, i: GraveInput) {
  run(`UPDATE graves SET name=?,species=?,breed=?,birth_date=?,death_date=?,memo=?,owner_name=?,show_owner=? WHERE id=?`,
    i.name, i.species, i.breed || null, i.birth_date || null, i.death_date || null, i.memo || null,
    i.owner_name || null, i.show_owner ? 1 : 0, id);
}

export async function addMedia(graveId: number, file: { buf: Buffer; declaredMime: string }, caption?: string) {
  const existing = mediaOfGrave(graveId);
  const counts = { images: existing.filter((m) => m.kind === 'image').length, videos: existing.filter((m) => m.kind === 'video').length };
  const mime = sniffMime(file.buf.subarray(0, 16)) ?? '';
  const chk = checkUpload({ mime, size: file.buf.length }, counts);
  if (!chk.ok) return { ok: false as const, error: chk.error! };
  const kind = kindOf(mime)!;
  let stored: string; let pin: string | null = null; let storedMime = mime;
  if (kind === 'image') {
    // Neu kodieren: entfernt EXIF/Standortdaten und fehlerhafte Inhalte.
    const full = await sharp(file.buf).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    const pinBuf = await sharp(file.buf).rotate().resize(256, 256, { fit: 'cover', position: 'attention' }).webp({ quality: 80 }).toBuffer();
    stored = await saveFile(full, 'webp'); pin = await saveFile(pinBuf, 'webp'); storedMime = 'image/webp';
  } else {
    stored = await saveFile(file.buf, mime === 'video/webm' ? 'webm' : 'mp4');
  }
  const sort = existing.length ? Math.max(...existing.map((m) => m.sort)) + 1 : 0;
  const r = run('INSERT INTO media (grave_id,kind,mime,size,file,pin_file,caption,sort) VALUES (?,?,?,?,?,?,?,?)',
    graveId, kind, storedMime, file.buf.length, stored, pin, caption || null, sort);
  const id = Number(r.lastInsertRowid);
  const g = graveById(graveId)!;
  if (kind === 'image' && !g.main_media_id) run('UPDATE graves SET main_media_id = ? WHERE id = ?', id, graveId);
  return { ok: true as const, id };
}

export async function deleteMedia(m: MediaRow) {
  run('DELETE FROM media WHERE id = ?', m.id);
  run('UPDATE graves SET main_media_id = (SELECT id FROM media WHERE grave_id = ? AND kind = \'image\' ORDER BY sort LIMIT 1) WHERE id = ? AND main_media_id = ?', m.grave_id, m.grave_id, m.id);
  await removeFile(m.file); await removeFile(m.pin_file);
}

export function setModeration(m: MediaRow, status: ModStatus, adminId: number, reason?: string) {
  run('UPDATE media SET status = ?, mod_reason = ? WHERE id = ?', status, status === 'disabled' ? reason || null : null, m.id);
  run('INSERT INTO moderation_log (media_id, grave_id, admin_id, action, reason) VALUES (?,?,?,?,?)', m.id, m.grave_id, adminId, status, reason || null);
}

export interface CardData {
  id: number; name: string; species: string; breed: string | null; birth_date: string | null; death_date: string | null;
  memo: string | null; owner_name: string | null; pinUrl: string | null; media: { id: number; kind: string; caption: string | null; alt: string | null }[];
}

/** Karte für Betrachter: berücksichtigt Sichtbarkeit, Foto-Freigabe und Prüfstatus. */
export function cardFor(g: GraveRow, v: Viewer): CardData | null {
  const acc = accessOf(g);
  if (!canViewGrave(acc, v)) return null;
  const priv = v.isOwner || v.isAdmin;
  const media = mediaOfGrave(g.id).filter((m) => priv || (acc.showPhotos && m.status === 'approved'));
  const main = g.main_media_id ? media.find((m) => m.id === g.main_media_id && m.kind === 'image') : undefined;
  return {
    id: g.id, name: g.name, species: g.species, breed: g.breed, birth_date: g.birth_date, death_date: g.death_date, memo: g.memo,
    owner_name: g.show_owner ? g.owner_name : null,
    pinUrl: main ? `/api/media/${main.id}?v=pin${v.token ? `&t=${v.token}` : ''}` : null,
    media: media.map((m) => ({ id: m.id, kind: m.kind, caption: m.caption, alt: m.alt })),
  };
}
