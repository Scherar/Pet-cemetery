/**
 * Musikbibliothek für den Rückblick. Dateien liegen unter public/music/.
 * Pro Titel müssen Urheber, Lizenz und Quelle geklärt sein; sie werden unter dem Player angezeigt.
 *
 * Hinweis: `source` ist die Angabe, die Besuchern unter dem Player gezeigt wird (aktuell der Originaldateiname);
 * `file` ist die Datei in public/music/. [PLATZHALTER – bei Bedarf durch eine echte Quellenangabe ersetzen]
 */
export interface Track { id: string; title: string; artist: string; license: string; source: string; file: string }

const ARTIST = 'Gerhard Hufnagl';
const LICENSE = 'Commercial Use Licence';

export const MUSIC: Track[] = [
  { id: 'ruhe-1', title: 'Quiet Walks', artist: ARTIST, license: LICENSE, source: 'Quiet-Walks.m4a', file: 'quiet-walks.m4a' },
  { id: 'ruhe-2', title: 'Quiet Walks II', artist: ARTIST, license: LICENSE, source: 'Quiet-Walks-II.m4a', file: 'quiet-walks-2.m4a' },
  { id: 'ruhe-3', title: 'Quiet Resolved Ending', artist: ARTIST, license: LICENSE, source: 'Quiet-Resolved-Ending.m4a', file: 'quiet-resolved-ending.m4a' },
  { id: 'ruhe-4', title: 'Quiet Remembrance', artist: ARTIST, license: LICENSE, source: 'Quiet-Remembrance.m4a', file: 'quiet-remembrance.m4a' },
  { id: 'ruhe-5', title: 'Quiet Resolved Ending II', artist: ARTIST, license: LICENSE, source: 'Quiet-Resolved-Ending-II.m4a', file: 'quiet-resolved-ending-2.m4a' },
  { id: 'ruhe-7', title: 'Quiet Remembrance II', artist: ARTIST, license: LICENSE, source: 'Quiet-Remembrance-II.m4a', file: 'quiet-remembrance-2.m4a' },
  { id: 'ruhe-8', title: 'Memorial Piano', artist: ARTIST, license: LICENSE, source: 'Memorial-Piano.m4a', file: 'memorial-piano.m4a' },
  { id: 'ruhe-9', title: 'Memorial Piano II', artist: ARTIST, license: LICENSE, source: 'Memorial-Piano-II.m4a', file: 'memorial-piano-2.m4a' },
];
