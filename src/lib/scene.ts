/**
 * Brücken an den Stellen, an denen ein Weg den Bach kreuzt (Koordinaten in der viewBox 1200x800
 * von public/friedhofslandschaft.svg). Position und Winkel stammen aus den Linien der SVG.
 * Wird die Grafik geändert, müssen die Brücken angepasst werden.
 */
export interface Bridge { x: number; y: number; angle: number; length: number; width: number }

export const BRIDGES: Bridge[] = [
  { x: 200, y: 707, angle: -41, length: 128, width: 46 }, // Weg unten links
  { x: 1018, y: 626, angle: -28, length: 150, width: 36 }, // Weg unten rechts (führt am Nordufer weiter)
];
