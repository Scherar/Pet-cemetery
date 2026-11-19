import { register } from '../actions';
export const metadata = { title: 'Registrieren' };
export default async function Page({ searchParams }: { searchParams: Promise<{ fehler?: string }> }) {
  const { fehler } = await searchParams;
  return (
    <form action={register} className="card mx-auto mt-6 max-w-sm space-y-4 p-6">
      <h1 className="font-serif text-2xl">Konto anlegen</h1>
      {fehler && <p role="alert" className="text-red-700">{fehler}</p>}
      <div><label htmlFor="email">E-Mail-Adresse</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
      <div><label htmlFor="pw">Passwort (mindestens 10 Zeichen)</label><input id="pw" name="pw" type="password" required minLength={10} autoComplete="new-password" className="field" /></div>
      <button className="btn w-full">Konto anlegen</button>
    </form>
  );
}
