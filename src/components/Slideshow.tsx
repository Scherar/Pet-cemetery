'use client';
import { useEffect, useRef, useState } from 'react';
import type { Track } from '@/lib/music';

export function Slideshow({ images, tracks }: { images: { id: number; caption: string | null; alt: string | null }[]; tracks: Track[] }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState('');
  const [vol, setVol] = useState(0.6);
  const audio = useRef<HTMLAudioElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const n = images.length;
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!playing || n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [playing, n]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setI((x) => (x + 1) % n);
      if (e.key === 'ArrowLeft') setI((x) => (x - 1 + n) % n);
      if (e.key === ' ') { e.preventDefault(); toggle(); }
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  useEffect(() => { if (audio.current) audio.current.volume = vol; }, [vol]);

  function toggle() {
    setPlaying((p) => {
      const next = !p;
      // Musik startet erst nach Nutzeraktion (Autoplay-Regeln der Browser).
      if (audio.current && track) { if (next) audio.current.play().catch(() => {}); else audio.current.pause(); }
      return next;
    });
  }
  if (!n) return <p>Es sind noch keine freigegebenen Bilder vorhanden.</p>;
  const cur = images[i];
  return (
    <div ref={box} className="space-y-3">
      <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={cur.id} src={`/api/media/${cur.id}`} alt={cur.alt ?? ''} className={`max-h-full max-w-full object-contain ${reduce ? '' : 'transition-opacity duration-700'}`} />
        {cur.caption && <p className="absolute bottom-0 w-full bg-black/50 p-2 text-center text-white">{cur.caption}</p>}
      </div>
      <p aria-live="polite" className="sr-only">Bild {i + 1} von {n}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-quiet" onClick={() => setI((i - 1 + n) % n)}>Zurück</button>
        <button type="button" className="btn" onClick={toggle}>{playing ? 'Pause' : 'Abspielen'}</button>
        <button type="button" className="btn btn-quiet" onClick={() => setI((i + 1) % n)}>Weiter</button>
        <button type="button" className="btn btn-quiet" onClick={() => box.current?.requestFullscreen?.()}>Vollbild</button>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="track">Hintergrundmusik</label>
          <select id="track" className="field" value={track} onChange={(e) => { setTrack(e.target.value); if (audio.current) { audio.current.pause(); } if (playing) setTimeout(() => audio.current?.play().catch(() => {}), 50); }}>
            <option value="">Ohne Musik</option>
            {tracks.map((t) => <option key={t.id} value={t.id}>{t.title} – {t.artist}</option>)}
          </select>
          {tracks.length === 0 && <p className="mt-1 text-xs text-[var(--muted)]">Die Musikbibliothek wird noch befüllt.</p>}
        </div>
        <div>
          <label htmlFor="vol">Lautstärke</label>
          <input id="vol" type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => setVol(Number(e.target.value))} />
        </div>
      </div>
      {track && (() => { const t = tracks.find((x) => x.id === track)!; return (
        <>
          <audio ref={audio} src={`/music/${t.file}`} loop />
          <p className="text-xs text-[var(--muted)]">Musik: {t.title}, {t.artist} · Lizenz: {t.license} · Quelle: {t.source}</p>
        </>); })()}
    </div>
  );
}
