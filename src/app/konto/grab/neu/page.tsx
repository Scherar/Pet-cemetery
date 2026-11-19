import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { newGrave } from '@/app/actions';
import { GraveFields } from '@/components/GraveFields';

export const metadata = { title: 'Neuer Gedenkort' };
export default async function Page({ searchParams }: { searchParams: Promise<{ fehler?: string }> }) {
  if (!(await currentUser())) redirect('/anmelden');
  const { fehler } = await searchParams;
  return (
    <form action={newGrave} className="card mx-auto mt-4 max-w-xl space-y-4 p-6">
      <h1 className="font-serif text-2xl">Neuer Gedenkort</h1>
      {fehler && <p role="alert" className="text-red-700">{fehler}</p>}
      <GraveFields />
      <p className="text-sm text-[var(--muted)]">Bilder und Videos können Sie im nächsten Schritt hinzufügen.</p>
      <button className="btn">Gedenkort anlegen</button>
    </form>
  );
}
