import Link from 'next/link';
import { berlin } from '@/server/cancel';

export const metadata = { title: 'Kündigung eingegangen', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const d = t ? new Date(t) : null;
  const fresh = d && !isNaN(+d) && Date.now() - +d < 10 * 60_000 && +d <= Date.now() + 60_000;
  return (
    <div className="card mx-auto mt-6 max-w-md space-y-3 p-6">
      <h1 className="font-serif text-2xl">Ihre Kündigung ist eingegangen</h1>
      {fresh && <p>Eingang: {berlin(d!)}</p>}
      <p>Wenn zu Ihren Angaben ein laufendes Abo besteht, ist es zum Ende des bezahlten Zeitraums gekündigt. Wir senden Ihnen eine Bestätigung mit allen Angaben per E-Mail an die Adresse Ihres Kontos. Bitte schauen Sie auch im Spam-Ordner nach.</p>
      <p className="text-sm text-[var(--muted)]">Haben Sie innerhalb weniger Minuten keine E-Mail erhalten, prüfen Sie bitte die angegebene Adresse oder schreiben Sie uns.</p>
      <p><Link className="underline" href="/">Zur Startseite</Link></p>
    </div>
  );
}
