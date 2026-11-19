import { SLOT_COUNT } from './config';

/**
 * Feste Plätze auf der Landschaft public/friedhofslandschaft.svg (Koordinaten in deren viewBox 1200x800).
 * Sie liegen in drei Reihen entlang der Wege (mit Abstand, damit sich Pins nicht überdecken), abseits von Bäumen und Bach.
 * Wird die Grafik ausgetauscht, müssen diese Plätze angepasst werden.
 * Reihenfolge = Belegungsreihenfolge (Mitte zuerst).
 */
export const SLOTS: { x: number; y: number }[] = [
  { x: 640, y: 440 }, { x: 520, y: 440 }, { x: 760, y: 440 }, { x: 640, y: 550 },
  { x: 540, y: 330 }, { x: 660, y: 330 }, { x: 520, y: 550 }, { x: 400, y: 440 },
  { x: 760, y: 550 }, { x: 420, y: 330 }, { x: 780, y: 330 }, { x: 400, y: 550 },
  { x: 880, y: 440 }, { x: 280, y: 440 }, { x: 880, y: 550 }, { x: 300, y: 330 },
  { x: 900, y: 330 }, { x: 280, y: 550 }, { x: 1000, y: 440 }, { x: 160, y: 440 },
  { x: 1010, y: 330 }, { x: 1060, y: 510 }, { x: 150, y: 320 }, { x: 1100, y: 370 },
].slice(0, SLOT_COUNT);

/** Nächster freier Platz; bei Überlauf wird neu begonnen (Plätze doppelt belegt). */
export function nextSlot(used: number[]): number {
  for (let i = 0; i < SLOTS.length; i++) if (!used.includes(i)) return i;
  return used.length % SLOTS.length;
}
