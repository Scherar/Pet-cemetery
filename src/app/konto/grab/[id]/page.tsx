import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { graveById, mediaOfGrave, userHasAccess } from '@/server/domain';
import { saveGrave, saveSharing, newShareToken, uploadMedia, removeMedia, setMainMedia, saveAlt, saveReminder } from '@/app/actions';
import { GraveFields } from '@/components/GraveFields';
import { ShareButtons } from '@/components/ShareButtons';
import { appUrl } from '@/server/paypal';
import { de } from '@/i18n/de';
import { LIMITS } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Gedenkort bearbeiten' };

const modLabel = { pending: de.upload.pending, approved: 'Freigegeben', disabled: de.upload.disabled } as const;

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ fehler?: string; ok?: string }> }) {
  const u = await currentUser();
  if (!u) redirect('/anmelden');
  const { id } = await params; const sp = await searchParams;
  const g = graveById(Number(id));
  if (!g || (g.user_id !== u.id && !u.isAdmin)) notFound();
  const media = mediaOfGrave(g.id);
  const access = userHasAccess(g.user_id);
  const url = `${appUrl()}/grab/${g.id}?t=${g.share_token}`;
  const images = media.filter((m) => m.kind === 'image').length;
  const videos = media.filter((m) => m.kind === 'video').length;
  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-4">
      <div className="flex items-center justify-between"><h1 className="font-serif text-3xl">{g.name}</h1>
        <Link className="underline" href="/konto">Zurück</Link></div>
      {sp.fehler && <p role="alert" className="text-red-700">{sp.fehler}</p>}
      {sp.ok && <p role="status" className="card p-3">{sp.ok === 'bestaetigung' ? 'Bitte bestätigen Sie die Erinnerung über den Link in der E-Mail.' : 'Gespeichert.'}</p>}
      {!access && <p role="alert" className="card p-3">{de.abo.noAccess} <Link className="underline" href="/konto/abo">Abo abschließen</Link></p>}
      {g.deactivated ? <p role="alert" className="card p-3">Dieser Gedenkort wurde vom Team deaktiviert. Bitte wenden Sie sich an uns.</p> : null}

      <form action={saveGrave} className="card space-y-4 p-5"><h2 className="font-serif text-xl">Angaben</h2>
        <input type="hidden" name="id" value={g.id} /><GraveFields g={g} /><button className="btn">Speichern</button></form>

      <section className="card space-y-4 p-5" aria-labelledby="medien">
        <h2 id="medien" className="font-serif text-xl">Bilder und Videos ({images}/{LIMITS.maxImages} Bilder, {videos}/{LIMITS.maxVideos} Videos)</h2>
        <form action={uploadMedia} className="space-y-2">
          <input type="hidden" name="id" value={g.id} />
          <div><label htmlFor="files">Dateien auswählen</label><input id="files" name="files" type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" className="field" /></div>
          <div><label htmlFor="caption">Bildunterschrift (optional)</label><input id="caption" name="caption" maxLength={140} className="field" /></div>
          <button className="btn">Hochladen</button>
          <p className="text-sm text-[var(--muted)]">{de.upload.limits}</p>
          {/* Rechtetext direkt unter dem Upload – Wortlaut folgt vom Auftraggeber */}
          <p className="text-sm" data-testid="upload-hinweis">{de.upload.hinweis}</p>
        </form>
        <ul className="space-y-3">
          {media.map((m) => (
            <li key={m.id} className="flex flex-wrap items-start gap-3 border-t border-[var(--line)] pt-3">
              {m.kind === 'image'
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={`/api/media/${m.id}?v=pin&t=${g.share_token}`} alt="" className="h-16 w-16 rounded-lg object-cover" />
                : <span className="grid h-16 w-16 place-items-center rounded-lg bg-black/10 text-xs">Video</span>}
              <div className="flex-1 space-y-2">
                <p className="text-sm"><strong>{modLabel[m.status]}</strong>{m.status === 'disabled' && m.mod_reason ? ` – ${m.mod_reason}` : ''}{g.main_media_id === m.id ? ' · Hauptbild' : ''}</p>
                <form action={saveAlt} className="flex flex-wrap gap-2"><input type="hidden" name="media" value={m.id} />
                  <input name="caption" defaultValue={m.caption ?? ''} placeholder="Unterschrift" aria-label="Unterschrift" className="field max-w-[12rem]" />
                  <input name="alt" defaultValue={m.alt ?? ''} placeholder="Bildbeschreibung (Alt-Text)" aria-label="Bildbeschreibung" className="field max-w-[14rem]" />
                  <button className="btn btn-quiet">Speichern</button></form>
                <div className="flex gap-2">
                  {m.kind === 'image' && g.main_media_id !== m.id && <form action={setMainMedia}><input type="hidden" name="media" value={m.id} /><button className="btn btn-quiet">Als Hauptbild</button></form>}
                  <form action={removeMedia}><input type="hidden" name="media" value={m.id} /><button className="btn btn-quiet">Löschen</button></form>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {images > 0 && <Link className="btn" href={`/konto/grab/${g.id}/rueckblick`}>Rückblick ansehen</Link>}
      </section>

      <form action={saveSharing} className="card space-y-3 p-5"><h2 className="font-serif text-xl">Freigabe</h2>
        <input type="hidden" name="id" value={g.id} />
        <div><label htmlFor="visibility">Wer darf diesen Gedenkort sehen?</label>
          <select id="visibility" name="visibility" defaultValue={g.visibility} className="field">
            <option value="private">Nur ich (privat)</option><option value="link">Nur Personen mit Link</option><option value="public">Öffentlich auf dem Friedhof</option></select></div>
        <label className="flex items-center gap-2"><input type="checkbox" name="clickable" defaultChecked={!!g.clickable} /> Besucher dürfen den Gedenkort anklicken</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="show_photos" defaultChecked={!!g.show_photos} /> Fotos und Videos für Besucher zeigen (nach Prüfung durch das Team)</label>
        <button className="btn">Freigabe speichern</button>
        {g.visibility !== 'private' && (<div className="space-y-2 border-t border-[var(--line)] pt-3">
          <p className="break-all text-sm">{url}</p><ShareButtons url={url} title={`Gedenkort für ${g.name}`} /></div>)}
      </form>
      <form action={newShareToken} className="card p-5"><input type="hidden" name="id" value={g.id} />
        <p className="mb-2 text-sm text-[var(--muted)]">Neuer Link: macht den bisherigen Link sofort ungültig.</p><button className="btn btn-quiet">Link erneuern</button></form>

      <form action={saveReminder} className="card space-y-3 p-5"><h2 className="font-serif text-xl">Erinnerung am Todestag</h2>
        <input type="hidden" name="id" value={g.id} />
        <div><label htmlFor="remind_email">E-Mail-Adresse für die Erinnerung (leer lassen zum Abschalten)</label>
          <input id="remind_email" name="remind_email" type="email" defaultValue={g.remind_email ?? ''} className="field" /></div>
        <p className="text-sm text-[var(--muted)]">{g.remind && !g.remind_confirmed ? 'Bestätigung steht noch aus.' : g.remind ? 'Erinnerung ist aktiv.' : 'Sie erhalten einmal im Jahr eine ruhige Erinnerung. Zuvor bitten wir um Ihre Bestätigung per E-Mail.'}</p>
        <button className="btn">Speichern</button></form>
    </div>
  );
}
