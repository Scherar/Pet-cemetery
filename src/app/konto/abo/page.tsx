import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { userSub, userHasAccess } from '@/server/domain';
import { startSubscription, cancelSub } from '@/app/actions';
import { paypalConfigured } from '@/server/paypal';
import { de } from '@/i18n/de';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Abo' };

export default async function Page({ searchParams }: { searchParams: Promise<{ fehler?: string; gekuendigt?: string }> }) {
  const u = await currentUser();
  if (!u) redirect('/anmelden');
  const sp = await searchParams;
  const sub = userSub(u.id);
  const access = userHasAccess(u.id);
  const running = sub.status === 'active' || sub.status === 'payment_failed';
  return (
    <div className="mx-auto max-w-xl space-y-5 pt-4">
      <h1 className="font-serif text-3xl">Abo</h1>
      {sp.fehler && <p role="alert" className="text-red-700">{sp.fehler}</p>}
      {sp.gekuendigt && <p role="status" className="card p-3">Ihr Abo ist gekündigt. Der Zugang bleibt bis zum Ende des bezahlten Zeitraums bestehen.</p>}
      {!paypalConfigured() && <p className="card p-3 text-sm">Test-Modus: PayPal ist noch nicht eingerichtet. Die Buchung wird nur simuliert.</p>}
      {sub.status === 'payment_failed' && <p role="alert" className="card p-3">Die letzte Zahlung ist fehlgeschlagen. Bitte prüfen Sie Ihre Zahlungsart bei PayPal.</p>}
      {running ? (
        <section className="card space-y-3 p-5">
          <p>Aktuelles Abo: <strong>{sub.plan === 'yearly' ? de.plans.yearly : de.plans.monthly}</strong></p>
          {sub.paidUntil && <p>Bezahlt bis {new Date(sub.paidUntil).toLocaleDateString('de-DE')}</p>}
          <form action={cancelSub}><button className="btn btn-quiet">Abo kündigen</button></form>
        </section>
      ) : (
        <section className="card space-y-4 p-5">
          {sub.status === 'cancelled' && access && <p>Ihr Abo ist gekündigt und läuft bis {new Date(sub.paidUntil!).toLocaleDateString('de-DE')}.</p>}
          <form action={startSubscription} className="space-y-3">
            <fieldset className="space-y-2"><legend className="mb-1">Wählen Sie Ihr Abo</legend>
              <label className="flex items-center gap-2"><input type="radio" name="plan" value="monthly" defaultChecked /> {de.plans.monthly}</label>
              <label className="flex items-center gap-2"><input type="radio" name="plan" value="yearly" /> {de.plans.yearly}</label>
            </fieldset>
            <p className="text-sm text-[var(--muted)]">{de.abo.renew}</p>
            <button className="btn">Weiter mit PayPal</button>
          </form>
        </section>
      )}
    </div>
  );
}
