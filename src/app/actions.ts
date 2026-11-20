'use server';
import crypto from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { get, run } from '@/server/db';
import { createSession, destroySession, hashPassword, verifyPassword, currentUser, requireUser, requireAdmin } from '@/server/auth';
import { addMedia, createGrave, updateGrave, graveById, mediaById, deleteMedia, setModeration, userSub, userHasAccess } from '@/server/domain';
import { createSubscription, cancelSubscription } from '@/server/paypal';
import { addPeriod } from '@/lib/subscription';
import { PLANS, type PlanId } from '@/lib/config';
import { sendMail } from '@/server/mail';
import { sendVerification } from '@/server/verify';
import { cancelContract } from '@/server/cancel';
import { sendPasswordReset, consumeReset, resetTokenValid } from '@/server/reset';
import { appUrl } from '@/server/paypal';

const fail = (path: string, msg: string): never => redirect(`${path}${path.includes('?') ? '&' : '?'}fehler=${encodeURIComponent(msg)}`);
const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

export async function register(f: FormData) {
  const p = z.object({ email: z.string().email(), pw: z.string().min(10) }).safeParse({ email: str(f, 'email').toLowerCase(), pw: str(f, 'pw') });
  if (!p.success) fail('/registrieren', 'Bitte geben Sie eine gültige E-Mail-Adresse und ein Passwort mit mindestens 10 Zeichen an.');
  const { email, pw } = p.data!;
  const existing = get<{ id: number; email_verified_at: string | null }>('SELECT id, email_verified_at FROM users WHERE email = ?', email);
  if (existing?.email_verified_at) fail('/registrieren', 'Mit dieser E-Mail-Adresse besteht bereits ein Konto.');
  let id = existing?.id;
  // Ein noch unbestätigtes Konto behält sein ursprüngliches Passwort; es wird nur erneut eine Bestätigung geschickt.
  if (!id) id = Number(run('INSERT INTO users (email, pw_hash) VALUES (?,?)', email, hashPassword(pw)).lastInsertRowid);
  try { await sendVerification(id, email); }
  catch { fail('/registrieren/bestaetigen', 'Die E-Mail konnte gerade nicht gesendet werden. Bitte fordern Sie sie unten erneut an.'); }
  redirect('/registrieren/bestaetigen?gesendet=1');
}

/** Bestätigungs-Mail erneut senden. Antwort ist immer gleich, damit nicht ablesbar ist, welche Adressen registriert sind. */
export async function resendVerification(f: FormData) {
  const email = str(f, 'email').toLowerCase();
  const u = get<{ id: number; email_verified_at: string | null }>('SELECT id, email_verified_at FROM users WHERE email = ?', email);
  if (u && !u.email_verified_at) { try { await sendVerification(u.id, email); } catch { /* Fehler nicht preisgeben */ } }
  redirect('/registrieren/bestaetigen?gesendet=1');
}

export async function login(f: FormData) {
  const email = str(f, 'email').toLowerCase();
  const u = get<{ id: number; pw_hash: string; email_verified_at: string | null }>('SELECT id, pw_hash, email_verified_at FROM users WHERE email = ?', email);
  if (!u || !verifyPassword(str(f, 'pw'), u.pw_hash)) fail('/anmelden', 'E-Mail-Adresse oder Passwort stimmen nicht.');
  if (!u!.email_verified_at) fail('/anmelden?neu=1', 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Wir haben Ihnen dazu eine Nachricht geschickt.');
  await createSession(u!.id);
  redirect('/konto');
}

/** Link zum Zurücksetzen anfordern. Antwort ist immer gleich, damit nicht ablesbar ist, welche Adressen registriert sind. */
export async function requestPasswordReset(f: FormData) {
  const email = str(f, 'email').toLowerCase();
  const u = get<{ id: number; email_verified_at: string | null }>('SELECT id, email_verified_at FROM users WHERE email = ?', email);
  if (u) {
    try { if (u.email_verified_at) await sendPasswordReset(u.id, email); else await sendVerification(u.id, email); }
    catch { /* Fehler nicht preisgeben */ }
  }
  redirect('/passwort-vergessen?gesendet=1');
}

export async function setNewPassword(f: FormData) {
  const token = str(f, 'token');
  const back = `/passwort-neu?token=${encodeURIComponent(token)}`;
  if (!resetTokenValid(token)) redirect('/passwort-neu');
  const pw = str(f, 'pw');
  if (pw.length < 10) fail(back, 'Das Passwort braucht mindestens 10 Zeichen.');
  if (pw !== str(f, 'pw2')) fail(back, 'Die beiden Passwörter stimmen nicht überein.');
  const email = consumeReset(token, hashPassword(pw));
  if (!email) redirect('/passwort-neu');
  try { await sendMail(email, 'Ihr Passwort wurde geändert', 'Guten Tag,\n\nIhr Passwort wurde soeben geändert. Falls Sie das nicht waren, fordern Sie bitte sofort über „Passwort vergessen“ ein neues an und wenden Sie sich an uns.\n'); } catch { /* nicht kritisch */ }
  redirect('/anmelden?zurueckgesetzt=1');
}

export async function logout() { await destroySession(); redirect('/'); }

const graveSchema = z.object({
  name: z.string().min(1).max(80), species: z.string().min(1).max(60), breed: z.string().max(80).optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  death_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  memo: z.string().max(2000).optional(), owner_name: z.string().max(80).optional(),
});
function graveInput(f: FormData) {
  return graveSchema.safeParse({
    name: str(f, 'name'), species: str(f, 'species'), breed: str(f, 'breed'), birth_date: str(f, 'birth_date'),
    death_date: str(f, 'death_date'), memo: str(f, 'memo'), owner_name: str(f, 'owner_name'),
  });
}

async function ownGrave(id: number) {
  const u = await requireUser();
  const g = graveById(id);
  if (!g || (g.user_id !== u.id && !u.isAdmin)) redirect('/konto');
  return { u, g: g! };
}

export async function newGrave(f: FormData) {
  const u = await requireUser();
  if (!userHasAccess(u.id)) fail('/konto/abo', 'Für einen Gedenkort benötigen Sie ein aktives Abo.');
  const p = graveInput(f);
  if (!p.success) fail('/konto/grab/neu', 'Bitte füllen Sie Name und Tierart aus und prüfen Sie die Datumsangaben.');
  const id = createGrave(u.id, { ...p.data!, show_owner: f.get('show_owner') === 'on' });
  redirect(`/konto/grab/${id}`);
}

export async function saveGrave(f: FormData) {
  const id = Number(f.get('id'));
  const { g } = await ownGrave(id);
  const p = graveInput(f);
  if (!p.success) fail(`/konto/grab/${id}`, 'Bitte prüfen Sie Ihre Eingaben.');
  updateGrave(g.id, { ...p.data!, show_owner: f.get('show_owner') === 'on' });
  revalidatePath(`/konto/grab/${id}`);
  redirect(`/konto/grab/${id}?ok=1`);
}

export async function saveSharing(f: FormData) {
  const id = Number(f.get('id'));
  const { g } = await ownGrave(id);
  const vis = z.enum(['private', 'link', 'public']).parse(str(f, 'visibility'));
  run('UPDATE graves SET visibility = ?, clickable = ?, show_photos = ? WHERE id = ?', vis, f.get('clickable') === 'on' ? 1 : 0, f.get('show_photos') === 'on' ? 1 : 0, g.id);
  redirect(`/konto/grab/${id}?ok=1`);
}

export async function newShareToken(f: FormData) {
  const { g } = await ownGrave(Number(f.get('id')));
  run('UPDATE graves SET share_token = ? WHERE id = ?', crypto.randomBytes(18).toString('base64url'), g.id);
  redirect(`/konto/grab/${g.id}?ok=1`);
}

export async function uploadMedia(f: FormData) {
  const id = Number(f.get('id'));
  const { g } = await ownGrave(id);
  const files = f.getAll('files').filter((x): x is File => x instanceof File && x.size > 0);
  if (!files.length) fail(`/konto/grab/${id}`, 'Bitte wählen Sie eine Datei aus.');
  const errors: string[] = [];
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) { errors.push(`${file.name}: größer als 5 MB`); continue; }
    const r = await addMedia(g.id, { buf: Buffer.from(await file.arrayBuffer()), declaredMime: file.type }, str(f, 'caption'));
    if (!r.ok) errors.push(`${file.name}: ${r.error}`);
  }
  if (errors.length) fail(`/konto/grab/${id}`, errors.join(' · '));
  redirect(`/konto/grab/${id}?ok=1`);
}

export async function removeMedia(f: FormData) {
  const m = mediaById(Number(f.get('media')));
  if (!m) redirect('/konto');
  const { g } = await ownGrave(m!.grave_id);
  await deleteMedia(m!);
  redirect(`/konto/grab/${g.id}?ok=1`);
}

export async function setMainMedia(f: FormData) {
  const m = mediaById(Number(f.get('media')));
  if (!m || m.kind !== 'image') redirect('/konto');
  const { g } = await ownGrave(m!.grave_id);
  run('UPDATE graves SET main_media_id = ? WHERE id = ?', m!.id, g.id);
  redirect(`/konto/grab/${g.id}?ok=1`);
}

export async function saveAlt(f: FormData) {
  const m = mediaById(Number(f.get('media')));
  if (!m) redirect('/konto');
  const { g } = await ownGrave(m!.grave_id);
  run('UPDATE media SET caption = ?, alt = ? WHERE id = ?', str(f, 'caption') || null, str(f, 'alt') || null, m!.id);
  redirect(`/konto/grab/${g.id}?ok=1`);
}

export async function saveReminder(f: FormData) {
  const id = Number(f.get('id'));
  const { g } = await ownGrave(id);
  const email = str(f, 'remind_email').toLowerCase();
  if (!email) { run('UPDATE graves SET remind = 0, remind_confirmed = 0, remind_email = NULL WHERE id = ?', g.id); redirect(`/konto/grab/${id}?ok=1`); }
  if (!z.string().email().safeParse(email).success) fail(`/konto/grab/${id}`, 'Bitte geben Sie eine gültige E-Mail-Adresse an.');
  if (!g.death_date) fail(`/konto/grab/${id}`, 'Für die Erinnerung wird ein Todesdatum benötigt.');
  const token = crypto.randomBytes(18).toString('base64url');
  // Double-Opt-in: erst nach Bestätigung wird erinnert.
  run('UPDATE graves SET remind_email = ?, remind = 1, remind_confirmed = 0, remind_token = ? WHERE id = ?', email, token, g.id);
  await sendMail(email, 'Bitte bestätigen Sie die Todestags-Erinnerung',
    `Bitte bestätigen Sie, dass wir Sie jährlich am Todestag von ${g.name} erinnern dürfen:\n${appUrl()}/api/reminder/confirm?token=${token}\n`);
  redirect(`/konto/grab/${id}?ok=bestaetigung`);
}

export async function startSubscription(f: FormData) {
  const u = await requireUser();
  const plan = z.enum(['monthly', 'yearly']).parse(str(f, 'plan')) as PlanId;
  if (f.get('agb') !== 'on' || f.get('sofort') !== 'on') fail('/konto/abo', 'Bitte bestätigen Sie die Geschäftsbedingungen und die Zustimmung zum Leistungsbeginn.');
  const { approveUrl, subId } = await createSubscription(plan, u.id);
  run(`INSERT INTO subscriptions (user_id, plan, status, paypal_sub_id) VALUES (?,?, 'none', ?)
       ON CONFLICT(user_id) DO UPDATE SET plan = excluded.plan, paypal_sub_id = excluded.paypal_sub_id,
       status = CASE WHEN status IN ('active','cancelled','payment_failed') THEN status ELSE 'none' END`, u.id, plan, subId);
  redirect(approveUrl);
}

/** Nur Test-Modus (ohne PayPal-Zugangsdaten): simuliert die Aktivierung. */
export async function mockActivate(f: FormData) {
  if (process.env.PAYPAL_CLIENT_ID) redirect('/konto');
  const u = await requireUser();
  const sub = userSub(u.id);
  const plan = (sub.plan as PlanId) ?? 'monthly';
  const until = addPeriod(new Date(), PLANS[plan].interval).toISOString();
  run("UPDATE subscriptions SET status = 'active', paid_until = ?, grace_until = NULL WHERE user_id = ?", until, u.id);
  redirect('/konto?abo=ok');
}

export async function cancelSub() {
  const u = await requireUser();
  const r = await cancelContract(u.email, u.email, 'konto');
  if (r === 'failed') redirect('/konto/abo?fehler=' + encodeURIComponent('Die Kündigung konnte gerade nicht ausgeführt werden. Bitte versuchen Sie es erneut.'));
  redirect('/konto/abo?gekuendigt=1');
}

/** Kündigungsbutton (§ 312k BGB): ohne Anmeldung erreichbar. Antwort ist für unbekannte Adressen gleich. */
export async function cancelByButton(f: FormData) {
  const p = z.object({ name: z.string().min(1).max(100), email: z.string().email() }).safeParse({ name: str(f, 'name'), email: str(f, 'email').toLowerCase() });
  if (!p.success) fail('/kuendigen', 'Bitte geben Sie Ihren Namen und die E-Mail-Adresse Ihres Kontos an.');
  const r = await cancelContract(p.data!.email, p.data!.name, 'button');
  if (r === 'failed') fail('/kuendigen', 'Die Kündigung konnte gerade nicht ausgeführt werden. Bitte versuchen Sie es in einigen Minuten erneut oder schreiben Sie uns.');
  redirect(`/kuendigen/bestaetigt?t=${encodeURIComponent(new Date().toISOString())}`);
}

export async function moderate(f: FormData) {
  const admin = await requireAdmin();
  const m = mediaById(Number(f.get('media')));
  if (!m) redirect('/admin');
  const action = z.enum(['approved', 'disabled', 'pending']).parse(str(f, 'action'));
  setModeration(m!, action, admin.id, str(f, 'reason'));
  redirect('/admin');
}

export async function deactivateGrave(f: FormData) {
  const admin = await requireAdmin();
  const g = graveById(Number(f.get('id')));
  if (!g) redirect('/admin');
  const off = f.get('off') === '1';
  run('UPDATE graves SET deactivated = ? WHERE id = ?', off ? 1 : 0, g!.id);
  run('INSERT INTO moderation_log (grave_id, admin_id, action, reason) VALUES (?,?,?,?)', g!.id, admin.id, off ? 'grave_disabled' : 'grave_enabled', str(f, 'reason'));
  redirect('/admin');
}

export async function reportGrave(f: FormData) {
  const id = Number(f.get('id'));
  const reason = str(f, 'reason').slice(0, 500);
  if (graveById(id) && reason) run('INSERT INTO reports (grave_id, reason) VALUES (?,?)', id, reason);
  redirect(`/grab/${id}?t=${encodeURIComponent(str(f, 't'))}&gemeldet=1`);
}

export async function whoami() { return currentUser(); }
