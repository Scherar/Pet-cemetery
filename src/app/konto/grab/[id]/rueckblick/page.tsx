import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { graveById, mediaOfGrave } from '@/server/domain';
import { Slideshow } from '@/components/Slideshow';
import { MUSIC } from '@/lib/music';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Rückblick' };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u) redirect('/anmelden');
  const g = graveById(Number((await params).id));
  if (!g || (g.user_id !== u.id && !u.isAdmin)) notFound();
  // Rückblick nur für den Kunden: eigene Bilder, nicht vom Team deaktivierte.
  const images = mediaOfGrave(g.id).filter((m) => m.kind === 'image' && m.status !== 'disabled');
  return (
    <div className="mx-auto max-w-3xl space-y-4 pt-4">
      <div className="flex items-center justify-between"><h1 className="font-serif text-3xl">Rückblick: {g.name}</h1>
        <Link className="underline" href={`/konto/grab/${g.id}`}>Zurück</Link></div>
      <Slideshow images={images.map((m) => ({ id: m.id, caption: m.caption, alt: m.alt }))} tracks={MUSIC} />
    </div>
  );
}
