import { SLOT_COUNT } from './config';

/**
 * Feste Plätze auf der Landschaft public/friedhofslandschaft.webp (Koordinaten in Bildpixeln, 1672x941).
 * Berechnet mit tools/landscape_slots.py: nur freie Wiese, nicht auf Wegen, im Bach, auf Brücken, Bäumen,
 * Büschen oder Steinen, mit Abstand zueinander. Reihenfolge = Belegungsreihenfolge (von der Mitte nach außen).
 * Wird die Grafik ausgetauscht, das Skript neu ausführen und die Werte hier und SCENE in config.ts anpassen.
 */
export const SLOTS: { x: number; y: number }[] = [
  { x: 790, y: 458 }, { x: 810, y: 662 }, { x: 682, y: 590 }, { x: 914, y: 706 },
  { x: 686, y: 410 }, { x: 578, y: 526 }, { x: 1022, y: 714 }, { x: 474, y: 526 },
  { x: 490, y: 646 }, { x: 1142, y: 354 }, { x: 562, y: 314 }, { x: 1130, y: 786 },
  { x: 1026, y: 838 }, { x: 370, y: 578 }, { x: 386, y: 698 }, { x: 1246, y: 322 },
  { x: 590, y: 194 }, { x: 350, y: 318 }, { x: 434, y: 858 }, { x: 1350, y: 326 },
  { x: 486, y: 194 }, { x: 246, y: 378 }, { x: 1506, y: 542 }, { x: 182, y: 226 },
].slice(0, SLOT_COUNT);

/** Nächster freier Platz; bei Überlauf wird neu begonnen (Plätze doppelt belegt). */
export function nextSlot(used: number[]): number {
  for (let i = 0; i < SLOTS.length; i++) if (!used.includes(i)) return i;
  return used.length % SLOTS.length;
}
