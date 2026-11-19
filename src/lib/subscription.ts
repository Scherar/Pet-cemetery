export type SubStatus = 'none' | 'active' | 'cancelled' | 'payment_failed' | 'expired';

export interface Subscription {
  status: SubStatus;
  /** Ende des aktuell bezahlten Zeitraums (ISO) */
  paidUntil: string | null;
  /** Ende der Karenz bei Zahlungsausfall (ISO) */
  graceUntil?: string | null;
}

/** Zugang besteht, solange der bezahlte Zeitraum läuft – auch nach Kündigung. */
export function hasAccess(sub: Subscription | null | undefined, now: Date): boolean {
  if (!sub) return false;
  if (sub.status === 'none' || sub.status === 'expired') return false;
  if (sub.paidUntil && new Date(sub.paidUntil) > now) return true;
  if (sub.status === 'payment_failed' && sub.graceUntil && new Date(sub.graceUntil) > now) return true;
  return false;
}

/** Statuswechsel aus PayPal-Webhook-Ereignissen. */
export function applyEvent(
  sub: Subscription,
  event: { type: string; paidUntil?: string | null; graceUntil?: string | null },
): Subscription {
  switch (event.type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
    case 'PAYMENT.SALE.COMPLETED':
      return { status: 'active', paidUntil: event.paidUntil ?? sub.paidUntil, graceUntil: null };
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      return { ...sub, status: 'cancelled' };
    case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
    case 'BILLING.SUBSCRIPTION.SUSPENDED':
      return { ...sub, status: 'payment_failed', graceUntil: event.graceUntil ?? sub.graceUntil ?? null };
    case 'BILLING.SUBSCRIPTION.EXPIRED':
      return { ...sub, status: 'expired' };
    default:
      return sub;
  }
}

export function addPeriod(from: Date, interval: 'month' | 'year'): Date {
  const d = new Date(from);
  if (interval === 'month') d.setUTCMonth(d.getUTCMonth() + 1);
  else d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d;
}
