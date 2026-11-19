import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { graveById, cardFor } from '@/server/domain';
import { viewerFor } from '@/server/viewer';
import { isCandleActive } from '@/lib/candle';
import { GraveCard } from '@/components/GraveCard';
import { ShareButtons } from '@/components/ShareButtons';
import { reportGrave } from '@/app/actions';
import { appUrl } from '@/server/paypal';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string; gemeldet?: string }> };

async function load(p: Props) {
  const { id } = await p.params; const { t } = await p.searchParams;
  const g = graveById(Number(id));
  if (!g) return null;
  const card = cardFor(g, await viewerFor(g, t));
  return card ? { g, card, t: t ?? null } : null;
}

export async function generateMetadata(p: Props): Promise<Metadata> {
  const d = await load(p);
  // Nicht öffentliche Seiten: nie indexieren. Vorschaubild nur, wenn Fotos freigegeben sind (cardFor filtert).
  const robots = { index: false, follow: false };
  if (!d) return { title: 'Nicht gefunden', robots };
  const img = d.card.pinUrl && d.g.show_photos ? [{ url: `${appUrl()}${d.card.pinUrl}` }] : undefined;
  return { title: `Gedenkort für ${d.card.name}`, robots: d.g.visibility === 'public' ? undefined : robots,
    openGraph: { title: `Gedenkort für ${d.card.name}`, description: 'Ein Ort der Erinnerung.', images: img } };
}

export default async function Page(p: Props) {
  const d = await load(p);
  if (!d) notFound();
  const { gemeldet } = await p.searchParams;
  const url = `${appUrl()}/grab/${d!.g.id}${d!.t ? `?t=${d!.t}` : ''}`;
  return (
    <div className="card mx-auto mt-6 max-w-xl space-y-5 p-6">
      <GraveCard card={d!.card} candle={isCandleActive(d!.g.death_date, new Date())} token={d!.t} />
      <ShareButtons url={url} title={`Gedenkort für ${d!.card.name}`} />
      <details className="text-sm"><summary className="cursor-pointer">Inhalt melden</summary>
        <form action={reportGrave} className="mt-2 space-y-2"><input type="hidden" name="id" value={d!.g.id} /><input type="hidden" name="t" value={d!.t ?? ''} />
          <label htmlFor="reason">Was ist Ihnen aufgefallen?</label><textarea id="reason" name="reason" required maxLength={500} className="field" /><button className="btn btn-quiet">Absenden</button></form>
        {gemeldet && <p role="status" className="mt-2">Danke, wir schauen uns das an.</p>}</details>
    </div>
  );
}
