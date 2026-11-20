# CLAUDE.md – Virtueller Haustierfriedhof

Arbeitsanleitung für Claude Code in diesem Repository. Stand: **v2** (v1 liegt unter `docs/archiv/CLAUDE_v1.md`).
Änderungen v2: Abo ist jetzt **monatlich/jährlich mit automatischer Verlängerung** (statt 1/5/10 Jahre), Ansprache **Sie**, Upload-Limits festgelegt, Prüfung/Deaktivierung von Uploads durch das Team. Bauplan: `docs/PLAN.md`.
Mit **[ENTSCHEIDUNG]** markierte Punkte sind offene Entscheidungen des Auftraggebers – nicht eigenmächtig festlegen, sondern Optionen zeigen (siehe Abschnitt „Offene Entscheidungen").

## 1. Projektidee

Ein fiktiver, stilisierter Friedhof für Haustiere: Bäume, Wege, ein Bächlein, viel Grün. Darauf liegen die „Gräber" als anklickbare, runde Pins im Look der aktuellen Karten-Optik (Referenz: Apples „Wo ist"-App) – jeweils mit dem vom Kunden gewählten Hauptbild des Tieres.

Tonalität des Produkts: ruhig, würdevoll, warm, nie kitschig-überladen, nie reißerisch. Kein Humor im Produkt selbst.

## 2. Kernfunktionen

1. **Friedhofsübersicht** – stilisierte Landschaft mit Pins (Gräbern), zoom-/verschiebbar, mobil und Desktop.
2. **Grabkarte** – Klick auf einen Pin öffnet eine Karte (Sheet/Modal) mit Stammdaten des Tieres und Bildergalerie.
3. **Rückblick-Diashow** – für den Kunden: Diashow aller hochgeladenen Bilder mit frei wählbarer, lizenzfreier Hintergrundmusik.
4. **Freigabe & Teilen** – Kunde steuert, wer die Karte sieht und was sichtbar ist (siehe 5).
5. **Abo** – monatlich oder jährlich, automatische Verlängerung, jederzeit kündbar, Bezahlung per PayPal (siehe 6).
6. **Todestags-Erinnerung** – E-Mail-Erinnerung an den Todestag (siehe 7).
7. **Animierte Kerze** – am Todestag und 5 Tage danach auf Friedhofsübersicht und Grabkarte (siehe 8).

## 3. Rollen

| Rolle | Rechte |
|---|---|
| Besucher (anonym) | Nur freigegebene Gräber ansehen/anklicken, je nach Freigabe mit oder ohne Fotos |
| Kunde (angemeldet) | Eigene Gräber anlegen/bearbeiten, Bilder hochladen, Diashow, Freigabe, Abo verwalten |
| Admin | Kunden, Abos, Prüfung/Deaktivierung von Bildern und Videos, Meldungen, Musikbibliothek pflegen |

## 4. Fachliche Regeln – Grab & Karte

- Pflichtfelder (Vorschlag, mit Auftraggeber abstimmen): Name des Tieres, Tierart, Hauptbild.
- Optionale Felder: Rasse, Geburtsdatum, Todesdatum, Gedenktext/Widmung, Name des Besitzers (anzeigbar ja/nein), Galerie.
- **Todesdatum steuert Erinnerung und Kerze.** Ohne Todesdatum gibt es weder Erinnerung noch Kerze.
- Hauptbild wird serverseitig zu einem kreisförmigen Pin-Avatar zugeschnitten (Fokuspunkt vom Kunden wählbar), zusätzlich Original und Galerie-Größen.
- Platzierung der Pins: automatisch auf vordefinierten Plätzen entlang der Wege (kein freies Pixel-Platzieren in v1), damit die Landschaft immer ordentlich wirkt. **[ENTSCHEIDUNG]** ob der Kunde den Platz selbst wählen darf.
- Bildergalerie: Upload mehrerer Bilder, Reihenfolge änderbar, Bildunterschrift optional.
- **Upload-Limits**: max. **20 Bilder** und **4 Videos**, je Datei max. **5 MB** (Auslegung: gilt für Bilder und Videos – bestätigen). Prüfung immer serverseitig. Gilt pro Grab oder pro Kunde: **[ENTSCHEIDUNG]** (Standard im Code: pro Grab, konfigurierbar). Erlaubte Formate und max. Videolänge: **[PLATZHALTER – ergänzen]**.
- **Prüfung durch das Team**: Alle Bilder und Videos werden vom Team geprüft und können deaktiviert werden, wenn sie nicht dem vorgesehenen Zweck entsprechen oder Rechte Dritter verletzen. Status je Datei: `ausstehend` · `freigegeben` · `deaktiviert`. Deaktivierte Dateien sind für Besucher nie sichtbar; der Kunde sieht einen Hinweis. Jede Entscheidung wird protokolliert (wer, wann, Grund). **[ENTSCHEIDUNG]** Vorabprüfung (erst nach Freigabe öffentlich) oder Nachprüfung (sofort sichtbar, danach geprüft). Standard im Code: Vorabprüfung für öffentliche Sichtbarkeit.
- **Hinweistext unter dem Upload**: Direkt unter dem Bild-/Video-Upload steht ein Rechtetext. Den Wortlaut liefert der Auftraggeber: `upload.hinweis` in den Sprachdateien = **[PLATZHALTER – Text folgt vom Auftraggeber]**. Keinen eigenen Text erfinden.

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

- **Tarife**: **monatlich 7,99 € pro Monat** · **jährlich 79,99 € pro Jahr**. Ob die Preise brutto (inkl. USt) gelten: **[PLATZHALTER – klären]**.
- **Kündigung jederzeit**, Zugang bleibt bis zum Ende des bezahlten Zeitraums. **Automatische Verlängerung** im gebuchten Intervall.
- Technik: **PayPal Subscriptions API** (zwei Billing-Pläne: monatlich, jährlich). Die frühere Planung mit Einmalkauf (Orders API, 1/5/10 Jahre) ist ersetzt.
- Der Status wird **serverseitig** über Webhooks gepflegt (u. a. `BILLING.SUBSCRIPTION.ACTIVATED`, `.CANCELLED`, `.SUSPENDED`, `.EXPIRED`, `.PAYMENT.FAILED`, `PAYMENT.SALE.COMPLETED`; Eventnamen vor Livegang gegen die aktuelle PayPal-Doku prüfen). Signatur prüfen, Verarbeitung idempotent. Niemals dem Client-Ergebnis allein trauen.
- Gespeichert wird `bezahlt_bis` (Ende des aktuell bezahlten Zeitraums). Zugang besteht, solange `bezahlt_bis` in der Zukunft liegt, auch nach Kündigung.
- Abo-Zustände: `aktiv` → `gekündigt` (läuft bis `bezahlt_bis`) → `abgelaufen`. Zusätzlich `zahlung_fehlgeschlagen` (Karenz **[PLATZHALTER – Dauer]**, Hinweis-Mails). Bei `abgelaufen`: Inhalte nicht mehr öffentlich, Kunde kann neu buchen; Löschung nach Frist **[ENTSCHEIDUNG]** (Kunde vorher informieren, Export anbieten).
- Kündigung muss im Kundenkonto mit einem gut sichtbaren Kündigen-Button möglich sein (rechtlich prüfen lassen, Stichwort Kündigungsbutton bei Online-Verträgen).
- Wechsel Monat ↔ Jahr: **[ENTSCHEIDUNG]** (Verrechnung, Zeitpunkt).
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
- **Zahlung**: PayPal Subscriptions API + Webhooks
- **Tests**: Vitest (Unit), Playwright (E2E, inkl. PayPal-Sandbox-Flow)
- Hosting in der EU, **[PLATZHALTER – Hostinganbieter ergänzen]**

Grundregeln für den Code:

- TypeScript strict, ESLint + Prettier, keine `any` ohne Begründung.
- Zeit/Datum: intern UTC speichern, Todesdatum als reines Datum (ohne Uhrzeit) speichern, Berechnungen in expliziter Zeitzone.
- Geschäftslogik (Kerze, Abo-Laufzeit, Erinnerungsdatum) in eigenen, getesteten Modulen, nicht in UI-Komponenten.
- Berechtigungen immer serverseitig prüfen, nie nur im UI verstecken.
- **Registrierung mit E-Mail-Bestätigung:** Konten sind erst nach Klick auf den Link in der Bestätigungs-Mail nutzbar (Link 24 h gültig, einmalig, erneuter Versand höchstens einmal pro Minute, gleiche Antwort für unbekannte Adressen). Dafür ist SMTP nötig (`SMTP_*`, `MAIL_FROM`).
- **Passwort zurücksetzen:** Link per Mail (60 Minuten gültig, einmalig, höchstens eine Mail pro Minute, gleiche Antwort für unbekannte Adressen). Nach dem Zurücksetzen werden alle Sitzungen abgemeldet und eine Hinweis-Mail geschickt. Unbestätigte Konten erhalten stattdessen die Bestätigungs-Mail.
- Eingaben validieren (z. B. zod), Uploads auf Typ/Größe prüfen, EXIF-Metadaten (Standort!) beim Verarbeiten entfernen.
- Performance: Bilder responsiv und lazy laden (WebP/AVIF), Übersicht mit großen Datenmengen (viele Gräber) virtualisieren oder nachladen. Zielwerte: **[PLATZHALTER – ergänzen]**.

## 12. Datenschutz & Recht (Deutschland/EU)

Kein Rechtsrat – vor Livegang juristisch prüfen lassen.

- DSGVO: Verzeichnis der Verarbeitungstätigkeiten, Auftragsverarbeitungsverträge (Hosting, E-Mail, Speicher), Löschkonzept, Auskunft/Export/Löschung für Kunden.
- PayPal als Zahlungsdienst in der Datenschutzerklärung nennen.
- Cookie/Consent: nur technisch notwendige Cookies ohne Banner; für Analyse/Einbettungen Einwilligung einholen. Social-Buttons als Link/2-Klick-Lösung, keine Tracker beim bloßen Laden.
- Pflichtseiten: Impressum, Datenschutzerklärung, AGB, Widerrufsbelehrung (digitale Leistung, Abo mit automatischer Verlängerung), Kündigungsbutton. Inhalte: **[PLATZHALTER – von Auftraggeber/Jurist liefern lassen]**.
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
- Texte im Produkt: ruhig, verständlich, einfühlsam, **Sie-Form** (entschieden).
- Keine bestehenden Dateien löschen; bei größeren Umbauten Alternativen als neue Datei/Version anlegen.

## 15. Offene Entscheidungen (Auftraggeber)

| # | Thema | Optionen (Kurz) |
|---|---|---|
| 1 | Technik-Stack | Empfehlung Next.js/Postgres (schnell, großes Ökosystem) · Alternative: klassisches PHP/Laravel (einfach bei Standard-Hosting, weniger interaktiv) |
| 2 | Friedhofsgrafik | SVG (leicht, scharf, einfacher zu pflegen) · Canvas/WebGL (flüssiger bei vielen Pins, aufwendiger) |
| 3 | Pin-Platzierung | Automatisch auf festen Plätzen (ordentlich, wenig Aufwand) · Kunde wählt Platz (persönlicher, Verwaltungsaufwand) |
| 4 | Wechsel Monat ↔ Jahr | Sofort mit anteiliger Verrechnung · zum nächsten Abrechnungszeitraum (einfacher) |
| 5 | Ablauf eines Abos | Karenzfrist und Löschfrist festlegen, Export anbieten |
| 6 | Musik | Nur kuratierte lizenzfreie Bibliothek (rechtssicher) · zusätzlich Eigen-Upload (flexibel, Rechterisiko) |
| 7 | Diashow für Besucher | Nur Kunde (v1) · auch Besucher bei Freigabe |
| 8 | Ansprache | **Entschieden: Sie** |
| 9 | Preise, Limits | **Entschieden**: 7,99 €/Monat, 79,99 €/Jahr, 20 Bilder, 4 Videos, je 5 MB. Offen: brutto/netto, Marke, Hosting |
| 10 | Prüfung von Uploads | Vorabprüfung (sicher, Verzögerung für Kunden) · Nachprüfung (sofort sichtbar, Risiko kurzzeitig) |
| 11 | Limits | Pro Grab · pro Kunde; Anzahl Gräber pro Abo |
| 12 | Videos in der Diashow | Ja · nur Bilder |

## 16. Meilensteine (Vorschlag)

1. **M1 Grundlage**: Projekt-Setup, Datenmodell, Auth, Friedhofsübersicht mit Dummy-Pins
2. **M2 Gräber**: Anlegen/Bearbeiten, Bild-/Video-Upload mit Limits, Prüf-Queue, Pin-Avatar, Grabkarte mit Galerie
3. **M3 Freigabe**: Sichtbarkeitsstufen, Share-Links, Social-Vorschau
4. **M4 Bezahlung**: PayPal-Abo (Monat/Jahr), Webhooks, Kündigung, Zahlungsausfall-Mails
5. **M5 Emotion**: Kerze, Todestags-Erinnerung, Diashow mit Musikbibliothek
6. **M6 Feinschliff**: Barrierefreiheit, Performance, Rechtstexte, Moderation, Livegang

## 17. Stand der Umsetzung (v2)

Gebaut und getestet: Konten, Gedenkorte, Upload mit Limits und Typprüfung, Prüf-Queue (Admin), Freigabestufen, Share-Seite mit `noindex`, Kerze, Erinnerungs-Job, Rückblick-Diashow, PayPal-Subscriptions-Anbindung mit Test-Modus. Details und Befehle: `README.md`, Annahmen: `docs/PLAN.md`.
Noch nicht live geprüft (braucht echte Zugangsdaten): PayPal-Sandbox/Live, SMTP-Versand der Mails (lokal nur als Datei geprüft), Hosting. Videos sind hochladbar, aber nicht in der Diashow.
