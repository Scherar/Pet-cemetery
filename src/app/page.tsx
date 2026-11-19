import Link from 'next/link';
import { Cemetery } from '@/components/Cemetery';
import { publicGraves } from '@/server/domain';
import { pinsFor } from '@/server/pins';
import { currentUser } from '@/server/auth';
import { de } from '@/i18n/de';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const u = await currentUser();
  const pins = pinsFor(publicGraves(), () => ({ isOwner: false, isAdmin: false }));
  return (
    <div className="space-y-6">
      <section className="py-4">
        <h1 className="font-serif text-3xl sm:text-4xl">{de.tagline}</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">Ein stiller Garten mit Wegen, Bäumen und einem Bach. Jedes Tier hat hier seinen Platz – mit Bildern, Worten und einer Kerze am Todestag.</p>
        {!u && <p className="mt-4"><Link className="btn" href="/registrieren">Gedenkort anlegen</Link></p>}
      </section>
      <Cemetery pins={pins} />
    </div>
  );
}
