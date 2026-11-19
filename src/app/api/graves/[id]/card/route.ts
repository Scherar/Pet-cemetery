import { graveById, cardFor } from '@/server/domain';
import { viewerFor } from '@/server/viewer';
import { isCandleActive } from '@/lib/candle';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const g = graveById(Number(id));
  if (!g) return Response.json({ error: 'Nicht gefunden' }, { status: 404 });
  const v = await viewerFor(g, new URL(req.url).searchParams.get('t'));
  const card = cardFor(g, v);
  if (!card) return Response.json({ error: 'Nicht gefunden' }, { status: 404 });
  return Response.json({ card, candle: isCandleActive(g.death_date, new Date()) }, { headers: { 'cache-control': 'private, no-store' } });
}
