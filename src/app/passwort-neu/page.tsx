import Link from 'next/link';
import { setNewPassword } from '../actions';
import { resetTokenValid } from '@/server/reset';

export const metadata = { title: 'Neues Passwort', referrer: 'no-referrer' as const, robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string; fehler?: string }> }) {
  const { token = '', fehler } = await searchParams;
  if (!resetTokenValid(token)) {
    return (
      <div className="card mx-auto mt-6 max-w-sm space-y-3 p-6">
        <h1 className="font-serif text-2xl">Link nicht mehr gültig</h1>
        <p>Der Link zum Zurücksetzen ist ungültig, abgelaufen oder wurde schon verwendet.</p>
        <p><Link className="btn" href="/passwort-vergessen">Neuen Link anfordern</Link></p>
      </div>
    );
  }
  return (
    <form action={setNewPassword} className="card mx-auto mt-6 max-w-sm space-y-4 p-6">
      <h1 className="font-serif text-2xl">Neues Passwort vergeben</h1>
      {fehler && <p role="alert" className="text-red-700">{fehler}</p>}
      <input type="hidden" name="token" value={token} />
      <div><label htmlFor="pw">Neues Passwort (mindestens 10 Zeichen)</label><input id="pw" name="pw" type="password" required minLength={10} autoComplete="new-password" className="field" /></div>
      <div><label htmlFor="pw2">Passwort wiederholen</label><input id="pw2" name="pw2" type="password" required minLength={10} autoComplete="new-password" className="field" /></div>
      <button className="btn w-full">Passwort speichern</button>
    </form>
  );
}
