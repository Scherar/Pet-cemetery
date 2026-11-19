import crypto from 'node:crypto';
import { PLANS, type PlanId } from '@/lib/config';

const base = () => (process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com');
export const paypalConfigured = () => !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
const planId = (p: PlanId) => (p === 'monthly' ? process.env.PAYPAL_PLAN_ID_MONTHLY : process.env.PAYPAL_PLAN_ID_YEARLY);
export const appUrl = () => process.env.APP_URL ?? 'http://localhost:3000';

async function token(): Promise<string> {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const r = await fetch(`${base()}/v1/oauth2/token`, {
    method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error('PayPal-Anmeldung fehlgeschlagen');
  return ((await r.json()) as { access_token: string }).access_token;
}

/** Legt ein PayPal-Abo an und liefert die Freigabe-URL. Ohne Zugangsdaten: Test-Modus. */
export async function createSubscription(plan: PlanId, userId: number): Promise<{ approveUrl: string; subId: string }> {
  if (!paypalConfigured()) {
    const subId = `MOCK-${crypto.randomUUID()}`;
    return { approveUrl: `${appUrl()}/konto/abo/test?sub=${subId}&plan=${plan}`, subId };
  }
  const pid = planId(plan);
  if (!pid) throw new Error(`PayPal-Plan-ID für ${PLANS[plan].label} fehlt`);
  const r = await fetch(`${base()}/v1/billing/subscriptions`, {
    method: 'POST', headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan_id: pid, custom_id: String(userId),
      application_context: { return_url: `${appUrl()}/konto?abo=ok`, cancel_url: `${appUrl()}/konto/abo?abbruch=1`, user_action: 'SUBSCRIBE_NOW' },
    }),
  });
  if (!r.ok) throw new Error('PayPal-Abo konnte nicht angelegt werden');
  const j = (await r.json()) as { id: string; links: { rel: string; href: string }[] };
  const approve = j.links.find((l) => l.rel === 'approve')?.href;
  if (!approve) throw new Error('PayPal lieferte keine Freigabe-URL');
  return { approveUrl: approve, subId: j.id };
}

export async function cancelSubscription(subId: string): Promise<void> {
  if (!paypalConfigured() || subId.startsWith('MOCK-')) return;
  const r = await fetch(`${base()}/v1/billing/subscriptions/${encodeURIComponent(subId)}/cancel`, {
    method: 'POST', headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: 'Kündigung durch den Kunden' }),
  });
  if (!r.ok && r.status !== 422) throw new Error('Kündigung bei PayPal fehlgeschlagen');
}

export async function subscriptionDetails(subId: string): Promise<{ nextBilling: string | null } | null> {
  if (!paypalConfigured() || subId.startsWith('MOCK-')) return null;
  const r = await fetch(`${base()}/v1/billing/subscriptions/${encodeURIComponent(subId)}`, {
    headers: { Authorization: `Bearer ${await token()}` },
  });
  if (!r.ok) return null;
  const j = (await r.json()) as { billing_info?: { next_billing_time?: string } };
  return { nextBilling: j.billing_info?.next_billing_time ?? null };
}

/** Webhook-Signatur über die PayPal-API prüfen. */
export async function verifyWebhook(headers: Headers, rawBody: string): Promise<boolean> {
  if (!paypalConfigured()) return false;
  const r = await fetch(`${base()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST', headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_algo: headers.get('paypal-auth-algo'), cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'), transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'), webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(rawBody),
    }),
  });
  if (!r.ok) return false;
  return ((await r.json()) as { verification_status: string }).verification_status === 'SUCCESS';
}
