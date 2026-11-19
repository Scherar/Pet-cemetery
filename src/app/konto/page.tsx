import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { gravesOfUser, userSub, userHasAccess } from '@/server/domain';
import { Cemetery } from '@/components/Cemetery';
import { pinsFor } from '@/server/pins';
import { isCandleActive } from '@/lib/candle';
import { Candle } from '@/components/Candle';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mein Bereich' };

const statusText = { none: 'Kein Abo', active: 'Aktiv', cancelled: 'Gekündigt', payment_failed: 'Zahlung fehlgeschlagen', expired: 'Abgelaufen' } as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ abo?: string }> }) {
  const u = await currentUser();
  if (!u) redirect('/anmelden');
  const { abo } = await searchParams;
  const sub = userSub(u.id);
  const access = userHasAccess(u.id);
  const graves = gravesOfUser(u.id);
  const pins = pinsFor(graves, () => ({ isOwner: true, isAdmin: false }), (g) => g.share_token);
  return (
    <div className="space-y-6 pt-2">
      <h1 className="font-serif text-3xl">Mein Bereich</h1>
      {abo === 'ok' && <p role="status" className="card p-3">Vielen Dank. Ihr Abo wird eingerichtet; die Bestätigung durch PayPal kann einen Moment dauern.</p>}
      <section className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-[var(--muted)]">Abo</p>
          <p className="font-semibold">{statusText[sub.status]}{sub.plan ? ` (${sub.plan === 'yearly' ? 'jährlich' : 'monatlich'})` : ''}</p>
          {sub.paidUntil && access && <p className="text-sm">Bezahlt bis {new Date(sub.paidUntil).toLocaleDateString('de-DE')}</p>}
        </div>
        <Link className="btn btn-quiet" href="/konto/abo">Abo verwalten</Link>
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Meine Gedenkorte</h2>
          {access ? <Link className="btn" href="/konto/grab/neu">Neuen Gedenkort anlegen</Link> : <Link className="btn" href="/konto/abo">Abo abschließen</Link>}
        </div>
        {graves.length === 0 && <p className="text-[var(--muted)]">Sie haben noch keinen Gedenkort angelegt.</p>}
        <ul className="grid gap-3 sm:grid-cols-2">
          {graves.map((g) => (
            <li key={g.id} className="card flex items-center justify-between p-4">
              <div><p className="font-serif text-lg">{g.name}</p>
                <p className="text-sm text-[var(--muted)]">{g.visibility === 'private' ? 'Privat' : g.visibility === 'link' ? 'Nur über Link' : 'Öffentlich'}{g.deactivated ? ' · vom Team deaktiviert' : ''}</p></div>
              <div className="flex items-center gap-3">{isCandleActive(g.death_date, new Date()) && <Candle size={14} />}<Link className="underline" href={`/konto/grab/${g.id}`}>Bearbeiten</Link></div>
            </li>
          ))}
        </ul>
      </section>
      {graves.length > 0 && <section><h2 className="mb-2 font-serif text-2xl">Mein Friedhof</h2><Cemetery pins={pins} /></section>}
    </div>
  );
}
