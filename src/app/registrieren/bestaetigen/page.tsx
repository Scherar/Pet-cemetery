import { resendVerification } from '../../actions';
export const metadata = { title: 'E-Mail bestätigen' };

export default async function Page({ searchParams }: { searchParams: Promise<{ gesendet?: string; fehler?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="card mx-auto mt-6 max-w-md space-y-4 p-6">
      <h1 className="font-serif text-2xl">Bitte bestätigen Sie Ihre E-Mail-Adresse</h1>
      {sp.fehler && <p role="alert" className="text-red-700">{sp.fehler}</p>}
      {sp.gesendet && <p role="status">Wenn zu dieser Adresse ein unbestätigtes Konto besteht, haben wir Ihnen soeben eine Nachricht mit einem Bestätigungslink geschickt. Der Link ist 24 Stunden gültig. Bitte schauen Sie auch im Spam-Ordner nach.</p>}
      <form action={resendVerification} className="space-y-3">
        <div><label htmlFor="email">E-Mail-Adresse</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
        <button className="btn btn-quiet">Link erneut senden</button>
        <p className="text-sm text-[var(--muted)]">Aus Sicherheitsgründen ist ein erneuter Versand nur einmal pro Minute möglich.</p>
      </form>
    </div>
  );
}
