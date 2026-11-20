import type { ReactNode } from 'react';

const INLINE = /(\*\*[^*]+\*\*)|(\[PLATZHALTER[^\]]*\])|(\[[^\]]+\]\([^)]+\))/g;

function inline(s: string, key: string): ReactNode[] {
  const out: ReactNode[] = []; let last = 0; let i = 0;
  for (const m of s.matchAll(INLINE)) {
    if (m.index! > last) out.push(s.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('**')) out.push(<strong key={`${key}b${i}`}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith('[PLATZHALTER')) out.push(<mark key={`${key}p${i}`}>{t}</mark>);
    else { const l = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(t)!; out.push(<a key={`${key}l${i}`} className="underline" href={l[2]}>{l[1]}</a>); }
    last = m.index! + t.length; i++;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

/** Zeigt einen einfachen Text mit Überschriften (## / ###), Listen (- ), Absätzen, **fett**, Links und Platzhaltern. */
export function Legal({ title, text }: { title: string; text: string }) {
  const blocks: ReactNode[] = []; let para: string[] = []; let list: string[] = []; let n = 0;
  const flushPara = () => { if (para.length) { const k = `p${n++}`; blocks.push(<p key={k} className="leading-relaxed">{para.map((l, j) => <span key={j}>{j > 0 && <br />}{inline(l, `${k}-${j}`)}</span>)}</p>); para = []; } };
  const flushList = () => { if (list.length) { const k = `u${n++}`; blocks.push(<ul key={k} className="ml-5 list-disc space-y-1">{list.map((l, j) => <li key={j}>{inline(l, `${k}-${j}`)}</li>)}</ul>); list = []; } };
  for (const raw of text.trim().split('\n')) {
    const line = raw.trimEnd();
    if (line.startsWith('### ')) { flushPara(); flushList(); blocks.push(<h3 key={`h${n++}`} className="pt-2 font-serif text-lg">{line.slice(4)}</h3>); }
    else if (line.startsWith('## ')) { flushPara(); flushList(); blocks.push(<h2 key={`h${n++}`} className="pt-4 font-serif text-xl">{line.slice(3)}</h2>); }
    else if (line.startsWith('- ')) { flushPara(); list.push(line.slice(2)); }
    else if (line === '') { flushPara(); flushList(); }
    else { flushList(); para.push(line); }
  }
  flushPara(); flushList();
  const draft = text.includes('[PLATZHALTER');
  return (
    <article className="card mx-auto mt-6 max-w-3xl space-y-3 p-6">
      <h1 className="font-serif text-3xl">{title}</h1>
      {draft && <p role="note" className="rounded-lg border border-[var(--line)] p-3 text-sm"><strong>Entwurf:</strong> Dieser Text ist noch nicht rechtlich geprüft. Gelb markierte Stellen müssen ergänzt werden.</p>}
      {blocks}
    </article>
  );
}
