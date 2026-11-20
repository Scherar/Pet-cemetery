import { requestPasswordReset } from '../actions';
export const metadata = { title: 'Passwort vergessen' };

export default async function Page({ searchParams }: { searchParams: Promise<{ gesendet?: string }> }) {
  const { gesendet } = await searchParams;
  return (
    <form action={requestPasswordReset} className="card mx-auto mt-6 max-w-sm space-y-4 p-6">
      <h1 className="font-serif text-2xl">Passwort vergessen</h1>
      {gesendet && <p role="status">Wenn zu dieser Adresse ein Konto besteht, haben wir Ihnen soeben eine Nachricht mit einem Link zum Zurücksetzen geschickt. Der Link ist 60 Minuten gültig. Bitte schauen Sie auch im Spam-Ordner nach.</p>}
      <div><label htmlFor="email">E-Mail-Adresse</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
      <button className="btn w-full">Link senden</button>
      <p className="text-sm text-[var(--muted)]">Aus Sicherheitsgründen ist ein erneuter Versand nur einmal pro Minute möglich.</p>
    </form>
  );
}
