import { cancelByButton } from '../actions';
import { currentUser } from '@/server/auth';

export const metadata = { title: 'Verträge hier kündigen' };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ fehler?: string }> }) {
  const { fehler } = await searchParams;
  const u = await currentUser();
  return (
    <form action={cancelByButton} className="card mx-auto mt-6 max-w-md space-y-4 p-6">
      <h1 className="font-serif text-2xl">Verträge hier kündigen</h1>
      <p className="text-sm text-[var(--muted)]">Sie können Ihr Abo hier ohne Anmeldung kündigen. Die Kündigung wirkt zum Ende des bereits bezahlten Zeitraums; bis dahin können Sie Ihren Zugang weiter nutzen.</p>
      {fehler && <p role="alert" className="text-red-700">{fehler}</p>}
      <div><label htmlFor="name">Ihr Name</label><input id="name" name="name" required maxLength={100} autoComplete="name" className="field" /></div>
      <div><label htmlFor="email">E-Mail-Adresse Ihres Kontos</label><input id="email" name="email" type="email" required autoComplete="email" defaultValue={u?.email ?? ''} className="field" /></div>
      <p className="text-sm">Zu kündigen: Abonnement „Virtueller Haustierfriedhof“ (monatlich oder jährlich), zum Ende des bezahlten Zeitraums.</p>
      <button className="btn w-full">Jetzt kündigen</button>
      <p className="text-xs text-[var(--muted)]">Wir bestätigen Ihnen die Kündigung mit Datum, Uhrzeit und Beendigungszeitpunkt per E-Mail an die Adresse Ihres Kontos.</p>
    </form>
  );
}
