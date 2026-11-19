import { describe, it, expect } from 'vitest';
import { isCandleActive, isAnniversaryToday } from '@/lib/candle';
import { hasAccess, applyEvent } from '@/lib/subscription';
import { checkUpload, sniffMime } from '@/lib/limits';
import { canViewGrave, canViewMedia, listedPublicly } from '@/lib/visibility';
import { nextSlot } from '@/lib/slots';

const at = (iso: string) => new Date(iso + 'T12:00:00+01:00');

describe('Kerze', () => {
  it('Tag 0 bis 5 an, Tag 6 aus', () => {
    for (const d of ['2026-03-10','2026-03-11','2026-03-15']) expect(isCandleActive('2020-03-10', at(d))).toBe(true);
    expect(isCandleActive('2020-03-10', at('2026-03-16'))).toBe(false);
    expect(isCandleActive('2020-03-10', at('2026-03-09'))).toBe(false);
  });
  it('Jahreswechsel', () => {
    expect(isCandleActive('2020-12-29', at('2027-01-03'))).toBe(true);
    expect(isCandleActive('2020-12-29', at('2027-01-04'))).toBe(false);
  });
  it('29. Februar wird in Nichtschaltjahren zum 28.', () => {
    expect(isCandleActive('2020-02-29', at('2026-02-28'))).toBe(true);
    expect(isAnniversaryToday('2020-02-29', at('2026-02-28'))).toBe(true);
    expect(isAnniversaryToday('2020-02-29', at('2028-02-29'))).toBe(true);
  });
  it('ohne Todesdatum oder vor dem Todesjahr keine Kerze', () => {
    expect(isCandleActive(null, at('2026-03-10'))).toBe(false);
    expect(isCandleActive('2030-03-10', at('2026-03-10'))).toBe(false);
  });
});

describe('Abo', () => {
  const now = new Date('2026-06-01T00:00:00Z');
  it('Zugang bis Ende des bezahlten Zeitraums, auch nach Kündigung', () => {
    expect(hasAccess({ status: 'cancelled', paidUntil: '2026-06-15T00:00:00Z' }, now)).toBe(true);
    expect(hasAccess({ status: 'cancelled', paidUntil: '2026-05-15T00:00:00Z' }, now)).toBe(false);
    expect(hasAccess({ status: 'expired', paidUntil: '2026-12-01T00:00:00Z' }, now)).toBe(false);
    expect(hasAccess(null, now)).toBe(false);
  });
  it('Webhook-Ereignisse', () => {
    let s = applyEvent({ status: 'none', paidUntil: null }, { type: 'BILLING.SUBSCRIPTION.ACTIVATED', paidUntil: '2026-07-01T00:00:00Z' });
    expect(s.status).toBe('active');
    s = applyEvent(s, { type: 'BILLING.SUBSCRIPTION.CANCELLED' });
    expect(s).toMatchObject({ status: 'cancelled', paidUntil: '2026-07-01T00:00:00Z' });
  });
});

describe('Upload', () => {
  it('Limits', () => {
    expect(checkUpload({ mime: 'image/png', size: 100 }, { images: 0, videos: 0 }).ok).toBe(true);
    expect(checkUpload({ mime: 'image/png', size: 5 * 1024 * 1024 + 1 }, { images: 0, videos: 0 }).ok).toBe(false);
    expect(checkUpload({ mime: 'image/png', size: 1 }, { images: 20, videos: 0 }).ok).toBe(false);
    expect(checkUpload({ mime: 'video/mp4', size: 1 }, { images: 0, videos: 4 }).ok).toBe(false);
    expect(checkUpload({ mime: 'application/pdf', size: 1 }, { images: 0, videos: 0 }).ok).toBe(false);
  });
  it('Magic Bytes', () => {
    expect(sniffMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(sniffMime(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]))).toBeNull();
  });
});

describe('Sichtbarkeit', () => {
  const g = { visibility: 'link' as const, clickable: true, showPhotos: false, shareToken: 'abc', ownerHasAccess: true };
  it('Link nur mit Token', () => {
    expect(canViewGrave(g, { isOwner: false, isAdmin: false })).toBe(false);
    expect(canViewGrave(g, { isOwner: false, isAdmin: false, token: 'abc' })).toBe(true);
    expect(canViewGrave({ ...g, ownerHasAccess: false }, { isOwner: false, isAdmin: false, token: 'abc' })).toBe(false);
  });
  it('privat und Liste', () => {
    expect(canViewGrave({ ...g, visibility: 'private' }, { isOwner: false, isAdmin: false, token: 'abc' })).toBe(false);
    expect(listedPublicly({ ...g, visibility: 'public' })).toBe(true);
    expect(listedPublicly({ ...g, visibility: 'public', deactivated: true })).toBe(false);
  });
  it('Medien nur freigegeben und mit Foto-Freigabe', () => {
    const v = { isOwner: false, isAdmin: false };
    expect(canViewMedia({ ...g, showPhotos: true }, v, 'approved')).toBe(true);
    expect(canViewMedia({ ...g, showPhotos: true }, v, 'pending')).toBe(false);
    expect(canViewMedia({ ...g, showPhotos: false }, v, 'approved')).toBe(false);
  });
});

describe('Plätze', () => {
  it('nächster freier Platz', () => {
    expect(nextSlot([])).toBe(0);
    expect(nextSlot([0, 1, 3])).toBe(2);
  });
});
