# Haustierfriedhof (virtuell)

Fiktiver, stilisierter Gedenkort für Haustiere: Friedhofsübersicht mit runden Pins, Grabkarten mit Galerie, Rückblick-Diashow, Freigabe/Teilen, Abo (monatlich/jährlich, PayPal), Todestags-Erinnerung und animierte Kerze.

Projektregeln: `CLAUDE.md` · Bauplan und Annahmen: `docs/PLAN.md`

## Start

```bash
npm install
cp .env.example .env.local   # Werte eintragen, nichts committen
npm run dev                  # http://localhost:3000
```

- Ohne PayPal-Zugangsdaten läuft ein **Test-Modus** (Zahlung wird simuliert, unter `/konto/abo/test`).
- **E-Mail-Bestätigung:** Neue Konten müssen ihre Adresse per Link bestätigen. Lokal ohne SMTP landen die Mails als Datei in `storage/outbox/` (und ein Hinweis im Protokoll); den Bestätigungslink aus dieser Datei im Browser öffnen. Für echten Versand `SMTP_*` und `MAIL_FROM` setzen (`.env.example`).
- Admin-Zugang (Prüfung von Bildern/Videos): E-Mail in `ADMIN_EMAILS` eintragen, dann dort registrieren.
- Daten: SQLite unter `data/`, Uploads unter `storage/` (beides nicht im Repo). Für den Livebetrieb Postgres und S3-kompatiblen Speicher vorsehen (Tausch in `src/server/db.ts` und `src/server/storage.ts`).

## Befehle

| Befehl | Zweck |
|---|---|
| `npm run typecheck` | TypeScript prüfen |
| `npm run lint` | ESLint |
| `npm test` | Unit-Tests (Kerze, Abo, Limits, Sichtbarkeit) |
| `npm run build` | Produktions-Build |

## Hosting-Test (mittwald, HTTPS)

Anleitung: `docs/DEPLOY_MITTWALD.md` (App lauscht auf `PORT`, HTTPS übernimmt der Hoster; auch als `Dockerfile`).

## Täglicher Job (Erinnerungen)

Einmal täglich aufrufen: `curl -H "Authorization: Bearer $CRON_SECRET" $APP_URL/api/cron/reminders`

## Noch offen (Platzhalter im Code)

Rechtstexte, Hinweistext unter dem Upload (`src/i18n/de.ts`), Markenname/Logo, lizenzfreie Musik (`src/lib/music.ts`), Mail-Anbieter (`src/server/mail.ts`), PayPal-Plan-IDs und Webhook-ID, Karenzdauer bei Zahlungsausfall, Hosting.
