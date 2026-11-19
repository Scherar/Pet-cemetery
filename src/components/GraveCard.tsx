'use client';
import { useState } from 'react';
import { Candle } from './Candle';

export interface CardData {
  id: number; name: string; species: string; breed: string | null; birth_date: string | null; death_date: string | null;
  memo: string | null; owner_name: string | null; pinUrl: string | null;
  media: { id: number; kind: string; caption: string | null; alt: string | null }[];
}
const fmt = (d: string | null) => (d ? new Date(d + 'T12:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : null);

export function GraveCard({ card, candle, token }: { card: CardData; candle: boolean; token?: string | null }) {
  const [open, setOpen] = useState<number | null>(null);
  const q = token ? `?t=${encodeURIComponent(token)}` : '';
  const cur = card.media.find((m) => m.id === open);
  return (
    <article className="space-y-4">
      <header className="flex items-center gap-4">
        {card.pinUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.pinUrl} alt="" className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md" />
        ) : (
          <div aria-hidden className="grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-[var(--accent)] text-3xl text-white shadow-md">{card.name.slice(0, 1)}</div>
        )}
        <div className="flex-1">
          <h2 className="font-serif text-2xl">{card.name}</h2>
          <p className="text-sm text-[var(--muted)]">{[card.species, card.breed].filter(Boolean).join(' · ')}</p>
        </div>
        {candle && <Candle />}
      </header>
      {(card.birth_date || card.death_date) && (
        <p className="text-sm">{[fmt(card.birth_date), fmt(card.death_date)].filter(Boolean).join(' – ')}</p>
      )}
      {card.memo && <p className="whitespace-pre-line font-serif leading-relaxed">{card.memo}</p>}
      {card.owner_name && <p className="text-sm text-[var(--muted)]">In Liebe, {card.owner_name}</p>}
      {card.media.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {card.media.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => setOpen(m.id)} className="block aspect-square w-full overflow-hidden rounded-lg bg-black/5" aria-label={m.alt || m.caption || `${m.kind === 'video' ? 'Video' : 'Bild'} öffnen`}>
                {m.kind === 'image'
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={`/api/media/${m.id}${q}`} alt={m.alt ?? ''} loading="lazy" className="h-full w-full object-cover" />
                  : <span className="grid h-full place-items-center text-sm">▶ Video</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {cur && (
        <div role="dialog" aria-modal="true" aria-label="Bildansicht" className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setOpen(null)} onKeyDown={(e) => e.key === 'Escape' && setOpen(null)}>
          <button type="button" autoFocus onClick={() => setOpen(null)} className="btn absolute right-4 top-4">Schließen</button>
          <div onClick={(e) => e.stopPropagation()} className="max-h-full max-w-3xl">
            {cur.kind === 'image'
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={`/api/media/${cur.id}${q}`} alt={cur.alt ?? ''} className="max-h-[80vh] rounded-lg" />
              : <video src={`/api/media/${cur.id}${q}`} controls className="max-h-[80vh] rounded-lg" />}
            {cur.caption && <p className="mt-2 text-center text-white">{cur.caption}</p>}
          </div>
        </div>
      )}
    </article>
  );
}
