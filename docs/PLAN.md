# Bauplan – Virtueller Haustierfriedhof

Stand: v1. Grundlage: `CLAUDE.md` v2. Dieser Plan setzt die dort markierten offenen Entscheidungen auf **Standardwerte**, damit gebaut werden kann. Alle Standardwerte sind in `src/lib/config.ts` bzw. hier dokumentiert und leicht änderbar. **Review durch den Auftraggeber nötig** bei den Punkten unter „Annahmen".

## Annahmen (bitte prüfen)

| Thema | Standard im Bau | Alternative |
|---|---|---|
| Stack | Next.js (App Router), TypeScript strict, Tailwind | PHP/Laravel |
| Datenbank | SQLite (Node-eingebaut) hinter `src/server/db.ts`; Schema ist Postgres-nah | Postgres für Livebetrieb (Tausch nur in `db.ts`) |
| Dateispeicher | Lokales Verzeichnis `storage/` hinter `src/server/storage.ts` | S3-kompatibel (EU) |
| Friedhofsgrafik | Vom Auftraggeber gelieferte SVG `public/friedhofslandschaft.svg` (viewBox 1200x800), Pins als Buttons darüber | Canvas/WebGL |
| Pin-Platzierung | Automatisch auf festen Plätzen | Kunde wählt |
| Limits | 20 Bilder, 4 Videos, je 5 MB, pro Grab | pro Kunde |
| Prüfung | Vorabprüfung: öffentlich/Link-Sicht erst nach Freigabe | Nachprüfung |
| Diashow | Nur Kunde, nur Bilder (Videos später) | Videos/Besucher |
| Musik | Bibliothek leer, Einträge nur mit geklärter Lizenz | – |
| PayPal | Subscriptions API; ohne Zugangsdaten läuft ein **Test-Modus** (Mock) | – |
| E-Mail | Ausgang als Datei/Konsole im Dev, Anbieter per Umgebungsvariable | EU-Anbieter |

## Nicht erfunden / offen (Platzhalter)

- Rechtstexte (Impressum, Datenschutz, AGB, Widerruf), Text unter dem Upload (`upload.hinweis`)
- Marke/Logo/Farbwelt, Hosting, brutto/netto der Preise
- Lizenzfreie Musiktitel (Dateien und Lizenzen)
- PayPal-Zugangsdaten und Plan-IDs, Mail-Anbieter

## Meilensteine

1. **M1 Grundlage** – Projekt-Setup, DB-Schema, Registrierung/Login (E-Mail + Passwort, scrypt, HttpOnly-Session), Friedhofsübersicht (SVG) mit Pins.
2. **M2 Gräber** – Anlegen/Bearbeiten, Upload mit Limits und Typprüfung, Pin-Avatar, Grabkarte mit Galerie, Prüf-Queue (Admin).
3. **M3 Freigabe** – Sichtbarkeit (privat/Link/öffentlich), Foto-Freigabe, Anklickbarkeit, Share-Link, Open-Graph, `noindex`.
4. **M4 Bezahlung** – Abo monatlich/jährlich, PayPal-Subscription, Webhook, Kündigung, `bezahlt_bis`, Zustände.
5. **M5 Emotion** – Kerze (Todestag + 5 Tage), Todestags-Erinnerung (täglicher Job, idempotent), Diashow mit Musikauswahl.
6. **M6 Feinschliff** – Barrierefreiheit, Performance, Rechtstexte-Seiten (Platzhalter), Meldefunktion.

## Architektur

```
src/
  app/            Seiten + API-Routen
  components/     Cemetery (SVG), Pin, GraveCard, Candle, Slideshow, UploadForm
  lib/            reine Geschäftslogik, getestet (candle, subscription, limits, visibility, slots)
  server/         db, auth, storage, paypal, mail, moderation
  i18n/de.ts      Texte (Sie-Form)
tests/            Vitest
```

Grundsatz: Geschäftslogik als reine Funktionen in `src/lib`, Berechtigungen immer serverseitig in `src/server`.

## Testplan

- Unit (Vitest): Kerze (Tag 0–5, Tag 6 aus, Jahreswechsel, 29. Februar), Abo-Zugang (`bezahlt_bis`, gekündigt, abgelaufen), Upload-Limits, Sichtbarkeitsregeln, Erinnerungsdatum.
- Manuell/Browser: Registrierung → Grab anlegen → Upload → Freigabe → Besucheransicht, Mock-Abo.

## Definition of Done je Meilenstein

Typecheck, Lint, Tests grün; Eingaben validiert; Rechte serverseitig geprüft; keine Geheimnisse im Repo.

## Landschaft austauschen

Die Grafik liegt unter `public/friedhofslandschaft.svg`. Die Pin-Plätze (`src/lib/slots.ts`) und die Zeichenfläche (`SCENE` in `src/lib/config.ts`) beziehen sich auf deren viewBox 1200x800. Bei einer anderen Grafik beides anpassen. Ebenso die Brücken (`src/lib/scene.ts`) und die Bachlinie für das Wasserglitzern (`src/components/Cemetery.tsx`).
