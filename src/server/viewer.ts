import { currentUser } from './auth';
import type { GraveRow } from './domain';
import type { Viewer } from '@/lib/visibility';

export async function viewerFor(g: GraveRow, token?: string | null): Promise<Viewer> {
  const u = await currentUser();
  return { isOwner: !!u && u.id === g.user_id, isAdmin: !!u?.isAdmin, token: token ?? null };
}
