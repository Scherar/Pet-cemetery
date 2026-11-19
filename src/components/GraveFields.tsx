import type { GraveRow } from '@/server/domain';

export function GraveFields({ g }: { g?: GraveRow }) {
  return (
    <>
      <div><label htmlFor="name">Name des Tieres *</label><input id="name" name="name" required maxLength={80} defaultValue={g?.name} className="field" /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label htmlFor="species">Tierart *</label><input id="species" name="species" required maxLength={60} defaultValue={g?.species} className="field" /></div>
        <div><label htmlFor="breed">Rasse</label><input id="breed" name="breed" maxLength={80} defaultValue={g?.breed ?? ''} className="field" /></div>
        <div><label htmlFor="birth_date">Geboren</label><input id="birth_date" name="birth_date" type="date" defaultValue={g?.birth_date ?? ''} className="field" /></div>
        <div><label htmlFor="death_date">Verstorben</label><input id="death_date" name="death_date" type="date" defaultValue={g?.death_date ?? ''} className="field" /></div>
      </div>
      <div><label htmlFor="memo">Gedenktext</label><textarea id="memo" name="memo" rows={5} maxLength={2000} defaultValue={g?.memo ?? ''} className="field" /></div>
      <div><label htmlFor="owner_name">Ihr Name (optional)</label><input id="owner_name" name="owner_name" maxLength={80} defaultValue={g?.owner_name ?? ''} className="field" /></div>
      <label className="flex items-center gap-2"><input type="checkbox" name="show_owner" defaultChecked={!!g?.show_owner} /> Meinen Namen auf der Karte anzeigen</label>
    </>
  );
}
