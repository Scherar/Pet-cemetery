import { mediaById, graveById, accessOf } from '@/server/domain';
import { viewerFor } from '@/server/viewer';
import { canViewGrave, canViewMedia } from '@/lib/visibility';
import { readFile } from '@/server/storage';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const m = mediaById(Number(id));
  const g = m && graveById(m.grave_id);
  if (!m || !g) return new Response('Nicht gefunden', { status: 404 });
  const v = await viewerFor(g, url.searchParams.get('t'));
  const acc = accessOf(g);
  if (!canViewGrave(acc, v) || !canViewMedia(acc, v, m.status)) return new Response('Nicht gefunden', { status: 404 });
  const name = url.searchParams.get('v') === 'pin' && m.pin_file ? m.pin_file : m.file;
  const buf = await readFile(name);
  const headers: Record<string, string> = {
    'content-type': name.endsWith('.webp') ? 'image/webp' : m.mime, 'cache-control': 'private, no-store', 'accept-ranges': 'bytes',
  };
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') ?? '');
  if (range && m.kind === 'video') {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), buf.length - 1) : buf.length - 1;
    return new Response(new Uint8Array(buf.subarray(start, end + 1)), {
      status: 206, headers: { ...headers, 'content-range': `bytes ${start}-${end}/${buf.length}`, 'content-length': String(end - start + 1) },
    });
  }
  return new Response(new Uint8Array(buf), { headers: { ...headers, 'content-length': String(buf.length) } });
}
