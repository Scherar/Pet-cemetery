# CLAUDE.md – Virtueller Haustierfriedhof

Arbeitsanleitung für Claude Code in diesem Repository. Stand: v1 (Projektstart, noch kein Code vorhanden).
Mit **[ENTSCHEIDUNG]** markierte Punkte sind offene Entscheidungen des Auftraggebers – nicht eigenmächtig festlegen, sondern Optionen zeigen (siehe Abschnitt „Offene Entscheidungen").

## 1. Projektidee

Ein fiktiver, stilisierter Friedhof für Haustiere: Bäume, Wege, ein Bächlein, viel Grün. Darauf liegen die „Gräber" als anklickbare, runde Pins im Look der aktuellen Karten-Optik (Referenz: Apples „Wo ist"-App) – jeweils mit dem vom Kunden gewählten Hauptbild des Tieres.

Tonalität des Produkts: ruhig, würdevoll, warm, nie kitschig-überladen, nie reißerisch. Kein Humor im Produkt selbst.

## 2. Kernfunktionen

1. **Friedhofsübersicht** – stilisierte Landschaft mit Pins (Gräbern), zoom-/verschiebbar, mobil und Desktop.
2. **Grabkarte** – Klick auf einen Pin öffnet eine Karte (Sheet/Modal) mit Stammdaten des Tieres und Bildergalerie.
3. **Rückblick-Diashow** – für den Kunden: Diashow aller hochgeladenen Bilder mit frei wählbarer, lizenzfreier Hintergrundmusik.
4. **Freigabe & Teilen** – Kunde steuert, wer die Karte sieht und was sichtbar ist (siehe 5).
5. **Abo mit Laufzeit** – 1, 5 oder 10 Jahre, Bezahlung per PayPal (siehe 6).
6. **Todestags-Erinnerung** – E-Mail-Erinnerung an den Todestag (siehe 7).
7. **Animierte Kerze** – am Todestag und 5 Tage danach auf Friedhofsübersicht und Grabkarte (siehe 8).

## 3. Rollen

| Rolle | Rechte |
|---|---|
| Besucher (anonym) | Nur freigegebene Gräber ansehen/anklicken, je nach Freigabe mit oder ohne Fotos |
| Kunde (angemeldet) | Eigene Gräber anlegen/bearbeiten, Bilder hochladen, Diashow, Freigabe, Abo verwalten |
| Admin | Kunden, Abos, Moderation/Meldungen, Musikbibliothek pflegen |

## 4. Fachliche Regeln – Grab & Karte

- Pflichtfelder (Vorschlag, mit Auftraggeber abstimmen): Name des Tieres, Tierart, Hauptbild.
- Optionale Felder: Rasse, Geburtsdatum, Todesdatum, Gedenktext/Widmung, Name des Besitzers (anzeigbar ja/nein), Galerie.
- **Todesdatum steuert Erinnerung und Kerze.** Ohne Todesdatum gibt es weder Erinnerung noch Kerze.
- Hauptbild wird serverseitig zu einem kreisförmigen Pin-Avatar zugeschnitten (Fokuspunkt vom Kunden wählbar), zusätzlich Original und Galerie-Größen.
- Platzierung der Pins: automatisch auf vordefinierten Plätzen entlang der Wege (kein freies Pixel-Platzieren in v1), damit die Landschaft immer ordentlich wirkt. **[ENTSCHEIDUNG]** ob der Kunde den Platz selbst wählen darf.
- Bildergalerie: Upload mehrerer Bilder, Reihenfolge änderbar, Bildunterschrift optional. Limits (Anzahl/Größe pro Grab und Tarif): **[PLATZHALTER – echten Wert ergänzen]**.

## 5. Freigabe & Teilen

Pro Grab, vom Kunden einstellbar:

- **Sichtbarkeit**: privat (nur Kunde) · nur über Link (nicht auffindbar) · öffentlich auf dem Friedhof.
- **Anklickbar**: Pin auf der Übersicht für Besucher klickbar ja/nein.
- **Fotos**: Karte für Besucher mit oder ohne Galerie/Hauptbild-Vergrößerung.
- **Teilen**: Share-Link mit Vorschau (Open Graph/Twitter Cards), Teilen-Schaltflächen für Social Media und System-Share (Web Share API auf Mobilgeräten).
- Geteilte Links nutzen unratbare Tokens, keine fortlaufenden IDs.
- Nicht öffentliche Gräber: `noindex`, nie in Sitemap, nie in der öffentlichen Übersicht.
- Freigabe ist jederzeit widerrufbar; Widerruf wirkt sofort (Caches/Vorschaubilder berücksichtigen).
- Social-Vorschaubilder zeigen nur dann das Foto, wenn „mit Fotos" freigegeben ist.

## 6. Abo & Bezahlung (PayPal)

- Laufzeitmodelle: **1 Jahr, 5 Jahre, 10 Jahre**. Preise: **[PLATZHALTER – echten Wert ergänzen]**.
- Technisch ist das ein **einmaliger Kauf mit Laufzeit**, kein wiederkehrendes PayPal-Abo → PayPal **Orders API v2** (Checkout) verwenden, nicht die Subscriptions API. **[ENTSCHEIDUNG]** ob später eine automatische Verlängerung angeboten wird.
- Zahlung wird **serverseitig** verifiziert (Capture + Webhook `PAYMENT.CAPTURE.COMPLETED`). Niemals dem Client-Ergebnis allein trauen. Webhooks idempotent verarbeiten, Signatur prüfen.
- Laufzeit startet mit bestätigter Zahlung: `gültig_bis = Zahlungszeitpunkt + Laufzeit` (Verlängerung vor Ablauf addiert auf das bestehende `gültig_bis`).
- Abo-Zustände: `aktiv` → `läuft_bald_ab` (Hinweis-Mails, Zeitpunkte **[PLATZHALTER]**) → `abgelaufen` (Karenzfrist, Inhalte nicht mehr öffentlich, Kunde kann verlängern) → `gelöscht` (nach Frist, **[ENTSCHEIDUNG]** Dauer, Kunde vorher informieren und Export anbieten).
- Rechnungen/Belege per E-Mail; steuerliche Behandlung klären: **[PLATZHALTER – mit Steuerberater klären]**.
- PayPal-Zugangsdaten nur über Umgebungsvariablen, getrennt für Sandbox und Live. Nie ins Repo.

## 7. Todestags-Erinnerung

- Opt-in pro Grab (Double-Opt-in bei neuer Adresse), jederzeit abbestellbar, Abmeldelink in jeder Mail.
- Versand am Todestag zu fester Uhrzeit in der Zeitzone des Kunden (Standard `Europe/Berlin`).
- Sonderfall 29. Februar: in Nicht-Schaltjahren am 28. Februar erinnern.
- Täglicher Job (Cron/Scheduler), **idempotent**: pro Grab und Jahr höchstens eine Mail (Versandprotokoll führen).
- Text: ruhig, kurz, würdevoll, mit Link zum Grab. Keine Werbung in der Erinnerungsmail.
- Nur für Gräber mit aktivem Abo.

## 8. Animierte Kerze

- Sichtbar **am Todestag und an den 5 Folgetagen** (insgesamt 6 Kalendertage), auf der Friedhofsübersicht (am Pin) und auf der Grabkarte.
- Berechnung nach Kalendertagen in der Zeitzone des Grabes/Kunden, nicht nach 24-Stunden-Blöcken. Für Besucher dieselbe Regel (feste Zeitzone, damit alle dasselbe sehen). 29.-Februar-Regel wie in Abschnitt 7.
- Umsetzung: leichtgewichtig mit SVG/CSS (flackernde Flamme, sanfter Glow), kein Video.
- `prefers-reduced-motion` respektieren: dann statische Kerze, keine Flackeranimation.
- Kerze erscheint nur, wenn das Grab für den Betrachter sichtbar ist.
- Logik als reine Funktion (`isCandleActive(todesdatum, heute, zeitzone)`) mit Unit-Tests: Jahreswechsel, Schaltjahr, Tag 0 bis Tag 5, Tag 6 = aus.

## 9. Diashow (Rückblick) & Musik

- Nur für den Kunden (Besucher-Diashow ist ein möglicher späterer Ausbau, **[ENTSCHEIDUNG]**).
- Vollbild, Steuerung (Pause, vor/zurück, Lautstärke), Überblendungen, Tastatur- und Touch-Bedienung.
- Hintergrundmusik: Auswahl aus einer **kuratierten Bibliothek lizenzfreier Titel** (z. B. CC0 / Public Domain / ausdrücklich kommerziell nutzbar). Pro Titel Lizenz, Quelle und Urheber im Datensatz speichern und die erforderliche Namensnennung anzeigen. Keine Titel ohne geklärte Lizenz aufnehmen.
- Kein Upload eigener, möglicherweise urheberrechtlich geschützter Musik in v1. **[ENTSCHEIDUNG]** falls gewünscht (dann Haftungs-/Rechtefrage klären).
- Autoplay-Regeln der Browser beachten: Musik startet erst nach Nutzeraktion.
- Musikdateien: Liste und Lizenzen **[PLATZHALTER – echte Titel und Quellen ergänzen]**.

## 10. Design & UX

- **Look**: stilisiert, ruhig, viel Grün; Bäume, Wege, Bach als Illustration (SVG oder Canvas/WebGL, **[ENTSCHEIDUNG]**). Keine echte Kartenkachel-Karte.
- **Pins**: rund, Hauptbild als Avatar, weißer Rand, weicher Schatten, leichte Skalierung bei Hover/Fokus, Pin-Cluster bei geringem Zoom vermeiden (feste Plätze lösen das).
- **Grabkarte**: Bottom-Sheet mobil, Seitenpanel/Modal am Desktop, Schließen per Geste, Esc und Button.
- Mobile first. Touch-Ziele ≥ 44 px. Schriften serifenbetont-warm für Texte, klare Sans für UI (**[ENTSCHEIDUNG]** Schriftwahl).
- Farbwelt, Logo, Name der Marke: **[PLATZHALTER – vom Auftraggeber ergänzen]**.
- Animationen sparsam (Bach, Blätter, Kerze), alles abschaltbar über `prefers-reduced-motion`.
- Barrierefreiheit: WCAG 2.1 AA als Ziel. Pins sind echte Buttons mit Namen als Label, Tastaturnavigation über alle Gräber, Fokus sichtbar, Alt-Texte für Galeriebilder (Kunde kann sie pflegen), ausreichend Kontrast.
- Sprache der Oberfläche: Deutsch. Texte in Sprachdateien (i18n-fähig), nicht fest im Code.
- Gedenk-Kontext: Fehler- und Hinweistexte besonders einfühlsam formulieren, keine Fachjargon-Fehlermeldungen.

## 11. Technik (Vorschlag – bestätigen lassen)

**[ENTSCHEIDUNG]** Stack. Empfehlung, falls nichts anderes vorgegeben wird:

- **Frontend/Fullstack**: Next.js (App Router) + TypeScript (strict), Tailwind CSS
- **Datenbank**: PostgreSQL mit Prisma (oder Drizzle)
- **Dateispeicher**: S3-kompatibler Objektspeicher (EU-Region), Bilder serverseitig skalieren (z. B. `sharp`), signierte Upload-URLs
- **Auth**: E-Mail + Passwort bzw. Magic Link; Sessions per HttpOnly-Cookie
- **E-Mail**: transaktionaler Dienst mit EU-Datenhaltung
- **Jobs**: Scheduler für Erinnerungen und Abo-Fristen (z. B. Cron-Endpoint oder Queue)
- **Zahlung**: PayPal Orders API v2 + Webhooks
- **Tests**: Vitest (Unit), Playwright (E2E, inkl. PayPal-Sandbox-Flow)
- Hosting in der EU, **[PLATZHALTER – Hostinganbieter ergänzen]**

Grundregeln für den Code:

- TypeScript strict, ESLint + Prettier, keine `any` ohne Begründung.
- Zeit/Datum: intern UTC speichern, Todesdatum als reines Datum (ohne Uhrzeit) speichern, Berechnungen in expliziter Zeitzone.
- Geschäftslogik (Kerze, Abo-Laufzeit, Erinnerungsdatum) in eigenen, getesteten Modulen, nicht in UI-Komponenten.
- Berechtigungen immer serverseitig prüfen, nie nur im UI verstecken.
- Eingaben validieren (z. B. zod), Uploads auf Typ/Größe prüfen, EXIF-Metadaten (Standort!) beim Verarbeiten entfernen.
- Performance: Bilder responsiv und lazy laden (WebP/AVIF), Übersicht mit großen Datenmengen (viele Gräber) virtualisieren oder nachladen. Zielwerte: **[PLATZHALTER – ergänzen]**.

## 12. Datenschutz & Recht (Deutschland/EU)

Kein Rechtsrat – vor Livegang juristisch prüfen lassen.

- DSGVO: Verzeichnis der Verarbeitungstätigkeiten, Auftragsverarbeitungsverträge (Hosting, E-Mail, Speicher), Löschkonzept, Auskunft/Export/Löschung für Kunden.
- PayPal als Zahlungsdienst in der Datenschutzerklärung nennen.
- Cookie/Consent: nur technisch notwendige Cookies ohne Banner; für Analyse/Einbettungen Einwilligung einholen. Social-Buttons als Link/2-Klick-Lösung, keine Tracker beim bloßen Laden.
- Pflichtseiten: Impressum, Datenschutzerklärung, AGB, Widerrufsbelehrung (digitale Leistung, Laufzeitprodukt). Inhalte: **[PLATZHALTER – von Auftraggeber/Jurist liefern lassen]**.
- Gedenkinhalte sind sensibel: Melde-Funktion für Missbrauch (Beleidigendes, fremde Fotos), Admin-Moderation.
- Hochgeladene Bilder: Kunde bestätigt, dass er die Rechte an den Bildern hat.
- Hinweis: Es handelt sich um einen **fiktiven** Friedhof. Keine Aussage, die wie ein echter Bestattungsort, eine Bestattung oder eine Urnenbeisetzung klingt, ohne klare Kennzeichnung.

## 13. Projektstruktur (Zielbild)

```
/
├─ CLAUDE.md
├─ README.md            # Setup, Start, Deployment
├─ docs/                # Entscheidungen (ADR), Datenmodell, Rechtstexte-Entwürfe
├─ src/
│  ├─ app/              # Routen/Seiten
│  ├─ components/       # UI (Karte, Pin, Grabkarte, Galerie, Diashow, Kerze)
│  ├─ lib/              # Geschäftslogik (candle, subscription, reminders, sharing)
│  ├─ server/           # DB, Payments, Mail, Storage, Jobs
│  └─ i18n/             # Texte
├─ prisma/ (o. ä.)      # Schema, Migrationen
├─ public/              # Illustrationen, Musik-Metadaten
└─ tests/
```

## 14. Arbeitsweise für Claude

- Vor Änderungen die relevanten Dateien lesen; kleine, nachvollziehbare Commits.
- Entwicklungsbranch: `claude/busy-feynman-5x9l4b`. Nur dorthin pushen.
- Keine erfundenen Preise, Rechtstexte, Lizenzen oder Zahlen. Fehlt ein echter Wert: `[PLATZHALTER – echten Wert/Beleg ergänzen]`.
- Bei echten Produkt- oder Designentscheidungen (siehe unten) Optionen mit Vor- und Nachteilen vorlegen, nicht selbst festlegen.
- Geheimnisse (PayPal-Keys, DB-Zugang, Mail-Keys) nie committen; `.env.example` ohne Werte pflegen.
- Neue Geschäftslogik nur mit Tests. Vor dem Abschluss: Lint, Typecheck, Tests laufen lassen.
- Texte im Produkt: ruhig, verständlich, einfühlsam, du/Sie-Form **[ENTSCHEIDUNG]**.
- Keine bestehenden Dateien löschen; bei größeren Umbauten Alternativen als neue Datei/Version anlegen.

## 15. Offene Entscheidungen (Auftraggeber)

| # | Thema | Optionen (Kurz) |
|---|---|---|
| 1 | Technik-Stack | Empfehlung Next.js/Postgres (schnell, großes Ökosystem) · Alternative: klassisches PHP/Laravel (einfach bei Standard-Hosting, weniger interaktiv) |
| 2 | Friedhofsgrafik | SVG (leicht, scharf, einfacher zu pflegen) · Canvas/WebGL (flüssiger bei vielen Pins, aufwendiger) |
| 3 | Pin-Platzierung | Automatisch auf festen Plätzen (ordentlich, wenig Aufwand) · Kunde wählt Platz (persönlicher, Verwaltungsaufwand) |
| 4 | Abo-Modell | Einmalkauf mit Laufzeit (einfach, wie beauftragt) · später optionale Auto-Verlängerung (mehr Umsatz, mehr Komplexität/Recht) |
| 5 | Ablauf eines Abos | Karenzfrist und Löschfrist festlegen, Export anbieten |
| 6 | Musik | Nur kuratierte lizenzfreie Bibliothek (rechtssicher) · zusätzlich Eigen-Upload (flexibel, Rechterisiko) |
| 7 | Diashow für Besucher | Nur Kunde (v1) · auch Besucher bei Freigabe |
| 8 | Ansprache | Du · Sie |
| 9 | Preise, Bildlimits, Marke, Hosting | Alles **[PLATZHALTER – Werte ergänzen]** |

## 16. Meilensteine (Vorschlag)

1. **M1 Grundlage**: Projekt-Setup, Datenmodell, Auth, Friedhofsübersicht mit Dummy-Pins
2. **M2 Gräber**: Anlegen/Bearbeiten, Bild-Upload & Pin-Avatar, Grabkarte mit Galerie
3. **M3 Freigabe**: Sichtbarkeitsstufen, Share-Links, Social-Vorschau
4. **M4 Bezahlung**: PayPal-Checkout, Webhooks, Laufzeitlogik, Ablauf-Mails
5. **M5 Emotion**: Kerze, Todestags-Erinnerung, Diashow mit Musikbibliothek
6. **M6 Feinschliff**: Barrierefreiheit, Performance, Rechtstexte, Moderation, Livegang
