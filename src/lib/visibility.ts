export type Visibility = 'private' | 'link' | 'public';
export type ModStatus = 'pending' | 'approved' | 'disabled';

export interface GraveAccess {
  visibility: Visibility;
  clickable: boolean;
  showPhotos: boolean;
  shareToken: string;
  ownerHasAccess: boolean;
  deactivated?: boolean;
}

export interface Viewer { isOwner: boolean; isAdmin: boolean; token?: string | null }

export function canViewGrave(g: GraveAccess, v: Viewer): boolean {
  if (v.isOwner || v.isAdmin) return true;
  if (!g.ownerHasAccess || g.deactivated) return false;
  if (g.visibility === 'public') return true;
  if (g.visibility === 'link') return !!v.token && v.token === g.shareToken;
  return false;
}

/** Erscheint der Pin in der öffentlichen Übersicht? */
export function listedPublicly(g: GraveAccess): boolean {
  return g.visibility === 'public' && g.ownerHasAccess && !g.deactivated;
}

/** Besucher sehen Medien nur, wenn Fotos freigegeben UND von Team freigegeben. */
export function canViewMedia(g: GraveAccess, v: Viewer, status: ModStatus): boolean {
  if (v.isOwner || v.isAdmin) return true;
  return g.showPhotos && status === 'approved';
}
