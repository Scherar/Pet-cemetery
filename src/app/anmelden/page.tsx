import Link from 'next/link';
import { login } from '../actions';
export const metadata = { title: 'Anmelden' };
export default async function Page({ searchParams }: { searchParams: Promise<{ fehler?: string; bestaetigt?: string; neu?: string; zurueckgesetzt?: string }> }) {
  const { fehler, bestaetigt, neu, zurueckgesetzt } = await searchParams;
  return (
    <form action={login} className="card mx-auto mt-6 max-w-sm space-y-4 p-6">
      <h1 className="font-serif text-2xl">Anmelden</h1>
      {bestaetigt && <p role="status">Danke, Ihre E-Mail-Adresse ist bestätigt. Sie können sich jetzt anmelden.</p>}
      {zurueckgesetzt && <p role="status">Ihr Passwort wurde geändert. Bitte melden Sie sich mit dem neuen Passwort an.</p>}
      {fehler && <p role="alert" className="text-red-700">{fehler}</p>}
      {neu && <p className="text-sm"><Link className="underline" href="/registrieren/bestaetigen">Bestätigungs-Link erneut senden</Link></p>}
      <div><label htmlFor="email">E-Mail-Adresse</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
      <div><label htmlFor="pw">Passwort</label><input id="pw" name="pw" type="password" required autoComplete="current-password" className="field" /></div>
      <button className="btn w-full">Anmelden</button>
      <p className="text-sm"><Link className="underline" href="/passwort-vergessen">Passwort vergessen?</Link></p>
    </form>
  );
}
