import { SLOTS } from '@/lib/slots';
import { isCandleActive } from '@/lib/candle';
import { cardFor, type GraveRow } from './domain';
import type { Viewer } from '@/lib/visibility';
import type { Pin } from '@/components/Cemetery';

export function pinsFor(graves: GraveRow[], viewerOf: (g: GraveRow) => Viewer, tokenOf?: (g: GraveRow) => string | null): Pin[] {
  const now = new Date();
  const out: Pin[] = [];
  for (const g of graves) {
    const card = cardFor(g, viewerOf(g));
    if (!card) continue;
    const s = SLOTS[g.slot % SLOTS.length];
    out.push({ id: g.id, name: g.name, x: s.x, y: s.y, pinUrl: card.pinUrl, candle: isCandleActive(g.death_date, now), clickable: !!g.clickable || viewerOf(g).isOwner, token: tokenOf?.(g) ?? null });
  }
  return out;
}
