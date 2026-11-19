'use client';
import { useEffect, useRef, useState } from 'react';
import { GraveCard, type CardData } from './GraveCard';
import { Candle } from './Candle';

export interface Pin { id: number; name: string; x: number; y: number; pinUrl: string | null; candle: boolean; clickable: boolean; token?: string | null }

export function Cemetery({ pins }: { pins: Pin[] }) {
  const [sel, setSel] = useState<Pin | null>(null);
  const [data, setData] = useState<{ card: CardData; candle: boolean } | null>(null);
  const [err, setErr] = useState(false);
  const [zoom, setZoom] = useState(1);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!sel) return;
    setData(null); setErr(false);
    fetch(`/api/graves/${sel.id}/card${sel.token ? `?t=${encodeURIComponent(sel.token)}` : ''}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData).catch(() => setErr(true));
    closeRef.current?.focus();
  }, [sel]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setSel(null);
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);

  return (
    <div>
      <div className="mb-2 flex justify-end gap-2" aria-label="Ansicht">
        <button type="button" className="btn btn-quiet" onClick={() => setZoom((z) => Math.max(1, z - 0.25))} aria-label="Verkleinern">−</button>
        <button type="button" className="btn btn-quiet" onClick={() => setZoom((z) => Math.min(2, z + 0.25))} aria-label="Vergrößern">+</button>
      </div>
      <div className="overflow-auto rounded-2xl border border-[var(--line)]" tabIndex={0} aria-label="Friedhofsübersicht, scrollbar">
        <div className="relative" style={{ width: `${zoom * 100}%`, aspectRatio: '1000 / 700' }}>
          <Scene />
          {pins.map((p) => (
            <button
              key={p.id} type="button" disabled={!p.clickable} onClick={() => setSel(p)}
              aria-label={`Gedenkort von ${p.name} öffnen`}
              className="group absolute -translate-x-1/2 -translate-y-1/2 text-center disabled:cursor-default"
              style={{ left: `${p.x / 10}%`, top: `${p.y / 7}%` }}
            >
              <span className="relative block">
                {p.candle && <span className="absolute -top-7 left-1/2 -translate-x-1/2"><Candle size={16} /></span>}
                {p.pinUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.pinUrl} alt="" className="h-12 w-12 rounded-full border-[3px] border-white object-cover shadow-lg transition group-hover:scale-110 group-focus-visible:scale-110 sm:h-14 sm:w-14" />
                ) : (
                  <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-white bg-[#6c9a77] text-lg text-white shadow-lg transition group-hover:scale-110 sm:h-14 sm:w-14">{p.name.slice(0, 1)}</span>
                )}
              </span>
              <span className="mt-1 block rounded-full bg-white/85 px-2 text-xs text-[#26332b]">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
      {pins.length === 0 && <p className="mt-3 text-[var(--muted)]">Noch ruht hier niemand. Der erste Gedenkort wird hier erscheinen.</p>}
      {sel && (
        <div role="dialog" aria-modal="true" aria-label={`Gedenkort ${sel.name}`} className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-stretch sm:justify-end" onClick={() => setSel(null)}>
          <div className="card max-h-[85vh] w-full overflow-y-auto rounded-b-none p-5 sm:max-h-none sm:max-w-md sm:rounded-none" onClick={(e) => e.stopPropagation()}>
            <button ref={closeRef} type="button" className="btn btn-quiet mb-3" onClick={() => setSel(null)}>Schließen</button>
            {err && <p>Dieser Gedenkort ist nicht verfügbar.</p>}
            {!data && !err && <p>Wird geladen …</p>}
            {data && (<>
              <GraveCard card={data.card} candle={data.candle} token={sel.token} />
              <p className="mt-4"><a className="underline" href={`/grab/${sel.id}${sel.token ? `?t=${sel.token}` : ''}`}>Eigene Seite zum Teilen öffnen</a></p>
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}

function Scene() {
  return (
    <svg viewBox="0 0 1000 700" className="absolute inset-0 h-full w-full" role="img" aria-label="Stilisierte Landschaft mit Wegen, Bäumen und einem Bach" preserveAspectRatio="xMidYMid slice">
      <rect width="1000" height="700" fill="#9fc89a" />
      <ellipse cx="500" cy="720" rx="700" ry="200" fill="#8ab98a" />
      <path d="M0 150 C 200 100, 380 190, 560 140 S 900 90, 1000 160 L1000 0 L0 0Z" fill="#b6d8ae" />
      <path className="creek" d="M-20 640 C 180 600, 300 690, 480 640 S 800 560, 1020 620" fill="none" stroke="#7fb9d6" strokeWidth="26" strokeLinecap="round" />
      <path d="M-20 640 C 180 600, 300 690, 480 640 S 800 560, 1020 620" fill="none" stroke="#a9d6ea" strokeWidth="14" strokeLinecap="round" opacity=".7" />
      <path d="M120 560 C 260 470, 420 460, 520 400 S 800 400, 900 470" fill="none" stroke="#e6dcbf" strokeWidth="34" strokeLinecap="round" />
      <path d="M200 640 C 300 560, 480 530, 600 490 S 820 520, 880 580" fill="none" stroke="#e6dcbf" strokeWidth="26" strokeLinecap="round" />
      <path d="M280 350 C 420 320, 560 300, 780 330" fill="none" stroke="#e6dcbf" strokeWidth="24" strokeLinecap="round" />
      {[[90,230],[170,320],[880,240],[940,330],[70,470],[960,500],[500,210],[700,230],[330,230]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-6" y="0" width="12" height="40" fill="#7a5a3a" rx="3" />
          <circle cx="0" cy="-8" r="34" fill="#4f8a58" /><circle cx="-18" cy="6" r="22" fill="#5c9b66" /><circle cx="18" cy="6" r="22" fill="#5c9b66" />
        </g>
      ))}
    </svg>
  );
}
