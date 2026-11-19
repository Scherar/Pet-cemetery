import { CANDLE_DAYS_AFTER, TIMEZONE } from './config';

const DAY = 86_400_000;

/** Kalendertag (YYYY-MM-DD) eines Zeitpunkts in einer Zeitzone. */
export function dateInZone(now: Date, tz: string = TIMEZONE): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

const toDayNumber = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d) / DAY;
const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

function parse(date: string): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new Error(`Ungültiges Datum: ${date}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** Jahrestag im Jahr `year`; der 29. Februar wird in Nichtschaltjahren zum 28. Februar. */
export function anniversaryDayNumber(deathDate: string, year: number): number {
  const [, m, d] = parse(deathDate);
  const day = m === 2 && d === 29 && !isLeap(year) ? 28 : d;
  return toDayNumber(year, m, day);
}

/** Kerze: Todestag und die folgenden 5 Kalendertage (also 6 Tage), in fester Zeitzone. */
export function isCandleActive(deathDate: string | null | undefined, now: Date, tz: string = TIMEZONE): boolean {
  if (!deathDate) return false;
  const [dy] = parse(deathDate);
  const [ty, tm, td] = parse(dateInZone(now, tz));
  const today = toDayNumber(ty, tm, td);
  for (const year of [ty, ty - 1]) {
    if (year < dy) continue;
    const diff = today - anniversaryDayNumber(deathDate, year);
    if (diff >= 0 && diff <= CANDLE_DAYS_AFTER) return true;
  }
  return false;
}

/** Ist heute der (Jahres-)Todestag? Für die Erinnerung. */
export function isAnniversaryToday(deathDate: string | null | undefined, now: Date, tz: string = TIMEZONE): boolean {
  if (!deathDate) return false;
  const [dy] = parse(deathDate);
  const [ty, tm, td] = parse(dateInZone(now, tz));
  if (ty < dy) return false;
  return toDayNumber(ty, tm, td) === anniversaryDayNumber(deathDate, ty);
}
