'use client';
import { useState } from 'react';

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const e = encodeURIComponent;
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-quiet" onClick={async () => { await navigator.clipboard?.writeText(url); setCopied(true); }}>{copied ? 'Link kopiert' : 'Link kopieren'}</button>
      {canShare && <button type="button" className="btn btn-quiet" onClick={() => navigator.share({ title, url }).catch(() => {})}>Teilen …</button>}
      {/* Reine Links: keine Tracker beim bloßen Laden der Seite. */}
      <a className="btn btn-quiet" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${e(`${title} ${url}`)}`}>WhatsApp</a>
      <a className="btn btn-quiet" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${e(url)}`}>Facebook</a>
      <a className="btn btn-quiet" target="_blank" rel="noopener noreferrer" href={`mailto:?subject=${e(title)}&body=${e(url)}`}>E-Mail</a>
    </div>
  );
}
