import { verifyWebhook } from '@/server/paypal';
import { get, run } from '@/server/db';
import { applyEvent } from '@/lib/subscription';
import { userSub } from '@/server/domain';
import { subscriptionDetails } from '@/server/paypal';
import { addPeriod } from '@/lib/subscription';
import { PLANS, type PlanId } from '@/lib/config';

interface PayPalEvent { id: string; event_type: string; resource: { id?: string; billing_agreement_id?: string; custom_id?: string } }

export async function POST(req: Request) {
  const raw = await req.text();
  if (!(await verifyWebhook(req.headers, raw))) return new Response('Signatur ungültig', { status: 400 });
  const ev = JSON.parse(raw) as PayPalEvent;
  if (get('SELECT 1 FROM webhook_events WHERE id = ?', ev.id)) return new Response('ok'); // idempotent
  const subId = ev.resource.billing_agreement_id ?? ev.resource.id;
  const row = subId ? get<{ user_id: number; plan: string | null }>('SELECT user_id, plan FROM subscriptions WHERE paypal_sub_id = ?', subId) : undefined;
  if (row && subId) {
    const cur = userSub(row.user_id);
    const details = await subscriptionDetails(subId);
    const interval = row.plan ? PLANS[row.plan as PlanId]?.interval ?? 'month' : 'month';
    const paidUntil = details?.nextBilling ?? addPeriod(new Date(), interval).toISOString();
    const graceUntil = new Date(Date.now() + 7 * 864e5).toISOString(); // [PLATZHALTER – Karenzdauer klären]
    const next = applyEvent(cur, { type: ev.event_type, paidUntil, graceUntil });
    run('UPDATE subscriptions SET status = ?, paid_until = ?, grace_until = ? WHERE user_id = ?', next.status, next.paidUntil, next.graceUntil ?? null, row.user_id);
  }
  run('INSERT INTO webhook_events (id) VALUES (?)', ev.id);
  return new Response('ok');
}
