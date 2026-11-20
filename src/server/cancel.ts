import { all, get, run } from './db';
import { userSub } from './domain';
import { cancelSubscription } from './paypal';
import { sendMail } from './mail';
import { PLANS, type PlanId } from '@/lib/config';

export const berlin = (d: Date) =>
  new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'long', timeStyle: 'medium' }).format(d) + ' Uhr';
const day = (iso: string) => new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'long' }).format(new Date(iso));

export type CancelResult = 'cancelled' | 'already' | 'none' | 'throttled' | 'failed';

/**
 * Kündigt das Abo eines Kontos zum Ende des bezahlten Zeitraums, hält den Eingang fest (Nachweis)
 * und bestätigt per E-Mail in Textform (§ 312k BGB). Antwort an die Seite ist für unbekannte Adressen identisch.
 */
export async function cancelContract(email: string, name: string, via: 'button' | 'konto' = 'button'): Promise<CancelResult> {
  const user = get<{ id: number; email: string }>('SELECT id, email FROM users WHERE email = ?', email);
  if (!user) return 'none';
  const last = get<{ requested_at: string }>('SELECT requested_at FROM cancellations WHERE user_id = ? ORDER BY id DESC LIMIT 1', user.id);
  if (last && Date.now() - new Date(last.requested_at).getTime() < 60_000) return 'throttled';
  const sub = userSub(user.id);
  const now = new Date();
  if (!sub.paypalSubId || sub.status === 'none' || sub.status === 'expired') return 'none';
  let result: CancelResult = 'already';
  if (sub.status !== 'cancelled') {
    try { await cancelSubscription(sub.paypalSubId); } catch { return 'failed'; }
    run("UPDATE subscriptions SET status = 'cancelled' WHERE user_id = ?", user.id);
    result = 'cancelled';
  }
  run('INSERT INTO cancellations (user_id, name, requested_at, via) VALUES (?,?,?,?)', user.id, name, now.toISOString(), via);
  const plan = sub.plan ? PLANS[sub.plan as PlanId]?.label ?? sub.plan : 'Abo';
  const ende = sub.paidUntil ? day(sub.paidUntil) : '[Ende des bezahlten Zeitraums]';
  try {
    await sendMail(user.email, 'Bestätigung Ihrer Kündigung',
      `Guten Tag ${name},\n\nwir bestätigen Ihre Kündigung.\n\n` +
      `Vertrag: Abonnement Virtueller Haustierfriedhof (${plan})\nKonto: ${user.email}\n` +
      `Eingang der Kündigung: ${berlin(now)}\nBeendigung des Vertrags: zum Ende des bezahlten Zeitraums, am ${ende}\n\n` +
      (result === 'already' ? 'Das Abo war bereits gekündigt; an der Laufzeit ändert sich nichts.\n\n' : '') +
      `Bis dahin können Sie Ihren Zugang weiter nutzen. Es werden keine weiteren Zahlungen eingezogen.\n` +
      `Wenn Sie diese Kündigung nicht veranlasst haben, melden Sie sich bitte umgehend bei uns.\n`);
  } catch { /* Kündigung gilt trotzdem; Eingang ist gespeichert */ }
  return result;
}

export const cancellationsOf = (userId: number) =>
  all<{ requested_at: string; name: string }>('SELECT requested_at, name FROM cancellations WHERE user_id = ? ORDER BY id DESC', userId);
