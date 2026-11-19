import { notFound } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { all } from '@/server/db';
import { moderate, deactivateGrave } from '@/app/actions';
import { de } from '@/i18n/de';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Prüfung', robots: { index: false } };

interface Item { id: number; grave_id: number; kind: string; status: string; mod_reason: string | null; caption: string | null; name: string; deactivated: number }

export default async function Page() {
  const u = await currentUser();
  if (!u?.isAdmin) notFound();
  const items = all<Item>(`SELECT m.id, m.grave_id, m.kind, m.status, m.mod_reason, m.caption, g.name, g.deactivated
    FROM media m JOIN graves g ON g.id = m.grave_id ORDER BY CASE m.status WHEN 'pending' THEN 0 ELSE 1 END, m.id DESC LIMIT 200`);
  const reports = all<{ id: number; grave_id: number; reason: string; at: string }>('SELECT * FROM reports ORDER BY id DESC LIMIT 50');
  return (
    <div className="space-y-6 pt-4">
      <h1 className="font-serif text-3xl">Prüfung</h1>
      <p className="text-[var(--muted)]">Alle Bilder und Videos werden hier geprüft und können deaktiviert werden. Nachweis siehe Moderationsprotokoll.</p>
      <ul className="space-y-3">
        {items.map((m) => (
          <li key={m.id} className="card flex flex-wrap items-start gap-4 p-4">
            {m.kind === 'image'
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={`/api/media/${m.id}`} alt="" className="h-28 w-28 rounded-lg object-cover" />
              : <video src={`/api/media/${m.id}`} controls className="h-28 rounded-lg" />}
            <div className="flex-1 space-y-2">
              <p><strong>{m.name}</strong> · {m.status === 'pending' ? de.upload.pending : m.status === 'approved' ? 'Freigegeben' : de.upload.disabled}{m.mod_reason ? ` – ${m.mod_reason}` : ''}</p>
              <form action={moderate} className="flex flex-wrap gap-2"><input type="hidden" name="media" value={m.id} />
                <input name="reason" placeholder="Grund (bei Deaktivierung)" aria-label="Grund" className="field max-w-xs" />
                <button name="action" value="approved" className="btn">Freigeben</button>
                <button name="action" value="disabled" className="btn btn-quiet">Deaktivieren</button></form>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="text-[var(--muted)]">Keine Dateien.</li>}
      </ul>
      <section><h2 className="font-serif text-2xl">Meldungen</h2>
        <ul className="mt-2 space-y-2">{reports.map((r) => (
          <li key={r.id} className="card p-3"><p>Gedenkort {r.grave_id}: {r.reason}</p>
            <form action={deactivateGrave} className="mt-2 flex gap-2"><input type="hidden" name="id" value={r.grave_id} /><input type="hidden" name="off" value="1" />
              <input name="reason" placeholder="Grund" aria-label="Grund" className="field max-w-xs" /><button className="btn btn-quiet">Gedenkort deaktivieren</button></form></li>))}
          {reports.length === 0 && <li className="text-[var(--muted)]">Keine Meldungen.</li>}</ul></section>
    </div>
  );
}
