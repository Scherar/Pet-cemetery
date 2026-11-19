/**
 * Musikbibliothek für den Rückblick. Dateien liegen unter public/music/.
 * Pro Titel müssen Urheber, Lizenz und Quelle geklärt sein; sie werden unter dem Player angezeigt.
 *
 * Urheber und Titel stammen aus den Metadaten der gelieferten Dateien (Künstler: Gerhard Hufnagl, Album: Pet Cemetery).
 * [PLATZHALTER – Lizenz/Nutzungsrechte je Titel bestätigen und hier eintragen]
 */
export interface Track { id: string; title: string; artist: string; license: string; source: string; file: string }

const ARTIST = 'Gerhard Hufnagl';
const LICENSE = '[PLATZHALTER – Nutzungsrechte bestätigen]';
const SOURCE = 'Album „Pet Cemetery" (Dateimetadaten)';

export const MUSIC: Track[] = [
  { id: 'quiet-walks', title: 'Quiet Walks', artist: ARTIST, license: LICENSE, source: SOURCE, file: 'quiet-walks.m4a' },
  { id: 'quiet-walks-2', title: 'Quiet Walks II', artist: ARTIST, license: LICENSE, source: SOURCE, file: 'quiet-walks-2.m4a' },
  { id: 'quiet-remembrance-2', title: 'Quiet Remembrance II', artist: ARTIST, license: LICENSE, source: SOURCE, file: 'quiet-remembrance-2.m4a' },
  { id: 'quiet-resolved-ending', title: 'Quiet Resolved Ending', artist: ARTIST, license: LICENSE, source: SOURCE, file: 'quiet-resolved-ending.m4a' },
  { id: 'quiet-resolved-ending-2', title: 'Quiet Resolved Ending II', artist: ARTIST, license: LICENSE, source: SOURCE, file: 'quiet-resolved-ending-2.m4a' },
];
