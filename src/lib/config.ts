export const LIMITS = {
  maxImages: 20,
  maxVideos: 4,
  maxFileBytes: 5 * 1024 * 1024,
  imageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  videoTypes: ['video/mp4', 'video/webm'],
} as const;

export const PLANS = {
  monthly: { id: 'monthly', label: 'Monatlich', priceCents: 799, interval: 'month' },
  yearly: { id: 'yearly', label: 'Jährlich', priceCents: 7999, interval: 'year' },
} as const;
export type PlanId = keyof typeof PLANS;

export const CANDLE_DAYS_AFTER = 5;
export const TIMEZONE = 'Europe/Berlin';
export const SLOT_COUNT = 24;
