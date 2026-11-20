/**
 * Musikbibliothek für den Rückblick. Dateien liegen unter public/music/.
 * Pro Titel müssen Urheber, Lizenz und Quelle geklärt sein; sie werden unter dem Player angezeigt.
 *
 * [PLATZHALTER – Quelle je Titel prüfen: aktuell steht der ursprüngliche Dateiname]
 */
export interface Track { id: string; title: string; artist: string; license: string; source: string; file: string }

const ARTIST = 'Gerhard Hufnagl';
const LICENSE = 'Commercial Use Licence';

export const MUSIC: Track[] = [
  { id: 'ruhe-1', title: 'Quiet Walks', artist: ARTIST, license: LICENSE, source: 'Quiet-Walks.mp3', file: 'quiet-walks.m4a' },
  { id: 'ruhe-2', title: 'Quiet Walks II', artist: ARTIST, license: LICENSE, source: 'Quiet-Walks-II.mp3', file: 'quiet-walks-2.m4a' },
  { id: 'ruhe-3', title: 'Quiet Resolved Ending', artist: ARTIST, license: LICENSE, source: 'Quiet-Resolved-Ending.mp3', file: 'quiet-resolved-ending.m4a' },
  { id: 'ruhe-4', title: 'Quiet Remembrance', artist: ARTIST, license: LICENSE, source: 'Quiet-Remembrance.mp3', file: 'quiet-remembrance.m4a' },
  { id: 'ruhe-5', title: 'Quiet Resolved Ending II', artist: ARTIST, license: LICENSE, source: 'Quiet-Resolved-Ending-II.mp3', file: 'quiet-resolved-ending-2.m4a' },
  { id: 'ruhe-7', title: 'Quiet Remembrance II', artist: ARTIST, license: LICENSE, source: 'Quiet-Remembrance-II.mp3', file: 'quiet-remembrance-2.m4a' },
  { id: 'ruhe-8', title: 'Memorial Piano', artist: ARTIST, license: LICENSE, source: 'Memorial-Piano.mp3', file: 'memorial-piano.m4a' },
  { id: 'ruhe-9', title: 'Memorial Piano II', artist: ARTIST, license: LICENSE, source: 'Memorial-Piano-II.mp3', file: 'memorial-piano-2.m4a' },
];
