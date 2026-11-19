import { all, get, run } from './db';
import { sendMail } from './mail';
import { isAnniversaryToday, dateInZone } from '@/lib/candle';
import { userHasAccess, type GraveRow } from './domain';
import { appUrl } from './paypal';

/** Täglicher Job: höchstens eine Erinnerung pro Grab und Jahr (idempotent). */
export async function runReminders(now = new Date()): Promise<{ sent: number }> {
  const year = Number(dateInZone(now).slice(0, 4));
  const graves = all<GraveRow>(
    'SELECT * FROM graves WHERE remind = 1 AND remind_confirmed = 1 AND death_date IS NOT NULL AND deactivated = 0');
  let sent = 0;
  for (const g of graves) {
    if (!g.remind_email || !isAnniversaryToday(g.death_date, now)) continue;
    if (!userHasAccess(g.user_id, now)) continue;
    if (get('SELECT 1 FROM reminders_sent WHERE grave_id = ? AND year = ?', g.id, year)) continue;
    // Zuerst eintragen, damit ein Neustart keine Doppelmail auslöst.
    run('INSERT INTO reminders_sent (grave_id, year) VALUES (?,?)', g.id, year);
    try {
      await sendMail(g.remind_email, `Heute denken wir an ${g.name}`,
        `Guten Tag,\n\nheute ist der Todestag von ${g.name}. Wir wünschen Ihnen einen ruhigen Tag mit schönen Erinnerungen.\n\n` +
        `Zum Gedenkort: ${appUrl()}/grab/${g.id}?t=${g.share_token}\n\n` +
        `Diese Erinnerung abbestellen: ${appUrl()}/api/reminder/unsubscribe?token=${g.remind_token}\n`);
      sent++;
    } catch {
      run('DELETE FROM reminders_sent WHERE grave_id = ? AND year = ?', g.id, year);
    }
  }
  return { sent };
}
