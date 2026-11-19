import { SLOT_COUNT } from './config';

/** Feste Plätze entlang der Wege (Prozent der SVG-Fläche 1000x700). Reihenfolge = Belegungsreihenfolge. */
export const SLOTS: { x: number; y: number }[] = [
  { x: 180, y: 520 }, { x: 260, y: 470 }, { x: 340, y: 430 }, { x: 420, y: 400 },
  { x: 500, y: 380 }, { x: 580, y: 370 }, { x: 660, y: 380 }, { x: 740, y: 400 },
  { x: 820, y: 430 }, { x: 880, y: 470 }, { x: 240, y: 590 }, { x: 320, y: 550 },
  { x: 400, y: 520 }, { x: 480, y: 490 }, { x: 560, y: 470 }, { x: 640, y: 480 },
  { x: 720, y: 500 }, { x: 800, y: 530 }, { x: 860, y: 570 }, { x: 300, y: 330 },
  { x: 400, y: 290 }, { x: 520, y: 270 }, { x: 640, y: 280 }, { x: 760, y: 310 },
].slice(0, SLOT_COUNT);

/** Nächster freier Platz; bei Überlauf wird neu begonnen (Plätze doppelt belegt). */
export function nextSlot(used: number[]): number {
  for (let i = 0; i < SLOTS.length; i++) if (!used.includes(i)) return i;
  return used.length % SLOTS.length;
}
